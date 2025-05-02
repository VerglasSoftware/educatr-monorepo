import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, PutCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { PostConfirmationTriggerEvent } from "aws-lambda";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event: PostConfirmationTriggerEvent) => {
	const pk = event.userName;
	const params: PutCommandInput = {
		TableName: Resource.Users.name,
		Item: {
			PK: pk,
			SK: "DETAILS",
			email: event.request.userAttributes.email || undefined,
			nickname: event.request.userAttributes.nickname || undefined,
			given_name: event.request.userAttributes.given_name || undefined,
			family_name: event.request.userAttributes.family_name || undefined,
			picture: event.request.userAttributes.picture || undefined,
		},
	};

	try {
		await client.send(new PutCommand(params));
	} catch (e) {
		throw new Error(`Could not create user: ${e}`);
	}

	if (event.request.userAttributes["custom:initial"]) {
		const orgId = event.request.userAttributes["custom:initial"];
		const params: UpdateCommandInput = {
			TableName: Resource.Organisations.name,
			Key: {
				PK: orgId,
				SK: "DETAILS",
			},
			UpdateExpression: "SET #students = list_append(if_not_exists(#students, :emptyList), :student)",
			ExpressionAttributeNames: {
				"#students": "students",
			},
			ExpressionAttributeValues: {
				":student": [pk],
				":emptyList": [],
			},
		};

		try {
			await client.send(new UpdateCommand(params));
		} catch (e) {
			throw new Error(`Could not add user to organisation: ${e}`);
		}
	}

	// Return to Amazon Cognito
	return event;
};

export { handler };
