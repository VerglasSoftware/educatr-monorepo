import { Callback, Context, Handler, PostConfirmationTriggerEvent, PreSignUpTriggerEvent } from "aws-lambda";
import { Resource } from "sst";
import { createId } from "@paralleldrive/cuid2";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event: PostConfirmationTriggerEvent, context: Context, callback: Callback) => {
    console.log(event);

    const cognitoUid = `${event.region}:${event.request.userAttributes.sub}`;

	const params = {
		TableName: Resource.Users.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			cognitoUid,
            username: event.userName,
            email: event.request.userAttributes.email || undefined,
            nickname: event.request.userAttributes.nickname || undefined,
            given_name: event.request.userAttributes.given_name || undefined,
            family_name: event.request.userAttributes.family_name || undefined,
            role: event.request.userAttributes.email ? "USER" : "STUDENT",
		},
	};

	try {
		await client.send(new PutCommand(params));
	} catch (e) {
		throw new Error("Could not create user");
	}

    // Return to Amazon Cognito
    return event;
};

export { handler };
