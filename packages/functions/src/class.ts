import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Class, ClassCreateUpdate, ClassDynamo } from "./types/class";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const itemToClass = (item: Record<string, any> | undefined): Class => {
	if (!item) {
		throw new Error("Item not found");
	}
	const packDynamo: ClassDynamo = item as unknown as ClassDynamo;
	return {
		id: packDynamo.SK.S.split("#")[1],
		name: packDynamo.name.S,
		students: packDynamo.students.L.map((student) => student.S),
		createdAt: new Date(parseInt(packDynamo.createdAt.N)).toISOString(),
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
		throw new Error("Missing id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Organisations.name,
		KeyConditionExpression: "PK = :orgId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":orgId": { S: orgId },
			":skPrefix": { S: "CLASS#" },
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
		// old
		// 		const result = await client.send(new ScanCommand(params));
		// 		const classes = itemsToClasses(result.Items);
		// 		return JSON.stringify(classes);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve classes");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId, classId } = event.pathParameters || {};
	if (!orgId || !classId) {
		throw new Error("Missing id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "CLASS#" + classId,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const clazz = itemToClass(result.Item);
		return JSON.stringify(clazz);
	} catch (e) {
		throw new Error("Could not retrieve class:" + e);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing id in path parameters");
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
			SK: "CLASS#" + createId(),
			name: data.name,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		const item = await client.send(new PutCommand(params));
		const clazz = itemToClass(item.Attributes);
		return JSON.stringify(clazz);
	} catch (e) {
		throw new Error("Could not create class");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId, classId } = event.pathParameters || {};
	if (!orgId || !classId) {
		throw new Error("Missing pk or sk in path parameters");
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
			SK: "CLASS#" + classId,
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
		throw new Error(`Could not update class ${classId} in org ${orgId}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId, classId } = event.pathParameters || {};
	if (!orgId || !classId) {
		throw new Error("Missing pk in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "CLASS#" + classId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `CLASS with SK ${classId} under org with PK ${orgId} has been deleted` });
	} catch (e) {
		throw new Error(`Could not delete class with SK ${classId} from org ${orgId}`);
	}
});
