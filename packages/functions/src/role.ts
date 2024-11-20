import { Handler } from "aws-lambda";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { createId } from "@paralleldrive/cuid2";
import { Util } from "@educatr/core/util";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const { orgId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		FilterExpression: "PK = :orgId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":orgId": { S: pk },
			":skPrefix": { S: "ROLE#" },
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);

		const orgs =
			result.Items?.map((item) => {
				const sk = item.SK.S as string;
				const id = sk.split("#")[1];
				return { ...item, id };
			}) || [];

		return JSON.stringify(orgs);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve roles");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	let data = {
		name: "",
		permissions: []
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Organisations.name,
		Item: {
			PK: pk,
			SK: `ROLE#${createId()}`,
			name: data.name,
			permissions: data.permissions,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(params.Item);
	} catch (e) {
		throw new Error("Could not create role");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId: pk, roleId } = event.pathParameters || {};

	if (!pk || !roleId) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
			SK: `ROLE#${roleId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("ROLE not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve role:" + e);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId: pk, roleId } = event.pathParameters || {};

	if (!pk || !roleId) {
		throw new Error("Missing pk in path parameters");
	}

	const deleteParams = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
			SK: `ROLE#${roleId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(deleteParams));

		return JSON.stringify({
			message: `ROLE with SK ${roleId} under org with PK ${pk} has been deleted`,
			pk,
			roleId,
		});
	} catch (e) {
		throw new Error(`Could not delete role with SK ${roleId} from org ${pk}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId: pk, roleId } = event.pathParameters || {};

	if (!pk || !roleId) {
		throw new Error("Missing pk or sk in path parameters");
	}

	let data = {
		name: "",
		permissions: []
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
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
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error(`Could not update role ${roleId} in org ${pk}`);
	}
});
