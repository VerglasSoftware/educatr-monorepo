import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const { compId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":compId": { S: pk },
			":skPrefix": { S: "ACTIVITY#" },
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);

		const competitions =
			result.Items?.map((item) => {
				const sk = item.SK.S as string;
				const id = sk.split("#")[1];
				return { ...item, id };
			}) || [];

		return JSON.stringify(competitions);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve competitions");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { compId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	let data = {
		userId: "",
		taskId: "",
		verifierId: "",
		status: "",
		correct: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: pk,
			SK: `ACTIVITY#${createId()}`,
			userId: data.userId,
			taskId: data.taskId,
			verifierId: data.verifierId,
			status: data.status,
			correct: data.correct,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(params.Item);
	} catch (e) {
		throw new Error("Could not create competition");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { compId: pk, activityId } = event.pathParameters || {};

	if (!pk || !activityId) {
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `ACTIVITY#${activityId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Activity not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve activity:" + e);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { compId: pk, activityId } = event.pathParameters || {};

	if (!pk || !activityId) {
		throw new Error("Missing PK in path parameters");
	}

	const deleteParams = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `ACTIVITY#${activityId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(deleteParams));

		return JSON.stringify({
			message: `Activity with SK ${activityId} under competition with PK ${pk} has been deleted`,
			pk,
			activityId,
		});
	} catch (e) {
		throw new Error(`Could not delete activity with SK ${activityId} from competition ${pk}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId: pk, activityId } = event.pathParameters || {};

	if (!pk || !activityId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	let data = {
		userId: "",
		taskId: "",
		verifierId: "",
		status: "",
		correct: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `ACTIVITY#${activityId}`,
		},
		UpdateExpression: "SET #userId = :userId, #taskId = :taskId, #verifierId = :verifierId, #status = :status, #correct = :correct",
		ExpressionAttributeNames: {
			"#userId": "userId",
			"#taskId": "taskId",
			"#verifierId": "verifierId",
			"#status": "status",
			"#correct": "correct",
		},
		ExpressionAttributeValues: {
			":userId": data.userId,
			":taskId": data.taskId,
			":verifierId": data.verifierId,
			":status": data.status,
			":correct": data.correct,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error(`Could not update activity ${activityId} in competition ${pk}`);
	}
});

export const approve: Handler = Util.handler(async (event) => {
	const { compId: pk, activityId } = event.pathParameters || {};

	if (!pk || !activityId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `ACTIVITY#${activityId}`,
		},
		UpdateExpression: "SET #verifierId = :verifierId, #status = :status, #correct = :correct",
		ExpressionAttributeNames: {
			"#verifierId": "verifierId",
			"#status": "status",
			"#correct": "correct",
		},
		ExpressionAttributeValues: {
			":verifierId": event.requestContext.authorizer!.iam.cognitoIdentity.identityId,
			":status": "FINISHED_VERIFICATION",
			":correct": true,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));

		const connections = await client.send(new ScanCommand({ TableName: Resource.SocketConnections.name, ProjectionExpression: "id" }));
		
				const apiG = new ApiGatewayManagementApi({
					endpoint: Resource.SocketApi.managementEndpoint,
				});
		
				const postToConnection = async function ({ id }: any) {
					try {
						await apiG.postToConnection({
							ConnectionId: id.S,
							Data: JSON.stringify({
								filter: {
									competitionId: pk,
								},
								type: "TASK:ANSWERED",
								body: result.Attributes,
							}),
						});
					} catch (e: any) {
						if (e.statusCode === 410) {
							// Remove stale connections
							await client.send(new DeleteCommand({ TableName: Resource.SocketConnections.name, Key: { id: id.S } }));
						}
					}
				};
		
				await Promise.all(connections.Items!.map(postToConnection));

		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error(`Could not approve activity ${activityId} in competition ${pk}`);
	}
});

export const reject: Handler = Util.handler(async (event) => {
	const { compId: pk, activityId } = event.pathParameters || {};

	if (!pk || !activityId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `ACTIVITY#${activityId}`,
		},
		UpdateExpression: "SET #verifierId = :verifierId, #status = :status, #correct = :correct",
		ExpressionAttributeNames: {
			"#verifierId": "verifierId",
			"#status": "status",
			"#correct": "correct",
		},
		ExpressionAttributeValues: {
			":verifierId": event.requestContext.authorizer!.iam.cognitoIdentity.identityId,
			":status": "FINISHED_VERIFICATION",
			":correct": false,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));

		const connections = await client.send(new ScanCommand({ TableName: Resource.SocketConnections.name, ProjectionExpression: "id" }));
		
				const apiG = new ApiGatewayManagementApi({
					endpoint: Resource.SocketApi.managementEndpoint,
				});
		
				const postToConnection = async function ({ id }: any) {
					try {
						await apiG.postToConnection({
							ConnectionId: id.S,
							Data: JSON.stringify({
								filter: {
									competitionId: pk,
								},
								type: "TASK:ANSWERED",
								body: result.Attributes,
							}),
						});
					} catch (e: any) {
						if (e.statusCode === 410) {
							// Remove stale connections
							await client.send(new DeleteCommand({ TableName: Resource.SocketConnections.name, Key: { id: id.S } }));
						}
					}
				};
		
				await Promise.all(connections.Items!.map(postToConnection));

		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error(`Could not reject activity ${activityId} in competition ${pk}`);
	}
});
