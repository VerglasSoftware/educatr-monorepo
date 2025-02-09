import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import { Resource } from "sst";
import { itemToActivity } from "./activity";
import { itemToTask } from "./task";
import { Activity } from "./types/activity";
import { Competition, CompetitionCheck, CompetitionCreate, CompetitionDynamo, CompetitionRun, CompetitionUpdate, Judge0CreateSubmissionResponse, Judge0GetSubmissionResponse } from "./types/competition";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const itemToCompetition = (item: Record<string, any> | undefined): Competition => {
	if (!item) {
		throw new Error("Item not found");
	}
	const packDynamo: CompetitionDynamo = item as unknown as CompetitionDynamo;
	return {
		id: packDynamo.PK.S,
		name: packDynamo.name.S,
		status: packDynamo.status.S,
		userStartedById: packDynamo.userStartedById.S,
		organisationId: packDynamo.organisationId.S,
		packs: packDynamo.packs.L.map((pack) => pack.S),
		createdAt: new Date(parseInt(packDynamo.createdAt.N)).toISOString(),
	};
};

const itemsToCompetitions = (items: Record<string, AttributeValue>[] | undefined): Competition[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToCompetition);
};

export const list: Handler = Util.handler(async (event) => {
	const params: ScanCommandInput = {
		TableName: Resource.Competitions.name,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const competitions = itemsToCompetitions(result.Items);
		return JSON.stringify(competitions);
	} catch (e) {
		throw new Error("Could not retrieve competition");
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
		const competition = itemToCompetition(result.Item);
		return JSON.stringify(competition);
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const data: CompetitionCreate = {
		name: "",
		status: "",
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
			status: data.status || "NOT_STARTED",
			userStartedById: event.requestContext.authorizer!.jwt.claims["cognito:username"],
			organisationId: data.organisationId,
			packs: data.packs,
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		const competition = itemToCompetition(result.Attributes);
		return JSON.stringify(competition);
	} catch (e) {
		throw new Error("Could not create competition");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing pk in path parameters");
	}

	const data: CompetitionUpdate = {
		name: "",
		status: "",
		packs: [],
		showLeaderboard: true,
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #name = :name, #status = :status, #packs = :packs, #showLeaderboard = :showLeaderboard",
		ExpressionAttributeNames: {
			"#name": "name",
			"#status": "status",
			"#packs": "packs",
			"#showLeaderboard": "showLeaderboard",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":status": data.status,
			":packs": data.packs,
			":showLeaderboard": data.showLeaderboard,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const competition = itemToCompetition(result.Attributes);
		return JSON.stringify(competition);
	} catch (e) {
		throw new Error("Could not update competition details");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing pk in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `Competition with PK ${compId} has been deleted` });
	} catch (e) {
		throw new Error(`Could not delete competition with PK ${compId}`);
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
		stdin: "",
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

	var task;
	try {
		const result = await client.send(new GetCommand(params));
		task = itemToTask(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}

	async function returnAnswer(result: boolean): Promise<string> {
		// create activity
		const params: PutCommandInput = {
			TableName: Resource.Competitions.name,
			Item: {
				PK: compId,
				SK: "ACTIVITY#" + createId(),
				userId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
				packId: data.packId,
				taskId: data.taskId,
				correct: result,
				createdAt: Date.now(),
			},
		};

		var activity: Activity;
		try {
			const result = await client.send(new PutCommand(params));
			activity = itemToActivity(result.Attributes);
		} catch (e) {
			throw new Error("Could not create activity");
		}

		// send to all connected clients
		const socketParams: ScanCommandInput = {
			TableName: Resource.SocketConnections.name,
			ProjectionExpression: "id",
		};

		var connections;
		try {
			connections = await client.send(new ScanCommand(socketParams));
		} catch (e) {
			throw new Error("Could not retrieve connections");
		}

		const apiG = new ApiGatewayManagementApi({
			endpoint: Resource.SocketApi.managementEndpoint,
		});

		const postToConnection = async function ({ id }: any) {
			try {
				await apiG.postToConnection({
					ConnectionId: id.S,
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
						Key: { id: id.S },
					};
					await client.send(new DeleteCommand(deleteParams));
				}
			}
		};

		await Promise.all(connections.Items!.map(postToConnection));
		return JSON.stringify({ result });
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
				throw new Error("Correct answer not found");
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
				throw new Error("Answer type not supported");
			}

			var result: AxiosResponse<Judge0CreateSubmissionResponse>;
			try {
				result = await axios.post(`${Resource.ExecuteApi.url}/submissions`, {
					stdin: data.stdin,
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
					status = await axios.get(`${Resource.ExecuteApi.url}/submissions/${submissionId}`);
					await new Promise((resolve) => setTimeout(resolve, 1000));
				} while (status.data.status.id < 3);
				if (status.data.status.id == 3) {
					if (status.data.stdout.trim() === task.answer.trim()) {
						return await returnAnswer(true);
					} else {
						return await returnAnswer(false);
					}
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
					SK: "ACTIVITY#" + createId(),
					status: "WAITING",
					userId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
					packId: data.packId,
					taskId: data.taskId,
					createdAt: Date.now(),
				},
			};

			try {
				await client.send(new PutCommand(params));
			} catch (e) {
				throw new Error("Could not create activity");
			}
			return JSON.stringify({ manual: true });
		default:
			throw new Error("Verification type not supported");
	}
	return JSON.stringify({ output: "how did we get here" });
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
		throw new Error("Answer type not supported");
	}

	var result: AxiosResponse<Judge0CreateSubmissionResponse>;
	try {
		result = await axios.post(`${Resource.ExecuteApi.url}/submissions`, {
			source_code: data.code.trim(),
			language_id: languageId,
			stdin: data.stdin,
		});
	} catch (e) {
		throw new Error("Could not run submission");
	}
	if (result.status == 201) {
		const submissionId = result.data.token;
		var status: AxiosResponse<Judge0GetSubmissionResponse>;
		do {
			status = await axios.get(`${Resource.ExecuteApi.url}/submissions/${submissionId}`);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} while (status.data.status.id < 3);
		if (status.data.status.id == 3) {
			return JSON.stringify({ output: status.data.stdout });
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
	const { compId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :pk and (SK = :details or begins_with(SK, :team) or begins_with(SK, :activity))",
		ExpressionAttributeValues: {
			":pk": { S: pk },
			":details": { S: "DETAILS" },
			":team": { S: "TEAM#" },
			":activity": { S: "ACTIVITY#" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		if (!result.Items || result.Items.length === 0) {
			throw new Error("Competition not found");
		}

		const teamLabels = result.Items.filter((item) => item.SK.S!.startsWith("TEAM#")).reduce((acc: any, item, index) => {
			acc[item.SK.S!.split("TEAM#")[1]] = item.name.S;
			return acc;
		}, {});

		const timeStarted = parseInt(result.Items.find((item) => item.SK.S === "DETAILS")?.createdAt.N!);
		const timeNow = Date.now();

		const minutesArray = Array.from({ length: Math.floor((timeNow - timeStarted) / (1000 * 60)) + 1 }, (_, i) => i);

		const timestamps = minutesArray.map((i) => timeStarted + i * (1000 * 60));

		const teamData = [];

		for (const index in timestamps) {
			const currentTimestamp = new Date(timestamps[index]);
			const obj: any = { timestamp: currentTimestamp.getTime() };

			for (const key in teamLabels) {
				const activity = result.Items.filter((item) => item.SK.S?.startsWith("ACTIVITY") && result.Items!.find((team) => team.SK.S == `TEAM#${key}`)!.students.SS!.includes(item.userId.S!) && parseInt(item.createdAt.N!) < timestamps[index] && item.correct && item.correct.BOOL == true);
				obj[key] = activity.length;
			}

			teamData.push(obj);
		}

		return JSON.stringify({ teamLabels, teamData });
	} catch (e) {
		console.log(e);
		return JSON.stringify({ error: "Could not retrieve competition" });
	}
});
