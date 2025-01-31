import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Task, TaskCreateUpdate, TaskDynamo } from "./types/task";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToTask = (item: Record<string, any> | undefined): Task => {
	if (!item) {
		throw new Error("Item not found");
	}
	const taskDynamo: TaskDynamo = item as unknown as TaskDynamo;
	return {
		id: taskDynamo.SK.S.split("#")[1],
		title: taskDynamo.title.S,
		subtitle: taskDynamo.subtitle.S,
		points: parseInt(taskDynamo.points.N),
		content: taskDynamo.content.S,
		answer: taskDynamo.answer.S,
		answerChoices: taskDynamo.answerChoices.L.map((choice) => ({
			correct: choice.M.correct.BOOL,
			id: choice.M.id.S,
			name: choice.M.name.S,
		})),
		verificationType: taskDynamo.verificationType.S,
		answerType: taskDynamo.answerType.S,
		placeholder: taskDynamo.placeholder.S,
		prerequisites: taskDynamo.prerequisites.L.map((prerequisite) => prerequisite.S),
		createdAt: new Date(parseInt(taskDynamo.createdAt.N)).toISOString(),
	};
};

export const itemsToTasks = (items: Record<string, AttributeValue>[] | undefined): Task[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToTask);
};

export const list: Handler = Util.handler(async (event) => {
	const { packId: pk } = event.pathParameters || {};
	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	const params: ScanCommandInput = {
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
		return JSON.stringify(itemsToTasks(result.Items));
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve packs");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { packId, taskId } = event.pathParameters || {};
	if (!packId || !taskId) {
		throw new Error("Missing ID in path parameters");
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
		return JSON.stringify(itemToTask(result.Item));
	} catch (e) {
		throw new Error("Could not retrieve task:" + e);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { packId } = event.pathParameters || {};
	if (!packId) {
		throw new Error("Missing ID in path parameters");
	}

	const data: TaskCreateUpdate = {
		title: "",
		subtitle: "",
		points: 0,
		content: "",
		answer: "",
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
			SK: "TASK#" + createId(),
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
		return JSON.stringify(itemToTask(params.Item));
	} catch (e) {
		throw new Error("Could not create pack");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { packId, taskId } = event.pathParameters || {};
	if (!packId || !taskId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	const data: TaskCreateUpdate = {
		title: "",
		subtitle: "",
		points: 0,
		content: "",
		answer: "",
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
			SK: "TASK#" + taskId,
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
		return JSON.stringify(itemToTask(result.Attributes));
	} catch (e) {
		throw new Error(`Could not update task ${taskId} in pack ${packId}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { packId, taskId } = event.pathParameters || {};
	if (!packId || !taskId) {
		throw new Error("Missing PK in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Packs.name,
		Key: {
			PK: packId,
			SK: "TASK#" + taskId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `Task with SK ${taskId} under pack with PK ${packId} has been deleted` });
	} catch (e) {
		throw new Error(`Could not delete task with SK ${taskId} from pack ${packId}`);
	}
});
