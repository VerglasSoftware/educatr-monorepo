import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Task, TaskCreateUpdate } from "./types/task";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToTask = (item: Record<string, any> | undefined): Task => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val || "BOOL" in val || "L" in val || "M" in val);
	return {
		id: isDynamoFormat(item.SK) ? item.SK.S.split("#")[1] : item.SK.split("#")[1],
		title: isDynamoFormat(item.title) ? item.title.S : item.title,
		subtitle: isDynamoFormat(item.subtitle) ? item.subtitle.S : item.subtitle,
		points: isDynamoFormat(item.points) ? parseInt(item.points.N) : item.points,
		content: isDynamoFormat(item.content) ? item.content.S : item.content,
		answer: isDynamoFormat(item.answer) ? item.answer.S : item.answer,
		stdin: isDynamoFormat(item.stdin) ? item.stdin.S : item.stdin,
		answerChoices: isDynamoFormat(item.answerChoices)
			? item.answerChoices.L.map((choice: any) => ({
					correct: choice.M.correct ? choice.M.correct.BOOL : undefined,
					id: choice.M.id.S,
					name: choice.M.name.S,
				}))
			: item.answerChoices,
		verificationType: isDynamoFormat(item.verificationType) ? item.verificationType.S : item.verificationType,
		answerType: isDynamoFormat(item.answerType) ? item.answerType.S : item.answerType,
		placeholder: isDynamoFormat(item.placeholder) ? item.placeholder.S : item.placeholder,
		prerequisites: isDynamoFormat(item.prerequisites) ? item.prerequisites.L.map((prerequisite: any) => prerequisite.S) : item.prerequisites,
		createdAt: isDynamoFormat(item.createdAt) ? new Date(parseInt(item.createdAt.N)).toISOString() : new Date(item.createdAt).toISOString(),
	};
};

export const itemsToTasks = (items: Record<string, AttributeValue>[] | undefined): Task[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToTask);
};

export const list: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Packs.name,
		FilterExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":pk": { S: packId },
			":skPrefix": { S: "TASK#" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const tasks = itemsToTasks(result.Items);
		return JSON.stringify(tasks);
	} catch (e) {
		throw new Error(`Could not retrieve tasks for pack ${packId}: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { packId, taskId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing pack id in path parameters");
	}
	if (!taskId) {
		throw new Error("Missing task id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
			SK: `TASK#${taskId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const task = itemToTask(result.Item);
		if (!task) {
			throw new Error("Task not found");
		}
		return JSON.stringify(task);
	} catch (e) {
		throw new Error(`Could not retrieve task ${taskId} for pack ${packId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing id in path parameters");
	}

	const data: TaskCreateUpdate = {
		title: "",
		subtitle: "",
		points: 0,
		content: "",
		answer: "",
		stdin: "",
		answerChoices: [],
		verificationType: "",
		answerType: "",
		placeholder: "",
		prerequisites: [],
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Packs.name,
		Item: {
			PK: packId,
			SK: `TASK#${createId()}`,
			title: data.title,
			subtitle: data.subtitle,
			points: data.points,
			content: data.content,
			answer: data.answer,
			answerChoices: data.answerChoices,
			stdin: data.stdin,
			verificationType: data.verificationType,
			answerType: data.answerType,
			placeholder: data.placeholder,
			prerequisites: data.prerequisites,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		const task = itemToTask(params.Item);
		return JSON.stringify(task);
	} catch (e) {
		throw new Error(`Could not create task for pack ${packId}: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { packId, taskId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing pack id in path parameters");
	}
	if (!taskId) {
		throw new Error("Missing task id in path parameters");
	}

	const data: TaskCreateUpdate = {
		title: "",
		subtitle: "",
		points: 0,
		content: "",
		answer: "",
		stdin: "",
		answerChoices: [],
		verificationType: "",
		answerType: "",
		placeholder: "",
		prerequisites: [],
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else {
		throw new Error("No body provided");
	}

	const params: UpdateCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
			SK: `TASK#${taskId}`,
		},
		UpdateExpression: "SET #title = :title, #subtitle = :subtitle, #points = :points, #content = :content, #answer = :answer, #answerChoices = :answerChoices, #verificationType = :verificationType, #answerType = :answerType, #placeholder = :placeholder, #prerequisites = :prerequisites, #stdin = :stdin",
		ExpressionAttributeNames: {
			"#title": "title",
			"#subtitle": "subtitle",
			"#points": "points",
			"#content": "content",
			"#answer": "answer",
			"#answerChoices": "answerChoices",
			"#verificationType": "verificationType",
			"#answerType": "answerType",
			"#placeholder": "placeholder",
			"#prerequisites": "prerequisites",
			"#stdin": "stdin",
		},
		ExpressionAttributeValues: {
			":title": data.title,
			":subtitle": data.subtitle,
			":points": data.points,
			":content": data.content,
			":answer": data.answer,
			":answerChoices": data.answerChoices,
			":verificationType": data.verificationType,
			":answerType": data.answerType,
			":placeholder": data.placeholder,
			":prerequisites": data.prerequisites,
			":stdin": data.stdin,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const task = itemToTask(result.Attributes);
		return JSON.stringify(task);
	} catch (e) {
		throw new Error(`Could not update task ${taskId} for pack ${packId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { packId, taskId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing pack id in path parameters");
	}
	if (!taskId) {
		throw new Error("Missing task id in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
			SK: `TASK#${taskId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete task ${taskId} for pack ${packId}: ${e}`);
	}
});
