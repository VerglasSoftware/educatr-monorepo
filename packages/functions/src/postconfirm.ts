import { Callback, Context, Handler, PostConfirmationTriggerEvent, PreSignUpTriggerEvent } from "aws-lambda";
import { Resource } from "sst";
import { createId } from "@paralleldrive/cuid2";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event: PostConfirmationTriggerEvent, context: Context, callback: Callback) => {
	console.log(event);

	const pk = event.userName;

	const params = {
		TableName: Resource.Users.name,
		Item: {
			PK: pk,
			SK: "DETAILS",
			email: event.request.userAttributes.email || undefined,
			nickname: event.request.userAttributes.nickname || undefined,
			given_name: event.request.userAttributes.given_name || undefined,
			family_name: event.request.userAttributes.family_name || undefined,
			role: event.request.userAttributes.email ? "USER" : "STUDENT",
			picture: event.request.userAttributes.picture || undefined,
		},
	};

	try {
		await client.send(new PutCommand(params));
	} catch (e) {
		throw new Error("Could not create user");
	}

	console.log(event.request.userAttributes);

	if (event.request.userAttributes["custom:initial"]) {
		const orgId = event.request.userAttributes["custom:initial"];

		const params = {
			TableName: Resource.Organisations.name,
			Key: {
				PK: `ORG#${orgId}`,
				SK: "DETAILS",
			},
			UpdateExpression: "ADD #students :student",
			ExpressionAttributeNames: {
				"#students": "students",
			},
			ExpressionAttributeValues: {
				":student": new Set([pk]),
			},
		};

		try {
			await client.send(new UpdateCommand(params));
		} catch (e) {
			console.log(e);
			throw new Error("Could not add user to organisation");
		}
	}

	// Return to Amazon Cognito
	return event;
};

export { handler };
