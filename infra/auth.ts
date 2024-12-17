import { api } from "./api";

const region = aws.getRegionOutput().name;

export const userPool = new sst.aws.CognitoUserPool("UserPool", {
	aliases: ["email"],
	triggers: {
		preSignUp: "packages/functions/src/signup.handler",
	},
});

export const userPoolClient = userPool.addClient("UserPoolClient");

export const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
	userPools: [
		{
			userPool: userPool.id,
			client: userPoolClient.id,
		},
	],
	permissions: {
		authenticated: [
			{
				actions: ["execute-api:*"],
				resources: [$concat("arn:aws:execute-api:", region, ":", aws.getCallerIdentityOutput({}).accountId, ":", api.nodes.api.id, "/*/*/*")],
			},
		],
	},
});
