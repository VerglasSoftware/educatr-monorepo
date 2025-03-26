import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Class, ClassCreateUpdate } from "./types/class";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToClass = (item: Record<string, any> | undefined): Class => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val || "L" in val);
	return {
		id: isDynamoFormat(item.SK) ? item.SK.S.split("#")[1] : item.SK.split("#")[1],
		name: isDynamoFormat(item.name) ? item.name.S : item.name,
		students: isDynamoFormat(item.students) ? item.students.L.map((student: any) => student.S) : item.students,
		createdAt: isDynamoFormat(item.createdAt) ? new Date(parseInt(item.createdAt.N)).toISOString() : new Date(item.createdAt).toISOString(),
	};
};

const itemsToClasses = (items: Record<string, AttributeValue>[] | undefined): Class[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToClass);
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
			":skPrefix": { S: "CLASS#" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const classes = itemsToClasses(result.Items);
		return JSON.stringify(classes);
	} catch (e) {
		console.error(e);
		throw new Error(`Could not retrieve classes for organisation ${orgId}: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId, classId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}
	if (!classId) {
		throw new Error("Missing class id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: `CLASS#${classId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const clazz = itemToClass(result.Item);
		if (!clazz) {
			throw new Error("Class not found");
		}
		return JSON.stringify(clazz);
	} catch (e) {
		throw new Error(`Could not retrieve class ${classId} from organisation ${orgId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}

	let data: ClassCreateUpdate = {
		name: "",
		students: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Organisations.name,
		Item: {
			PK: orgId,
			SK: `CLASS#${createId()}`,
			name: data.name,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		const clazz = itemToClass(params.Item);
		return JSON.stringify(clazz);
	} catch (e) {
		throw new Error(`Could not create class in organisation ${orgId}: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId, classId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}
	if (!classId) {
		throw new Error("Missing class id in path parameters");
	}

	let data: ClassCreateUpdate = {
		name: "",
		students: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
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
		const clazz = itemToClass(result.Attributes);
		return JSON.stringify(clazz);
	} catch (e) {
		throw new Error(`Could not update class ${classId} in organisation ${orgId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId, classId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing organisation id in path parameters");
	}
	if (!classId) {
		throw new Error("Missing class id in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: `CLASS#${classId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete class ${classId} in organisation ${orgId}: ${e}`);
	}
});
