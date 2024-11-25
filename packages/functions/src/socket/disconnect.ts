import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import { Resource } from "sst";
import { Util } from "@educatr/core/util";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: Handler = Util.handler(async (event) => {
  const params = {
    TableName: Resource.SocketConnections.name,
    Key: {
      id: event.requestContext.connectionId,
    },
  };

  await dynamoDb.delete(params).promise();

  return "Disconnected";
});
