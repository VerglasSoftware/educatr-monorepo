import { DynamoDB } from "aws-sdk";
import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import { Util } from "@educatr/core/util";
import { Resource } from "sst";

const dynamoDb = new DynamoDB.DocumentClient();

export const main: Handler = Util.handler(async (event) => {
    console.log("data: " + event.body);
    const messageData = JSON.parse(event.body!).data;
  const { stage, domainName } = event.requestContext;

  const connections = await dynamoDb
    .scan({ TableName: Resource.SocketConnections.name, ProjectionExpression: "id" })
    .promise();

  const apiG = new ApiGatewayManagementApi({
    endpoint: `https://${domainName}/${stage}`,
  });

  const postToConnection = async function ({ id }: any) {
    try {
      await apiG
        .postToConnection({ ConnectionId: id, Data: messageData });
    } catch (e: any) {
        console.log(e.statusCode);
      if (e.statusCode === 410) {
        // Remove stale connections
        await dynamoDb.delete({ TableName: Resource.SocketConnections.name, Key: { id } }).promise();
      }
    }
  };

  await Promise.all(connections.Items!.map(postToConnection));

    return "Message sent";
});
