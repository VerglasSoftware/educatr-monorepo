import { Util } from "@educatr/core/util";
import { Handler } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Resource } from "sst";

const client = new DocumentClient();

export const main: Handler = Util.handler(async (event) => {
	const params: DocumentClient.PutItemInput = {
		TableName: Resource.SocketConnections.name,
		Item: {
			id: event.requestContext.connectionId,
		},
	};

	await client.put(params).promise();
	return "Connected";
});
