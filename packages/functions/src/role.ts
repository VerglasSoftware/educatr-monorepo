import { AttributeValue, DynamoDBClient, QueryCommand, ReturnValue } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Role, RoleCreateUpdate } from "./types/role";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToRole = (item: Record<string, any> | undefined): Role => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val || "L" in val);
	return {
		id: isDynamoFormat(item.SK) ? item.SK.S.split("#")[1] : item.SK.split("#")[1],
		name: isDynamoFormat(item.name) ? item.name.S : (item.name as string),
		permissions: isDynamoFormat(item.permissions) ? item.permissions.L.map((permission: any) => permission.S) : (item.permissions as string[]),
		createdAt: isDynamoFormat(item.createdAt) ? new Date(parseInt(item.createdAt.N as string)).toISOString() : new Date(item.createdAt as string).toISOString(),
	};
};

const itemsToRoles = (items: Record<string, AttributeValue>[] | undefined): Role[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToRole);
};

export const list: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Organisations.name,
		FilterExpression: "PK = :orgId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":orgId": { S: orgId },
			":skPrefix": { S: "ROLE#" },
		},
	};

	try {
		const command = new QueryCommand(params);
		const result = await client.send(command);
		return JSON.stringify(itemsToRoles(result.Items));
	} catch (e) {
		throw new Error(`Could not retrieve roles for org ${orgId}: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId, roleId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}
	if (!roleId) {
		throw new Error("Missing role id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: `ROLE#${roleId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const role = itemToRole(result.Item);
		if (!role) {
			throw new Error("Role not found");
		}
		return JSON.stringify(role);
	} catch (e) {
		throw new Error(`Could not retrieve role ${roleId} in org ${orgId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}

	const data: RoleCreateUpdate = {
		name: "",
		permissions: [],
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Organisations.name,
		Item: {
			PK: orgId,
			SK: `ROLE#${createId()}`,
			name: data.name,
			permissions: data.permissions,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		const role = itemToRole(params.Item);
		return JSON.stringify(role);
	} catch (e) {
		throw new Error(`Could not create role in org ${orgId}: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId, roleId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}
	if (!roleId) {
		throw new Error("Missing role id in path parameters");
	}

	let data: RoleCreateUpdate = {
		name: "",
		permissions: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: `ROLE#${roleId}`,
		},
		UpdateExpression: "SET #name = :name, #permissions = :permissions",
		ExpressionAttributeNames: {
			"#name": "name",
			"#permissions": "permissions",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":permissions": data.permissions,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const role = itemToRole(result.Attributes);
		return JSON.stringify(role);
	} catch (e) {
		throw new Error(`Could not update role ${roleId} in org ${orgId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId, roleId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}
	if (!roleId) {
		throw new Error("Missing role id in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: `ROLE#${roleId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete role ${roleId} in org ${orgId}: ${e}`);
	}
});
