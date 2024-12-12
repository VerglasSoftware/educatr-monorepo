import { DynamoDB } from "aws-sdk";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Util } from "@educatr/core/util";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: Handler = Util.handler(async (event) => {
	const params = {
		TableName: Resource.SocketConnections.name,
		Item: {
			id: event.requestContext.connectionId,
		},
	};

	await dynamoDb.put(params).promise();

	return "Connected";
});
