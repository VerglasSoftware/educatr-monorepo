import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import axios from "axios";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const params = {
		TableName: Resource.Competitions.name,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);
		return JSON.stringify(result.Items);
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}
});

export const create: Handler = Util.handler(async (event) => {
	let data = {
		name: "",
		status: "",
		organisationId: "",
		packs: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			name: data.name,
			status: data.status || "NOT_STARTED",
			userStartedById: event.requestContext.authorizer!.jwt.claims["cognito:username"],
			organisationId: data.organisationId,
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not create competition");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Pack not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing pk in path parameters");
	}

	const queryParams = {
		TableName: Resource.Competitions.name,
		KeyConditionExpression: "PK = :pk",
		ExpressionAttributeValues: {
			":pk": pk,
		},
	};

	try {
		const queryCommand = new QueryCommand(queryParams);
		const queryResult = await client.send(queryCommand);
		const itemsToDelete = queryResult.Items || [];

		for (const item of itemsToDelete) {
			const deleteParams = {
				TableName: Resource.Competitions.name,
				Key: {
					PK: item.PK,
					SK: item.SK,
				},
			};
			await client.send(new DeleteCommand(deleteParams));
		}

		return JSON.stringify({ message: "All items under the specified PK have been deleted", pk });
	} catch (e) {
		throw new Error("Could not delete competition");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing pk in path parameters");
	}

	let data = {
		name: "",
		status: "",
		packs: [],
		showLeaderboard: true,
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
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not update competition details");
	}
});

export const check: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	let data = {
		packId: "",
		taskId: "",
		answer: "",
		stdin: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	// get the task
	const params = {
		TableName: Resource.Packs.name,
		Key: {
			PK: data.packId,
			SK: `TASK#${data.taskId}`,
		},
	};

	var task;
	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Task not found");
		}
		task = result.Item;
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}

	async function returnAnswer(result: boolean) {
		// create activity
		const params = {
			TableName: Resource.Competitions.name,
			Item: {
				PK: pk,
				SK: "ACTIVITY#" + createId(),
				userId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
				packId: data.packId,
				taskId: data.taskId,
				correct: result,
				createdAt: Date.now(),
			},
		};

		try {
			const putResult = await client.send(new PutCommand(params));
		} catch (e) {
			throw new Error("Could not create activity");
		}

		// send to all connected clients
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
						body: params.Item,
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
		return JSON.stringify({ result });
	}

	switch (task.verificationType) {
		case "COMPARE":
			if (task.answer.trim() === data.answer.trim()) {
				return await returnAnswer(true);
			} else {
				return await returnAnswer(false);
			}
		case "MULTIPLE":
			const possibleAnswers = JSON.parse(task.answer);
			const correctAnswer = possibleAnswers.find((answer: any) => answer.correct === true);
			if (correctAnswer.text == data.answer) {
				return await returnAnswer(true);
			} else {
				return await returnAnswer(false);
			}
		case "ALGORITHM":
			const languageMap = {
				PYTHON: 71,
				CSHARP: 51,
			};

			const languageId = languageMap[task.answerType];
			if (!languageId) {
				throw new Error("Answer type not supported");
			}
			var result;
			try {
				result = await axios.post(`${Resource.ExecuteApi.url}/submissions`, {
					stdin: data.stdin,
					source_code: data.answer.trim(),
					language_id: languageId,
				});
			} catch (e) {
				console.log(e.response.data);
				return await returnAnswer(false);
			}
			if (result.status == 201) {
				const submissionId = result.data.token;
				var status;
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
			const params = {
				TableName: Resource.Competitions.name,
				Item: {
					PK: pk,
					SK: "ACTIVITY#" + createId(),
					status: "WAITING",
					userId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
					packId: data.packId,
					taskId: data.taskId,
					createdAt: Date.now(),
				},
			};

			var putResult: any;

			try {
				putResult = await client.send(new PutCommand(params));
			} catch (e) {
				throw new Error("Could not create activity");
			}
			return JSON.stringify({ manual: true });
		default:
			throw new Error("Verification type not supported");
	}
});

export const run: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	let data = {
		language: "",
		code: "",
		stdin: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const languageMap = {
		PYTHON: 71,
		CSHARP: 51,
	};

	const languageId = languageMap[data.language];
	if (!languageId) {
		throw new Error("Answer type not supported");
	}
	var result;
	try {
		result = await axios.post(`${Resource.ExecuteApi.url}/submissions`, {
			source_code: data.code.trim(),
			language_id: languageId,
			stdin: data.stdin,
		});
		console.log(result);
	} catch (e) {
		console.log(e.response.data);
		throw new Error("Could not run submission");
	}
	if (result.status == 201) {
		const submissionId = result.data.token;
		var status;
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
				const activity = result.Items.filter((item) => item.SK.S?.startsWith("ACTIVITY") && result.Items!.find((team) => team.SK.S == `TEAM#${key}`)!.students.SS!.includes(item.userId.S!) && parseInt(item.createdAt.N!) < timestamps[index] && item.correct.BOOL == true);
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
