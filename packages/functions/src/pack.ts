import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Pack, PackCreateUpdate } from "./types/pack";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToPack = (item: Record<string, any> | undefined): Pack => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val);
	return {
		id: isDynamoFormat(item.PK) ? item.PK.S : (item.PK as string),
		name: isDynamoFormat(item.name) ? item.name.S : (item.name as string),
		description: isDynamoFormat(item.description) ? item.description.S : (item.description as string),
		ownerId: isDynamoFormat(item.ownerId) ? item.ownerId.S : (item.ownerId as string),
		createdAt: isDynamoFormat(item.createdAt) ? new Date(parseInt(item.createdAt.N as string)).toISOString() : new Date(item.createdAt as string).toISOString(),
	};
};

const itemsToPacks = (items: Record<string, AttributeValue>[] | undefined): Pack[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToPack);
};

export const list: Handler = Util.handler(async (event) => {
	const params: ScanCommandInput = {
		TableName: Resource.Packs.name,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const packs = itemsToPacks(result.Items);
		return JSON.stringify(packs);
	} catch (e) {
		throw new Error(`Could not retrieve packs: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing id in path parameters");
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
		if (!pack) {
			throw new Error("Pack not found");
		}
		return JSON.stringify(pack);
	} catch (e) {
		throw new Error(`Could not retrieve pack ${packId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
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
		await client.send(new PutCommand(params));
		const pack = itemToPack(params.Item);
		return JSON.stringify(pack);
	} catch (e) {
		throw new Error(`Could not create pack: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing id in path parameters");
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
		return JSON.stringify(pack);
	} catch (e) {
		throw new Error(`Could not update pack ${packId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Packs.name,
		FilterExpression: "PK = :pk",
		ExpressionAttributeValues: {
			":pk": { S: packId },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		if (result.Items) {
			for (const item of result.Items) {
				const deleteParams: DeleteCommandInput = {
					TableName: Resource.Packs.name,
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
		throw new Error(`Could not delete all SKs for pack ${packId}: ${e}`);
	}
});
