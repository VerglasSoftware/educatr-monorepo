export const api = new sst.aws.ApiGatewayV2("Api", {
	domain: $app.stage === "prod" ? "api.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: true },
			},
		},
	},
});

api.route("GET /", {
	handler: "packages/functions/src/api.handler",
});
