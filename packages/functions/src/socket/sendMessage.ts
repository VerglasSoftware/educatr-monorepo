import { ApiGatewayManagementApi, PostToConnectionCommandInput } from "@aws-sdk/client-apigatewaymanagementapi";
import { Util } from "@educatr/core/util";
import { Handler } from "aws-lambda";
import { AttributeValue, DeleteItemInput, DocumentClient, ScanInput } from "aws-sdk/clients/dynamodb";
import { Resource } from "sst";

const dynamoDb = new DocumentClient();

export const itemToConnection = (item: Record<string, any> | undefined): { id: string } => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && "S" in val;

	return {
		id: isDynamoFormat(item.id) ? item.id.S : item.id,
	};
};

export const itemsToConnections = (items: Record<string, AttributeValue>[] | undefined): { id: string }[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToConnection);
};

export const main: Handler = Util.handler(async (event) => {
	const parsedBody = JSON.parse(event.body!);
	const messageData = JSON.parse(parsedBody.data);
	if (!messageData) {
		throw new Error("Message data not found");
	}
	const { stage, domainName } = event.requestContext;

	const socketParams: ScanInput = {
		TableName: Resource.SocketConnections.name,
		ProjectionExpression: "id",
	};
	const connectionsResult = await dynamoDb.scan(socketParams).promise();
	const connections = itemsToConnections(connectionsResult.Items);

	const apiG = new ApiGatewayManagementApi({
		endpoint: `https://${domainName}/${stage}`,
	});

	const postToConnection = async function ({ id }: { id: string }) {
		try {
			const postParams: PostToConnectionCommandInput = {
				ConnectionId: id,
				Data: new TextEncoder().encode(JSON.stringify(messageData)),
			};
			await apiG.postToConnection(postParams);
		} catch (e: any) {
			if (e.statusCode === 410) {
				// Remove stale connections
				const deleteParams: DeleteItemInput = {
					TableName: Resource.SocketConnections.name,
					Key: { id: { S: id } },
				};
				await dynamoDb.delete(deleteParams).promise();
			}
		}
	};

	await Promise.all(connections.map(postToConnection));
	return "Message sent";
});
