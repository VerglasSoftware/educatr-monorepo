import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { itemsToTasks } from "./task";
import { Pack, PackCreateUpdate, PackDynamo, PackWithTasks } from "./types/pack";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const itemToPack = (item: Record<string, any> | undefined): Pack => {
	if (!item) {
		throw new Error("Item not found");
	}
	const packDynamo: PackDynamo = item as unknown as PackDynamo;
	return {
		id: packDynamo.PK.S,
		name: packDynamo.name.S,
		description: packDynamo.description.S,
		ownerId: packDynamo.ownerId.S,
		createdAt: new Date(parseInt(packDynamo.createdAt.N)).toISOString(),
	};
};

const itemsToPacks = (items: Record<string, AttributeValue>[] | undefined): Pack[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToPack);
};

export const list: Handler = Util.handler(async (event) => {
	const includeTasks = event.queryStringParameters?.include === "tasks";

	const params: ScanCommandInput = {
		TableName: Resource.Packs.name,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);
		const packs = itemsToPacks(result.Items);

		if (!includeTasks) {
			return JSON.stringify(packs);
		}

		// Fetch tasks for each pack
		const packsWithTasks = await Promise.all(
			packs.map(async (pack) => {
				const tasksParams: ScanCommandInput = {
					TableName: Resource.Packs.name,
					FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
					ExpressionAttributeValues: {
						":packId": { S: pack.id },
						":skPrefix": { S: "TASK#" },
					},
				};

				const tasksCommand = new ScanCommand(tasksParams);
				const tasksResult = await client.send(tasksCommand);
				const tasks = itemsToTasks(tasksResult.Items);

				return { ...pack, tasks } as PackWithTasks;
			})
		);

		return JSON.stringify(packsWithTasks);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve packs");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const includeTasks = event.queryStringParameters?.include === "tasks";
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing ID in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const pack = itemToPack(result.Item);
		if (!includeTasks) {
			return JSON.stringify(pack);
		}

		const tasksParams: ScanCommandInput = {
			TableName: Resource.Packs.name,
			FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":packId": { S: packId },
				":skPrefix": { S: "TASK#" },
			},
		};

		const tasksCommand = new ScanCommand(tasksParams);
		const tasksResult = await client.send(tasksCommand);
		const tasks = itemsToTasks(tasksResult.Items);

		return JSON.stringify({ ...pack, tasks });
	} catch (e) {
		throw new Error("Could not retrieve pack");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const includeTasks = event.queryStringParameters?.include === "tasks";
	const data: PackCreateUpdate = {
		name: "",
		description: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
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
		if (!includeTasks) {
			return JSON.stringify(itemToPack(result.Attributes));
		}

		const tasksParams: ScanCommandInput = {
			TableName: Resource.Packs.name,
			FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":packId": { S: params.Item!.PK.S },
				":skPrefix": { S: "TASK#" },
			},
		};

		const tasksCommand = new ScanCommand(tasksParams);
		const tasksResult = await client.send(tasksCommand);
		const tasks = itemsToTasks(tasksResult.Items);

		return JSON.stringify({ ...itemToPack(result.Attributes), tasks });
	} catch (e) {
		throw new Error("Could not create pack");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const includeTasks = event.queryStringParameters?.include === "tasks";
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing PK in path parameters");
	}

	let data: PackCreateUpdate = {
		name: "",
		description: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
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
		const pack = itemToPack(result.Attributes);
		if (!includeTasks) {
			return JSON.stringify(pack);
		}

		const tasksParams: ScanCommandInput = {
			TableName: Resource.Packs.name,
			FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
			ExpressionAttributeValues: {
				":packId": { S: packId },
				":skPrefix": { S: "TASK#" },
			},
		};

		const tasksCommand = new ScanCommand(tasksParams);
		const tasksResult = await client.send(tasksCommand);
		const tasks = itemsToTasks(tasksResult.Items);

		return JSON.stringify({ ...pack, tasks });
	} catch (e) {
		throw new Error("Could not update pack details");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing PK in path parameters");
	}

	const params = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `Pack with PK ${packId} has been deleted` });
	} catch (error) {
		return JSON.stringify({ message: `Could not delete pack with PK ${packId}` });
	}
});
