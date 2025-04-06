import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { AttributeValue, DynamoDBClient, QueryCommand, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, QueryCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import { Resource } from "sst";
import { itemsToActivities, itemToActivity } from "./activity";
import { itemsToConnections } from "./socket/sendMessage";
import { itemToTask } from "./task";
import { itemsToTeams } from "./team";
import { Activity } from "./types/activity";
import { Competition, CompetitionAnnounce, CompetitionCheck, CompetitionCreate, CompetitionRun, CompetitionUpdate, Judge0CreateSubmissionResponse, Judge0GetSubmissionResponse } from "./types/competition";
import { Task } from "./types/task";
import { Team } from "./types/team";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const itemToCompetition = (item: Record<string, any> | undefined): Competition => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val || "BOOL" in val || "L" in val);

	return {
		id: isDynamoFormat(item.PK) ? item.PK.S : item.PK,
		name: isDynamoFormat(item.name) ? item.name.S : item.name,
		status: isDynamoFormat(item.status) ? item.status.S : item.status,
		showLeaderboard: isDynamoFormat(item.showLeaderboard) ? item.showLeaderboard.BOOL : item.showLeaderboard,
		userStartedById: isDynamoFormat(item.userStartedById) ? item.userStartedById.S : item.userStartedById,
		organisationId: isDynamoFormat(item.organisationId) ? item.organisationId.S : item.organisationId,
		packs: isDynamoFormat(item.packs) ? item.packs.L.map((pack: any) => pack.S) : item.packs,
		createdAt: isDynamoFormat(item.createdAt) ? parseInt(item.createdAt.N) : item.createdAt,
	};
};

const itemsToCompetitions = (items: Record<string, AttributeValue>[] | undefined): Competition[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToCompetition);
};

export const list: Handler = Util.handler(async (event) => {
	const params: QueryCommandInput = {
		TableName: Resource.Competitions.name,
		IndexName: "ItemTypeIndex",
		KeyConditionExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const result = await client.send(new QueryCommand(params));
		const competitions = itemsToCompetitions(result.Items);
		return JSON.stringify(competitions);
	} catch (e) {
		throw new Error(`Could not retrieve competitions: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Item not found.");
		}
		const competition = itemToCompetition(result.Item);
		return JSON.stringify(competition);
	} catch (e) {
		throw new Error(`Could not retrieve competition ${compId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event: APIGatewayProxyEvent) => {
	const data: CompetitionCreate = {
		name: "",
		status: "NOT_STARTED",
		showLeaderboard: false,
		organisationId: "",
		packs: [],
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			name: data.name,
			status: data.status,
			showLeaderboard: data.showLeaderboard,
			userStartedById: event.requestContext.authorizer!.jwt.claims["cognito:username"],
			organisationId: data.organisationId,
			packs: data.packs,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		const competition = itemToCompetition(params.Item);
		return JSON.stringify(competition);
	} catch (e) {
		throw new Error(`Could not create competition: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing id in path parameters");
	}

	const data: CompetitionUpdate = {
		name: "",
		organisationId: "",
		status: "",
		packs: [],
		showLeaderboard: false,
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const existingParams: GetCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "DETAILS",
		},
	};

	const existingResult = await client.send(new GetCommand(existingParams));
	if (!existingResult.Item) {
		throw new Error("Item not found.");
	}
	const existing = itemToCompetition(existingResult.Item);
	const organisationChanged = existing.organisationId !== data.organisationId;

	if (organisationChanged) {
		const teamsParams: ScanCommandInput = {
			TableName: Resource.Competitions.name,
			FilterExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":compId": { S: compId },
				":skPrefix": { S: "TEAM#" },
			},
		};

		let teamsResult;
		try {
			teamsResult = await client.send(new ScanCommand(teamsParams));
		} catch (e) {
			throw new Error(`Could not retrieve teams for competition ${compId}: ${e}`);
		}
		const teamItems = itemsToTeams(teamsResult.Items);

		for (const team of teamItems) {
			const updateParams: UpdateCommandInput = {
				TableName: Resource.Competitions.name,
				Key: {
					PK: compId,
					SK: "TEAM#" + team.id,
				},
				UpdateExpression: "SET #students = :emptyList",
				ExpressionAttributeNames: {
					"#students": "students",
				},
				ExpressionAttributeValues: {
					":emptyList": [],
				},
			};
			try {
				await client.send(new UpdateCommand(updateParams));
			} catch (e) {
				throw new Error(`Could not update team ${team.id}: ${e}`);
			}
		}
	}

	let updateCreatedAt = false;
	const statusChanged = existing.status !== data.status;
	if (statusChanged) {
		if (existing.status === "NOT_STARTED" && data.status === "IN_PROGRESS") {
			updateCreatedAt = true;
		}
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
						type: "COMPETITION:STATUS_UPDATE",
						body: {
							status: data.status,
						},
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
	}

	const showLeaderboardChanged = existing.showLeaderboard !== data.showLeaderboard;
	if (showLeaderboardChanged) {
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
						type: "COMPETITION:SHOW_LEADERBOARD",
						body: {
							status: data.showLeaderboard,
						},
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
	}

	const params: UpdateCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #name = :name, #organisationId = :organisationId, #status = :status, #packs = :packs, #showLeaderboard = :showLeaderboard",
		ExpressionAttributeNames: {
			"#name": "name",
			"#organisationId": "organisationId",
			"#status": "status",
			"#packs": "packs",
			"#showLeaderboard": "showLeaderboard",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":organisationId": data.organisationId,
			":status": data.status,
			":packs": data.packs,
			":showLeaderboard": data.showLeaderboard,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};
	if (updateCreatedAt) {
		params.UpdateExpression += ", #createdAt = :createdAt";
		params.ExpressionAttributeNames = params.ExpressionAttributeNames || {};
		params.ExpressionAttributeNames["#createdAt"] = "createdAt";
		params.ExpressionAttributeValues = params.ExpressionAttributeValues || {};
		params.ExpressionAttributeValues[":createdAt"] = Date.now();
		console.log("Created at updated");
		console.log(params);
	}

	try {
		const result = await client.send(new UpdateCommand(params));
		const competition = itemToCompetition(result.Attributes);
		return JSON.stringify(competition);
	} catch (e) {
		throw new Error(`Could not update competition ${compId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :pk",
		ExpressionAttributeValues: {
			":pk": { S: compId },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		if (result.Items) {
			for (const item of result.Items) {
				const deleteParams: DeleteCommandInput = {
					TableName: Resource.Competitions.name,
					Key: {
						PK: item.PK.S,
						SK: item.SK.S,
					},
				};
				await client.send(new DeleteCommand(deleteParams));
			}
		}
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete all SKs for competition ${compId}: ${e}`);
	}
});

export const check: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing id in path parameters");
	}

	const data: CompetitionCheck = {
		packId: "",
		taskId: "",
		answer: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	// get the task
	const params: GetCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: data.packId,
			SK: `TASK#${data.taskId}`,
		},
	};

	let task: Task;
	try {
		const taskResult = await client.send(new GetCommand(params));
		if (!taskResult.Item) {
			throw new Error(`Task ${data.taskId} not found in pack ${data.packId}`);
		}
		task = itemToTask(taskResult.Item);
	} catch (e) {
		throw new Error(`Could not retrieve task ${data.taskId} in pack ${data.packId}: ${e}`);
	}

	async function returnAnswer(result: boolean): Promise<string> {
		// create activity
		const params: PutCommandInput = {
			TableName: Resource.Competitions.name,
			Item: {
				PK: compId,
				SK: `ACTIVITY#${createId()}`,
				userId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
				packId: data.packId,
				taskId: data.taskId,
				answer: "",
				correct: result,
				correctString: result ? "true" : "false",
				createdAt: Date.now(),
			},
		};

		let activity: Activity;
		try {
			await client.send(new PutCommand(params));
			activity = itemToActivity(params.Item);
		} catch (e) {
			throw new Error(`Could not create activity: ${e}`);
		}

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
			const team = teams.find((team) => team.students.includes(event.requestContext.authorizer!.jwt.claims["cognito:username"]));
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
		return JSON.stringify({ result, activity });
	}

	switch (task.verificationType) {
		case "COMPARE":
			if (data.answer.trim() === task.answer.trim()) {
				return await returnAnswer(true);
			} else {
				return await returnAnswer(false);
			}
		case "MULTIPLE":
			const possibleAnswers = task.answerChoices;
			const correctAnswer = possibleAnswers.find((answer) => answer.correct);
			if (!correctAnswer) {
				throw new Error(`No correct answer found in task ${data.taskId} in pack ${data.packId}`);
			}
			if (data.answer == correctAnswer.name) {
				// change this to id?
				return await returnAnswer(true);
			} else {
				return await returnAnswer(false);
			}
		case "ALGORITHM":
			const languageMap = {
				PYTHON: 71,
				CSHARP: 51,
			};

			const languageId = languageMap[task.answerType as keyof typeof languageMap];
			if (!languageId) {
				throw new Error(`Answer type ${task.answerType} not supported`);
			}

			var result: AxiosResponse<Judge0CreateSubmissionResponse>;
			try {
				result = await axios.post(`${Resource.ExecuteApi.url}/submissions`, {
					stdin: task.stdin.replace(/\\n/g, "\n"),
					source_code: data.answer.trim(),
					language_id: languageId,
				});
			} catch (e) {
				return await returnAnswer(false);
			}
			if (result.status == 201) {
				const submissionId = result.data.token;
				var status: AxiosResponse<Judge0GetSubmissionResponse>;
				do {
					try {
						status = await axios.get(`${Resource.ExecuteApi.url}/submissions/${submissionId}?base64_encoded=true&fields=*`);
					} catch (err) {
						throw new Error("Failed to fetch submission status from Judge0");
					}
					await new Promise((resolve) => setTimeout(resolve, 1000));
				} while (status.data.status.id < 3);
				if (status.data.status.id == 3) {
					const stdout = Buffer.from(status.data.stdout, "base64").toString("utf-8");
					const answerLines = stdout.trim().split("\n");
					const outputLines = task.answer.trim().split("\\n");
					if (answerLines.length !== outputLines.length || !answerLines.every((line, index) => line.trim() === outputLines[index].trim())) {
						return await returnAnswer(false);
					}
					return await returnAnswer(true);
				} else {
					return await returnAnswer(false);
				}
			}
			break;
		case "MANUAL":
			const params: PutCommandInput = {
				TableName: Resource.Competitions.name,
				Item: {
					PK: compId,
					SK: `ACTIVITY#${createId()}`,
					status: "WAITING",
					answer: data.answer,
					userId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
					packId: data.packId,
					taskId: data.taskId,
					createdAt: Date.now(),
				},
			};

			try {
				await client.send(new PutCommand(params));
				const activity = itemToActivity(params.Item);
				const socketParams: ScanCommandInput = {
					TableName: Resource.SocketConnections.name,
					FilterExpression: "attribute_not_exists(userId)",
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
								type: "TASK:MANUAL",
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
			} catch (e) {
				throw new Error(`Could not create activity: ${e}`);
			}
			return JSON.stringify({ manual: true, activity: itemToActivity(params.Item) });
		default:
			throw new Error(`Verification type ${task.verificationType} not supported`);
	}
	return JSON.stringify({ error: "how did we get here" });
});

export const run: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing id in path parameters");
	}

	const data: CompetitionRun = {
		language: "",
		code: "",
		stdin: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const languageMap = {
		PYTHON: 71,
		CSHARP: 51,
	};

	const languageId = languageMap[data.language as keyof typeof languageMap];
	if (!languageId) {
		throw new Error(`Language ${data.language} not supported`);
	}

	var result: AxiosResponse<Judge0CreateSubmissionResponse>;
	try {
		result = await axios.post(`${Resource.ExecuteApi.url}/submissions`, {
			source_code: data.code.trim(),
			language_id: languageId,
			stdin: data.stdin.replace(/\\n/g, "\n"),
		});
	} catch (e) {
		throw new Error(`Could not create submission: ${e}`);
	}
	console.log(result.data);
	if (result.status == 201) {
		const submissionId = result.data.token;
		var status: AxiosResponse<Judge0GetSubmissionResponse>;
		do {
			try {
				status = await axios.get(`${Resource.ExecuteApi.url}/submissions/${submissionId}?base64_encoded=true&fields=*`);
			} catch (err) {
				throw new Error("Failed to fetch submission status from Judge0");
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} while (status.data.status.id < 3);
		if (status.data.status.id == 3) {
			const decodedOutput = Buffer.from(status.data.stdout, "base64").toString("utf-8");
			return JSON.stringify({ output: decodedOutput });
		} else {
			if (status.data.status.id == 6) {
				return JSON.stringify({ output: status.data.compile_output });
			} else {
				return JSON.stringify({ output: status.data.stderr });
			}
		}
	}
	return JSON.stringify({ output: "how did we get here" });
});

export const getLb: Handler = Util.handler(async (event) => {
	try {
		const { compId } = event.pathParameters || {};
		if (!compId) {
			throw new Error("Missing id in path parameters");
		}

		const competitionParams: GetCommandInput = {
			TableName: Resource.Competitions.name,
			Key: {
				PK: compId,
				SK: "DETAILS",
			},
		};

		const teamParams: QueryCommandInput = {
			TableName: Resource.Competitions.name,
			KeyConditionExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":compId": { S: compId },
				":skPrefix": { S: "TEAM#" },
			},
		};

		const activityParams: QueryCommandInput = {
			TableName: Resource.Competitions.name,
			IndexName: "CorrectIndex",
			KeyConditionExpression: "PK = :compId AND correctString = :correctString",
			ExpressionAttributeValues: {
				":compId": { S: compId },
				":correctString": { S: "true" },
			},
		};

		let competition: Competition;
		let teams: Team[];
		let activities: Activity[];
		try {
			const [competitionResult, teamResult, activityResult] = await Promise.all([client.send(new GetCommand(competitionParams)), client.send(new QueryCommand(teamParams)), client.send(new QueryCommand(activityParams))]);
			if (!competitionResult.Item) {
				throw new Error("Competition not found");
			}
			competition = itemToCompetition(competitionResult.Item);
			teams = itemsToTeams(teamResult.Items);
			activities = itemsToActivities(activityResult.Items);
		} catch (e) {
			throw new Error(`Could not retrieve data for competition ${compId}: ${e}`);
		}

		const taskLookup: Record<string, Task> = {};
		try {
			for (const packId of competition.packs) {
				const packTasksParams: QueryCommandInput = {
					TableName: Resource.Packs.name,
					KeyConditionExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
					ExpressionAttributeValues: {
						":packId": { S: packId },
						":skPrefix": { S: "TASK#" },
					},
				};

				const packTasksResult = await client.send(new QueryCommand(packTasksParams));
				const tasks = packTasksResult.Items?.map(itemToTask) || [];

				tasks.forEach((task) => {
					taskLookup[task.id] = task;
				});
			}
		} catch (e) {
			throw new Error(`Could not retrieve tasks for competition packs: ${e}`);
		}

		const teamLabels = teams.reduce((acc: Record<string, string>, item, index) => {
			acc[item.id] = item.name;
			return acc;
		}, {});

		const timeStarted = parseInt(competition.createdAt);
		const timeNow = Date.now();

		const minutesArray = Array.from({ length: Math.floor((timeNow - timeStarted) / (1000 * 60)) + 1 }, (_, i) => i);

		let timestamps = minutesArray.map((i) => timeStarted + i * (1000 * 60));
		timestamps = timestamps.slice(-100);
		const teamData = [];

		let previousPoints: Record<string, number> = {};
		const teamActivitiesMap = new Map<string, Activity[]>();

		for (const team of teams) {
			teamActivitiesMap.set(
				team.id,
				activities.filter((activity) => team.students.includes(activity.userId) && activity.correct === true)
			);
			previousPoints[team.id] = 0;
		}

		const initialObj: { timestamp: number; changedTeams: Record<string, number> } = { timestamp: Math.max(timeStarted, timeNow - 100 * 60 * 1000), changedTeams: {} };
		for (const team of teams) {
			initialObj.changedTeams[team.id] = 0;
		}
		teamData.push(initialObj);

		for (const currentTimestamp of timestamps) {
			const preStepObj: { timestamp: number; changedTeams: Record<string, number> } = { timestamp: currentTimestamp - 1, changedTeams: {} };
			const stepObj: { timestamp: number; changedTeams: Record<string, number> } = { timestamp: currentTimestamp, changedTeams: {} };

			for (const [teamId, teamActivities] of teamActivitiesMap.entries()) {
				let currentPoints = 0;
				const countedTaskIds = new Set<string>();

				for (const activity of teamActivities) {
					if (parseInt(activity.createdAt) < currentTimestamp) {
						if (!countedTaskIds.has(activity.taskId)) {
							countedTaskIds.add(activity.taskId);
							const taskPoints = taskLookup[activity.taskId]?.points || 0;
							currentPoints += taskPoints;
						}
					} else {
						break;
					}
				}

				if (previousPoints[teamId] !== currentPoints) {
					preStepObj.changedTeams[teamId] = previousPoints[teamId];
					stepObj.changedTeams[teamId] = currentPoints;

					previousPoints[teamId] = currentPoints;
				}
			}

			if (Object.keys(preStepObj.changedTeams).length > 0) {
				teamData.push(preStepObj);
			}
			if (Object.keys(stepObj.changedTeams).length > 0) {
				teamData.push(stepObj);
			}
		}

		const finalObj: { timestamp: number; changedTeams: Record<string, number> } = { timestamp: timeNow, changedTeams: {} };

		for (const team of Object.keys(teamLabels)) {
			finalObj.changedTeams[team] = previousPoints[team];
		}

		teamData.push(finalObj);

		console.log("teamData", teamData);

		return JSON.stringify({ teamLabels, teamData });
	} catch (e) {
		throw new Error(`Could not retrieve leaderboard for competition: ${e}`);
	}
});

export const announce: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing id in path parameters");
	}

	const data: CompetitionAnnounce = {
		message: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

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
					type: "COMPETITION:ANNOUNCE",
					filter: {
						competitionId: compId,
					},
					body: {
						announce: data.message,
					},
				}),
			});
		} catch (e: any) {
			if (e.statusCode === 410) {
				const deleteParams: DeleteCommandInput = {
					TableName: Resource.SocketConnections.name,
					Key: { id },
				};
				await client.send(new DeleteCommand(deleteParams));
			}
		}
	};
	await Promise.all(connections.map(postToConnection));
	return JSON.stringify({ success: true });
});
