import { entraClientId, entraClientSecret, organisationTable, userTable } from "./storage";

const region = aws.getRegionOutput().name;

export const userPool = new sst.aws.CognitoUserPool("UserPool", {
	aliases: ["email"],
	triggers: {
		preSignUp: "packages/functions/src/signup.handler",
		postConfirmation: {
			handler: "packages/functions/src/postconfirm.handler",
			link: [userTable, organisationTable],
			permissions: [
				{
					actions: ["dynamodb:*"],
					resources: [userTable.arn, organisationTable.arn],
				},
			],
		},
	},
});

const entraProvider = userPool.addIdentityProvider("EntraID", {
	type: "oidc",
	details: {
		authorize_scopes: "openid profile email",
		client_id: entraClientId.value,
		client_secret: entraClientSecret.value,
		oidc_issuer: "https://login.microsoftonline.com/f50bde61-7c14-4884-94b2-ca2440bb017d/v2.0",
		authorize_url: "https://login.microsoftonline.com/f50bde61-7c14-4884-94b2-ca2440bb017d/oauth2/v2.0/authorize",
		attributes_url: "https://graph.microsoft.com/oidc/userinfo",
		jwks_uri: "https://login.microsoftonline.com/f50bde61-7c14-4884-94b2-ca2440bb017d/discovery/v2.0/keys",
		token_url: "https://login.microsoftonline.com/f50bde61-7c14-4884-94b2-ca2440bb017d/oauth2/v2.0/token",
		attributes_request_method: "GET",
	},
	attributes: {
		email: "email",
		username: "sub",
		family_name: "family_name",
		given_name: "given_name",
	},
});

export const userPoolClient = userPool.addClient("UserPoolClient", {
	providers: [entraProvider.providerName],
});

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
				resources: [$concat("arn:aws:execute-api:", region, ":", aws.getCallerIdentityOutput({}).accountId, ":/*/*/*")],
			},
		],
	},
});
