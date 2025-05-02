import { APIGatewayProxyEvent, Handler, LambdaFunctionURLEvent } from 'aws-lambda';
import { Resource } from 'sst';
import { Stripe } from 'stripe';
const stripe = new Stripe(Resource.STRIPE_SECRET.value);

const PRICE_PER_SEAT = 50;
const MINIMUM_SEATS = 60;

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const data = {
      url: "",
    };
  
    if (event.body != null) {
      Object.assign(data, JSON.parse(event.body));
    } else throw new Error("No body provided");

    let pid;

    const product = await stripe.products.search({
      query: `name~"Educatr Organisation Subscription"`,
    });

    if (product.data.length === 0) {
      const product = await stripe.products.create({
        name: "Educatr Organisation Subscription",
      });
      const price = await stripe.prices.create({
        currency: 'gbp',
        recurring: {
          interval: 'month',
          usage_type: 'licensed',
        },
        product: product.id,
        tiers_mode: 'volume',
        billing_scheme: 'tiered',
        tiers: [
          {
            unit_amount: 0,
            up_to: MINIMUM_SEATS,
            flat_amount: PRICE_PER_SEAT * MINIMUM_SEATS,
          },
          {
            unit_amount: PRICE_PER_SEAT,
            up_to: 'inf',
            flat_amount: PRICE_PER_SEAT * MINIMUM_SEATS,
          },
        ],
      });
      await stripe.products.update(
        product.id,
        {
          default_price: price.id,
        }
      );
      pid = price.id;
    } else pid = product.data[0].default_price;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: pid as string,
          quantity: 5
        },
      ],
      mode: 'subscription',
      success_url: `${data.url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.url}/cancel`,
      client_reference_id: event.requestContext.authorizer!.jwt.claims["cognito:username"],
      allow_promotion_codes: true,
    });
  
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
};
