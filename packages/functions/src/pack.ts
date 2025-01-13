import { Handler } from "aws-lambda";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { createId } from "@paralleldrive/cuid2";
import { Util } from "@educatr/core/util";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const includeTasks = event.queryStringParameters?.include === "tasks";

	const params = {
		TableName: Resource.Packs.name,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);
		const packs = result.Items;

		if (!includeTasks) {
			return JSON.stringify(packs);
		}

		const packsWithTasks = await Promise.all(
			packs!.map(async (pack) => {
				const tasksParams = {
					TableName: Resource.Packs.name,
					FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
					ExpressionAttributeValues: {
						":packId": { S: pack.PK.S! },
						":skPrefix": { S: "TASK#" },
					},
				};

				const tasksCommand = new ScanCommand(tasksParams);
				const tasksResult = await client.send(tasksCommand);

				return {
					...pack,
					tasks: tasksResult.Items || [],
				};
			})
		);

		return JSON.stringify(packsWithTasks);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve packs");
	}
});

export const create: Handler = Util.handler(async (event) => {
	let data = {
		name: "",
		description: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Packs.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			name: data.name,
			description: data.description,
			ownerId: event.requestContext.authorizer!.jwt.claims["cognito:username"],
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not create pack");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { packId: pk } = event.pathParameters || {};
	const { include } = event.queryStringParameters || {};

	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Packs.name,
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
		throw new Error("Could not retrieve pack");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { packId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing PK in path parameters");
	}

	const queryParams = {
		TableName: Resource.Packs.name,
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
				TableName: Resource.Packs.name,
				Key: {
					PK: item.PK,
					SK: item.SK,
				},
			};
			await client.send(new DeleteCommand(deleteParams));
		}

		return JSON.stringify({ message: "All items under the specified PK have been deleted", pk });
	} catch (e) {
		throw new Error("Could not delete pack");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { packId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing PK in path parameters");
	}

	let data = {
		name: "",
		description: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Packs.name,
		Key: {
			PK: pk,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #name = :name, #description = :description",
		ExpressionAttributeNames: {
			"#name": "name",
			"#description": "description",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":description": data.description,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not update pack details");
	}
});
