import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { AttributeValue, DynamoDBClient, QueryCommand, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, QueryCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { itemsToConnections } from "./socket/sendMessage";
import { itemsToTeams, itemToTeam } from "./team";
import { Activity, ActivityCreateUpdate } from "./types/activity";
import { Team } from "./types/team";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToActivity = (item: Record<string, any> | undefined): Activity => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val || "BOOL" in val);
	return {
		id: isDynamoFormat(item.SK) ? item.SK.S.split("#")[1] : item.SK.split("#")[1],
		userId: isDynamoFormat(item.userId) ? item.userId.S : item.userId,
		taskId: isDynamoFormat(item.taskId) ? item.taskId.S : item.taskId,
		packId: isDynamoFormat(item.packId) ? item.packId.S : item.packId,
		verifierId: isDynamoFormat(item.verifierId) ? item.verifierId.S : item.verifierId,
		status: isDynamoFormat(item.status) ? item.status.S : item.status,
		answer: isDynamoFormat(item.answer) ? item.answer.S : item.answer,
		correct: isDynamoFormat(item.correct) ? item.correct.BOOL : item.correct,
		createdAt: isDynamoFormat(item.createdAt) ? parseInt(item.createdAt.N) : item.createdAt,
	};
};

export const itemsToActivities = (items: Record<string, AttributeValue>[] | undefined): Activity[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToActivity);
};

export const list: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}

	// Query the Competitions table to find the team the user is part of
	const teamParams: QueryCommandInput = {
		TableName: Resource.Competitions.name,
		KeyConditionExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
		FilterExpression: "contains (students, :userId)",
		ExpressionAttributeValues: {
			":compId": { S: compId },
			":skPrefix": { S: "TEAM#" },
			":userId": { S: event.requestContext.authorizer!.jwt.claims["cognito:username"] },
		},
	};

	var team: Team;
	try {
		const teamResult = await client.send(new QueryCommand(teamParams));
		if (!teamResult.Items || teamResult.Count === 0) {
			throw new Error(`User ${event.requestContext.authorizer!.jwt.claims["cognito:username"]} is not part of a team in competition ${compId}`);
		}

		team = itemToTeam(teamResult.Items[0]);
	} catch (e) {
		throw new Error(`Could not retrieve team for user ${event.requestContext.authorizer!.jwt.claims["cognito:username"]} in competition ${compId}: ${e}`);
	}

	// Query the Competitions table to find all activities for this user in the team
	// Dynamically create FilterExpression for each userId
	const userIdConditions = team.students.map((_, index) => `userId = :userId${index}`).join(" OR ");

	const activityParams: QueryCommandInput = {
		TableName: Resource.Competitions.name,
		KeyConditionExpression: "PK = :compId AND begins_with(SK, :activityPrefix)",
		FilterExpression: `${userIdConditions}`,
		ExpressionAttributeValues: team.students.reduce(
			(acc: { [key: string]: { S: string } }, id, index) => {
				acc[`:userId${index}`] = { S: id };
				return acc;
			},
			{ ":compId": { S: compId }, ":activityPrefix": { S: "ACTIVITY#" } }
		),
	};

	try {
		const activityResult = await client.send(new QueryCommand(activityParams));
		const activities = itemsToActivities(activityResult.Items);
		return JSON.stringify(activities);
	} catch (e) {
		throw new Error(`Could not retrieve activities for team ${team.id} in competition ${compId}: ${e}. ${JSON.stringify(team)}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!activityId) {
		throw new Error("Missing activity id in path parameters");
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
		if (!activity) {
			throw new Error("Activity not found");
		}
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not retrieve activity ${activityId} in competition ${compId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}

	const data: ActivityCreateUpdate = {
		userId: "",
		taskId: "",
		packId: "",
		verifierId: "",
		status: "",
		answer: "",
		correct: false,
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: compId,
			SK: `ACTIVITY#${createId()}`,
			userId: data.userId,
			taskId: data.taskId,
			packId: data.packId,
			verifierId: data.verifierId,
			status: data.status,
			answer: data.answer,
			correct: data.correct,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		const activity = itemToActivity(params.Item);
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not create activity in competition ${compId}: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!activityId) {
		throw new Error("Missing activity id in path parameters");
	}

	const data: ActivityCreateUpdate = {
		userId: "",
		taskId: "",
		packId: "",
		verifierId: "",
		status: "",
		answer: "",
		correct: false,
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
			SK: `ACTIVITY#${activityId}`,
		},
		UpdateExpression: "SET #userId = :userId, #taskId = :taskId, #packId = :packId, #verifierId = :verifierId, #status = :status, #answer = :answer, #correct = :correct",
		ExpressionAttributeNames: {
			"#userId": "userId",
			"#taskId": "taskId",
			"#packId": "packId",
			"#verifierId": "verifierId",
			"#status": "status",
			"#answer": "answer",
			"#correct": "correct",
		},
		ExpressionAttributeValues: {
			":userId": data.userId,
			":taskId": data.taskId,
			":packId": data.packId,
			":verifierId": data.verifierId,
			":status": data.status,
			":answer": data.answer,
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
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!activityId) {
		throw new Error("Missing activity id in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: `ACTIVITY#${activityId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete activity ${activityId} in competition ${compId}: ${e}`);
	}
});

export const clear: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	const params: ScanCommandInput = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":compId": { S: compId },
			":skPrefix": { S: "ACTIVITY#" },
		},
	};
	try {
		const result = await client.send(new ScanCommand(params));
		const items = itemsToActivities(result.Items);
		console.log("Items to delete", items);
		if (!items) {
			throw new Error("No items found");
		}
		const deleteParams: DeleteCommandInput[] = items.map((item) => ({
			TableName: Resource.Competitions.name,
			Key: {
				PK: compId,
				SK: `ACTIVITY#${item.id}`,
			},
		}));
		await Promise.all(deleteParams.map((param) => client.send(new DeleteCommand(param))));
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not clear activities in competition ${compId}: ${e}`);
	}
});

export const approve: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!activityId) {
		throw new Error("Missing activity id in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: `ACTIVITY#${activityId}`,
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

		// get team user is in
		const teamParams: QueryCommandInput = {
			TableName: Resource.Competitions.name,
			KeyConditionExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":compId": { S: compId },
				":skPrefix": { S: "TEAM#" },
			},
		};

		let students: string[] = [];
		try {
			const teamResult = await client.send(new QueryCommand(teamParams));
			const teams = itemsToTeams(teamResult.Items);
			const team = teams.find((team) => team.students.includes(activity.userId));
			if (!team) {
				throw new Error(`User not in any team for competition ${compId}`);
			}
			students = team.students;
		} catch (e) {
			throw new Error(`Could not retrieve teams for competition ${compId}: ${e}`);
		}

		// send to all connected clients from userIds in students array
		const socketParams: ScanCommandInput = {
			TableName: Resource.SocketConnections.name,
			FilterExpression: students.map((_, i) => `contains(userId, :student${i})`).join(" OR ") + " OR attribute_not_exists(userId)",
			ExpressionAttributeValues: Object.fromEntries(students.map((s, i) => [`:student${i}`, { S: s }])),
		};

		var connectionsResult;
		try {
			connectionsResult = await client.send(new ScanCommand(socketParams));
		} catch (e) {
			throw new Error(`Could not retrieve connections: ${e}`);
		}
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
			} catch (e) {
				if ((e as { statusCode?: number }).statusCode === 410) {
					// Remove stale connections
					const deleteParams: DeleteCommandInput = {
						TableName: Resource.SocketConnections.name,
						Key: { id: { S: id } },
					};
					await client.send(new DeleteCommand(deleteParams));
				}
			}
		};

		await Promise.all(connections.map(postToConnection));
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not approve activity ${activityId} in competition ${compId}: ${e}`);
	}
});

export const reject: Handler = Util.handler(async (event) => {
	const { compId, activityId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!activityId) {
		throw new Error("Missing activity id in path parameters");
	}

	const params: UpdateCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: `ACTIVITY#${activityId}`,
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

		// get team user is in
		const teamParams: QueryCommandInput = {
			TableName: Resource.Competitions.name,
			KeyConditionExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":compId": { S: compId },
				":skPrefix": { S: "TEAM#" },
			},
		};

		let students: string[] = [];
		try {
			const teamResult = await client.send(new QueryCommand(teamParams));
			const teams = itemsToTeams(teamResult.Items);
			const team = teams.find((team) => team.students.includes(activity.userId));
			if (!team) {
				throw new Error(`User not in any team for competition ${compId}`);
			}
			students = team.students;
		} catch (e) {
			throw new Error(`Could not retrieve teams for competition ${compId}: ${e}`);
		}

		// send to all connected clients from userIds in students array
		const socketParams: ScanCommandInput = {
			TableName: Resource.SocketConnections.name,
			FilterExpression: students.map((_, i) => `contains(userId, :student${i})`).join(" OR ") + " OR attribute_not_exists(userId)",
			ExpressionAttributeValues: Object.fromEntries(students.map((s, i) => [`:student${i}`, { S: s }])),
		};

		var connectionsResult;
		try {
			connectionsResult = await client.send(new ScanCommand(socketParams));
		} catch (e) {
			throw new Error(`Could not retrieve connections: ${e}`);
		}
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
			} catch (e) {
				if ((e as { statusCode?: number }).statusCode === 410) {
					// Remove stale connections
					const deleteParams: DeleteCommandInput = {
						TableName: Resource.SocketConnections.name,
						Key: { id: { S: id } },
					};
					await client.send(new DeleteCommand(deleteParams));
				}
			}
		};

		await Promise.all(connections.map(postToConnection));
		return JSON.stringify(activity);
	} catch (e) {
		throw new Error(`Could not reject activity ${activityId} in competition ${compId}: ${e}`);
	}
});
