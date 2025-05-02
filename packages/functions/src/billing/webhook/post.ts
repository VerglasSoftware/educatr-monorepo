import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, Handler, LambdaFunctionURLEvent } from 'aws-lambda';
import { Resource } from 'sst';
import { createId } from "@paralleldrive/cuid2";
import { Stripe } from 'stripe';
const stripe = new Stripe(Resource.STRIPE_SECRET.value);

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sesClient = new SESClient({});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
    const sig = event.headers['stripe-signature'];
    const payload = event.body;

    if (!sig || !payload) {
      return { statusCode: 400, body: 'Missing signature or payload' };
    }
  
    let eventReceived;
    try {
      eventReceived = stripe.webhooks.constructEvent(payload, sig, Resource.STRIPE_WEBHOOK_SECRET.value);
    } catch (err) {+
        console.error(err);
        return { statusCode: 400, body: `Error` };
    }
  
    if (eventReceived.type === 'checkout.session.completed') {
      const session = eventReceived.data.object;
  
      const organisationId = createId();
      const userId = session.client_reference_id;

      const params2 = {
        TableName: Resource.Users.name,
        Key: {
          PK: userId,
          SK: 'DETAILS',
        },
      }
      const user = await dynamoClient.send(new GetCommand(params2));
      if (!user.Item) {
        throw new Error('User not found');
      }

      const params = {
        TableName: Resource.Organisations.name,
        Item: {
          PK: organisationId,
          SK: 'DETAILS',
          name: `${user.Item.given_name}'s new organisation`,
          admins: [userId],
          students: [],
          subscription: eventReceived.data.object.subscription,
          createdAt: new Date().getTime(),
        },
      };
      await dynamoClient.send(new PutCommand(params));
  
      const emailParams = {
        Destination: {
          ToAddresses: [user.Item.email],
        },
        Message: {
          Body: {
            Text: { Data: `Your payment was successful and your new organisation on Educatr has been created. You can manage this organisation and add new users at https://educatr.uk/dash/organisation/${organisationId}/settings.` },
          },
          Subject: { Data: 'Educatr Organisation Creation Success' },
        },
        Source: Resource.EducatrNoreply.sender,
      };
  
      await sesClient.send(new SendEmailCommand(emailParams));
    }
  
    return { statusCode: 200, body: 'Success' };
};
