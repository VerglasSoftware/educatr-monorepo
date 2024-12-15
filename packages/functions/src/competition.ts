import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const params = {
		TableName: Resource.Competitions.name,
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
			userStartedById: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
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
		UpdateExpression: "SET #name = :name, #status = :status, #packs = :packs",
		ExpressionAttributeNames: {
			"#name": "name",
			"#status": "status",
			"#packs": "packs",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":status": data.status,
			":packs": data.packs,
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
		userId: "",
		answer: "",
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

	console.log(task.verificationType);

	async function returnAnswer(result: boolean) {
		// create activity
		const params = {
			TableName: Resource.Competitions.name,
			Item: {
				PK: pk,
				SK: "ACTIVITY#" + createId(),
				userId: data.userId,
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
			var result;
			if (task.answerType === "PYTHON") {
				// result = await API.post(Resource.ExecuteApi.url, `/submissions`, {
				// 	body: {
				// 		source_code: data.answer,
				// 		language_id: 71,
				// 	},
				// });
				console.log(result);
			} else if (task.answerType === "CSHARP") {
				// result = await API.post(Resource.ExecuteApi.url, `/submissions`, {
				// 	body: {
				// 		source_code: data.answer,
				// 		language_id: 51,
				// 	},
				// });
				console.log(result, "yes");
			} else {
				throw new Error("Answer type not supported");
			}
			console.log(result);
		default:
			throw new Error("Verification type not supported");
	}
});
