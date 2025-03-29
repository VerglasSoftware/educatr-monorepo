import { ApiGatewayManagementApi, PostToConnectionCommandInput } from "@aws-sdk/client-apigatewaymanagementapi";
import { Util } from "@educatr/core/util";
import { Handler } from "aws-lambda";
import { AttributeValue, DeleteItemInput, DocumentClient, ScanInput } from "aws-sdk/clients/dynamodb";
import { Resource } from "sst";
import { Activity } from "../types/activity";

const dynamoDb = new DocumentClient();

export const itemsToConnections = (items: Record<string, AttributeValue>[] | undefined): { id: string }[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map((item: Record<string, any> | undefined) => {
		if (!item) {
			throw new Error("Item not found");
		}
		return {
			id: item.id.S,
		};
	});
};

export const main: Handler = Util.handler(async (event) => {
	const messageData: Activity = JSON.parse(event.body!).data;
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
