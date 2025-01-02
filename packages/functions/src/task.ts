import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const { packId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Packs.name,
		FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":packId": { S: pk },
			":skPrefix": { S: "TASK#" },
		},
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);

		const packs =
			result.Items?.map((item) => {
				const sk = item.SK.S as string;
				const id = sk.split("#")[1];
				return { ...item, id };
			}) || [];

		return JSON.stringify(packs);
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve packs");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { packId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	let data;

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Packs.name,
		Item: {
			PK: pk,
			SK: `TASK#${createId()}`,
			title: data.title,
			subtitle: data.subtitle,
			points: data.points,
			content: data.content,
			answer: data.answer,
			verificationType: data.verificationType,
			answerType: data.answerType,
			placeholder: data.placeholder,
			prerequisites: data.prerequisites,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(params.Item);
	} catch (e) {
		throw new Error("Could not create pack");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { packId: pk, taskId } = event.pathParameters || {};

	if (!pk || !taskId) {
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Packs.name,
		Key: {
			PK: pk,
			SK: `TASK#${taskId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Task not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve task:" + e);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { packId: pk, taskId } = event.pathParameters || {};

	if (!pk || !taskId) {
		throw new Error("Missing PK in path parameters");
	}

	const deleteParams = {
		TableName: Resource.Packs.name,
		Key: {
			PK: pk,
			SK: `TASK#${taskId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(deleteParams));

		return JSON.stringify({
			message: `Task with SK ${taskId} under pack with PK ${pk} has been deleted`,
			pk,
			taskId,
		});
	} catch (e) {
		throw new Error(`Could not delete task with SK ${taskId} from pack ${pk}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { packId: pk, taskId } = event.pathParameters || {};

	if (!pk || !taskId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	let data;

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Packs.name,
		Key: {
			PK: pk,
			SK: `TASK#${taskId}`,
		},
		UpdateExpression: "SET #title = :title, #subtitle = :subtitle, #points = :points, #content = :content, #answer = :answer, #verificationType = :verificationType, #answerType = :answerType, #placeholder = :placeholder, #prerequisites = :prerequisites",
		ExpressionAttributeNames: {
			"#title": "title",
			"#subtitle": "subtitle",
			"#points": "points",
			"#content": "content",
			"#answer": "answer",
			"#verificationType": "verificationType",
			"#answerType": "answerType",
			"#placeholder": "placeholder",
			"#prerequisites": "prerequisites",
		},
		ExpressionAttributeValues: {
			":title": data.title,
			":subtitle": data.subtitle,
			":points": data.points,
			":content": data.content,
			":answer": data.answer,
			":verificationType": data.verificationType,
			":answerType": data.answerType,
			":placeholder": data.placeholder,
			":prerequisites": data.prerequisites,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		console.log(e);
		throw new Error(`Could not update task ${taskId} in pack ${pk}`);
	}
});
