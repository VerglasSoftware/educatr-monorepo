import { Util } from "@educatr/core/util";
import { Handler } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Resource } from "sst";

const dynamoDb = new DocumentClient();

export const main: Handler = Util.handler(async (event) => {
	const params: DocumentClient.DeleteItemInput = {
		TableName: Resource.SocketConnections.name,
		Key: {
			id: event.requestContext.connectionId,
		},
	};

	await dynamoDb.delete(params).promise();
	return "Disconnected";
});
