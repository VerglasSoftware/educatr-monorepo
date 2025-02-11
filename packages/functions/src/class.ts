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
		KeyConditionExpression: "PK = :orgId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":orgId": pk,
			":skPrefix": "CLASS#",
		},
	};

	try {
		const command = new QueryCommand(params);
		const result = await client.send(command);

		const orgs =
			result.Items?.map((item) => {
				const sk = item.SK;
				const id = sk.split("#")[1];
				return { ...item, id };
			}) || [];

		return JSON.stringify(orgs);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve classes");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	let data = {
		name: "",
		students: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Organisations.name,
		Item: {
			PK: pk,
			SK: `CLASS#${createId()}`,
			name: data.name,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(params.Item);
	} catch (e) {
		throw new Error("Could not create class");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId: pk, classId } = event.pathParameters || {};

	if (!pk || !classId) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
			SK: `CLASS#${classId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("CLASS not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve class:" + e);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId: pk, classId } = event.pathParameters || {};

	if (!pk || !classId) {
		throw new Error("Missing pk in path parameters");
	}

	const deleteParams = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
			SK: `CLASS#${classId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(deleteParams));

		return JSON.stringify({
			message: `CLASS with SK ${classId} under org with PK ${pk} has been deleted`,
			pk,
			classId,
		});
	} catch (e) {
		throw new Error(`Could not delete class with SK ${classId} from org ${pk}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId: pk, classId } = event.pathParameters || {};

	if (!pk || !classId) {
		throw new Error("Missing pk or sk in path parameters");
	}

	let data = {
		name: "",
		students: [],
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
			SK: `CLASS#${classId}`,
		},
		UpdateExpression: "SET #name = :name, #students = :students",
		ExpressionAttributeNames: {
			"#name": "name",
			"#students": "students",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":students": data.students,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error(`Could not update class ${classId} in org ${pk}`);
	}
});
