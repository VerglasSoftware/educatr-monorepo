import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { itemsToConnections } from "./socket/sendMessage";
import { itemToTeam } from "./team";
import { Activity, ActivityCreateUpdate, ActivityDynamo } from "./types/activity";
import { Team } from "./types/team";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToActivity = (item: Record<string, any> | undefined): Activity => {
	if (!item) {
		throw new Error("Item not found");
	}
	const packDynamo: ActivityDynamo = item as unknown as ActivityDynamo;
	return {
		id: packDynamo.SK.S.split("#")[1],
		userId: packDynamo.userId.S,
		taskId: packDynamo.taskId.S,
		verifierId: packDynamo.verifierId.S,
		status: packDynamo.status.S,
		correct: packDynamo.correct.S,
		createdAt: new Date(parseInt(packDynamo.createdAt.N)).toISOString(),
	};
};

export const itemsToClasses = (items: Record<string, AttributeValue>[] | undefined): Activity[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToActivity);
};

export const list: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing comp ID in path parameters");
	}

	// get the team the user is part of
	const teamParams = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :compId AND begins_with(SK, :skPrefix) AND contains (students, :userId)",
		ExpressionAttributeValues: {
			":compId": { S: compId },
			":skPrefix": { S: "TEAM#" },
			":userId": { S: event.requestContext.authorizer!.jwt.claims["cognito:username"] },
		},
	};

	var team: Team;
	try {
		const teamResult = await client.send(new ScanCommand(teamParams));
		if (!teamResult.Items || teamResult.Count === 0) {
			throw new Error("User is not part of any team");
		}
		team = itemToTeam(teamResult.Items[0]);
	} catch (e) {
		throw new Error("Could not retrieve team information");
	}

	// Query the Competitions table to find all activities for this user in the team
	// Dynamically create FilterExpression for each userId
	const userIdConditions = team.students.map((_, index) => `userId = :userId${index}`).join(" OR ");

	const activityParams: ScanCommandInput = {
		TableName: Resource.Competitions.name,
		FilterExpression: `begins_with(SK, :activityPrefix) AND (${userIdConditions})`,
		ExpressionAttributeValues: team.students.reduce(
			(acc: { [key: string]: { S: string } }, id, index) => {
				acc[`:userId${index}`] = { S: id };
				return acc;
			},
			{ ":activityPrefix": { S: "ACTIVITY#" } }
		),
	};

	try {
		const activityResult = await client.send(new ScanCommand(activityParams));
		const activities = itemsToClasses(activityResult.Items);
		return JSON.stringify(activities);
	} catch (e) {
		throw new Error("Could not retrieve activities");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId || !activityId) {
		throw new Error("Missing ID in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: `ACTIVITY#${activityId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const activity = itemToActivity(result.Item);
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error("Could not retrieve activity:" + e);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing comp ID in path parameters");
	}

	const data: ActivityCreateUpdate = {
		userId: "",
		taskId: "",
		verifierId: "",
		status: "",
		correct: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: compId,
			SK: "ACTIVITY#" + createId(),
			userId: data.userId,
			taskId: data.taskId,
			verifierId: data.verifierId,
			status: data.status,
			correct: data.correct,
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		const activity = itemToActivity(result.Attributes);
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error("Could not create competition");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId || !activityId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	const data: ActivityCreateUpdate = {
		userId: "",
		taskId: "",
		verifierId: "",
		status: "",
		correct: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else {
		throw new Error("No body provided");
	}

	const params: UpdateCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "ACTIVITY#" + activityId,
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
		const activity = itemToActivity(result.Attributes);
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not update activity ${activityId} in competition ${compId}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};

	if (!compId || !activityId) {
		throw new Error("Missing PK in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "ACTIVITY#" + activityId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `Activity with SK ${activityId} under competition with PK ${compId} has been deleted` });
	} catch (e) {
		throw new Error(`Could not delete activity with SK ${activityId} from competition ${compId}`);
	}
});

export const approve: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId || !activityId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "ACTIVITY#" + activityId,
		},
		UpdateExpression: "SET #verifierId = :verifierId, #status = :status, #correct = :correct",
		ExpressionAttributeNames: {
			"#verifierId": "verifierId",
			"#status": "status",
			"#correct": "correct",
		},
		ExpressionAttributeValues: {
			":verifierId": event.requestContext.authorizer!.jwt.claims["cognito:username"],
			":status": "FINISHED_VERIFICATION",
			":correct": true,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const activity = itemToActivity(result.Attributes);

		const socketParams: ScanCommandInput = {
			TableName: Resource.SocketConnections.name,
			ProjectionExpression: "id",
		};
		const connectionsResult = await client.send(new ScanCommand(socketParams));
		const connections = itemsToConnections(connectionsResult.Items);

		const apiG = new ApiGatewayManagementApi({
			endpoint: Resource.SocketApi.managementEndpoint,
		});

		const postToConnection = async function ({ id }: { id: string }) {
			try {
				await apiG.postToConnection({
					ConnectionId: id,
					Data: JSON.stringify({
						filter: {
							competitionId: compId,
						},
						type: "TASK:ANSWERED",
						body: activity,
					}),
				});
			} catch (e: any) {
				if (e.statusCode === 410) {
					// Remove stale connections
					const deleteParams: DeleteCommandInput = {
						TableName: Resource.SocketConnections.name,
						Key: { id },
					};
					await client.send(new DeleteCommand(deleteParams));
				}
			}
		};
		await Promise.all(connections.map(postToConnection));
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not approve activity ${activityId} in competition ${compId}`);
	}
});

export const reject: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId || !activityId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	const params: UpdateCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "ACTIVITY#" + activityId,
		},
		UpdateExpression: "SET #verifierId = :verifierId, #status = :status, #correct = :correct",
		ExpressionAttributeNames: {
			"#verifierId": "verifierId",
			"#status": "status",
			"#correct": "correct",
		},
		ExpressionAttributeValues: {
			":verifierId": event.requestContext.authorizer!.jwt.claims["cognito:username"],
			":status": "FINISHED_VERIFICATION",
			":correct": false,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const activity = itemToActivity(result.Attributes);

		const socketParams: ScanCommandInput = {
			TableName: Resource.SocketConnections.name,
			ProjectionExpression: "id",
		};
		const connectionsResult = await client.send(new ScanCommand(socketParams));
		const connections = itemsToConnections(connectionsResult.Items);

		const apiG = new ApiGatewayManagementApi({
			endpoint: Resource.SocketApi.managementEndpoint,
		});

		const postToConnection = async function ({ id }: { id: string }) {
			try {
				await apiG.postToConnection({
					ConnectionId: id,
					Data: JSON.stringify({
						filter: {
							competitionId: compId,
						},
						type: "TASK:ANSWERED",
						body: activity,
					}),
				});
			} catch (e: any) {
				if (e.statusCode === 410) {
					// Remove stale connections
					const deleteParams: DeleteCommandInput = {
						TableName: Resource.SocketConnections.name,
						Key: { id },
					};
					await client.send(new DeleteCommand(deleteParams));
				}
			}
		};

		await Promise.all(connections.map(postToConnection));
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not reject activity ${activityId} in competition ${compId}`);
	}
});
