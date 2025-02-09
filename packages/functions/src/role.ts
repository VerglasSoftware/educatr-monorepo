import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Role, RoleCreateUpdate, RoleDynamo } from "./types/role";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const itemToRole = (item: Record<string, any> | undefined): Role => {
	if (!item) {
		throw new Error("Item not found");
	}
	const roleDynamo: RoleDynamo = item as unknown as RoleDynamo;
	return {
		id: roleDynamo.SK.S.split("#")[1],
		name: roleDynamo.name.S,
		permissions: roleDynamo.permissions.L.map((permission) => permission.S),
		createdAt: new Date(parseInt(roleDynamo.createdAt.N)).toISOString(),
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
		throw new Error("Missing id in path parameters");
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
		const command = new ScanCommand(params);
		const result = await client.send(command);
		return JSON.stringify(itemsToRoles(result.Items));
	} catch (e) {
		throw new Error("Could not retrieve roles");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId, roleId } = event.pathParameters || {};
	if (!orgId || !roleId) {
		throw new Error("Missing id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "ROLE#" + roleId,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		return JSON.stringify(itemToRole(result.Item));
	} catch (e) {
		throw new Error("Could not retrieve role:" + e);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing id in path parameters");
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
			SK: "ROLE#" + createId(),
			name: data.name,
			permissions: data.permissions,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(itemToRole(params.Item));
	} catch (e) {
		throw new Error("Could not create role");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId, roleId } = event.pathParameters || {};
	if (!orgId || !roleId) {
		throw new Error("Missing pk or sk in path parameters");
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
			SK: "ROLE#" + roleId,
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
		return JSON.stringify(itemToRole(result.Attributes));
	} catch (e) {
		throw new Error(`Could not update role ${roleId} in org ${orgId}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId, roleId } = event.pathParameters || {};
	if (!orgId || !roleId) {
		throw new Error("Missing pk in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "ROLE#" + roleId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `ROLE with SK ${roleId} under org with PK ${orgId} has been deleted` });
	} catch (e) {
		throw new Error(`Could not delete role with SK ${roleId} from org ${orgId}`);
	}
});
