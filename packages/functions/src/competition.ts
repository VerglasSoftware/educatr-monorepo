import { Handler } from "aws-lambda";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { createId } from "@paralleldrive/cuid2";
import { Util } from "@educatr/core/util";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const params = {
		TableName: Resource.Competitions.name,
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);
		return JSON.stringify(result.Items);
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}
});

export const create: Handler = Util.handler(async (event) => {
	let data = {
		name: "",
		status: "",
        organisationId: "",
        packs: []
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			name: data.name,
			status: data.status,
			userStartedById: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
            organisationId: data.organisationId,
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not create competition");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Pack not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing pk in path parameters");
	}

	const queryParams = {
		TableName: Resource.Competitions.name,
		KeyConditionExpression: "PK = :pk",
		ExpressionAttributeValues: {
			":pk": pk,
		},
	};

	try {
		const queryCommand = new QueryCommand(queryParams);
		const queryResult = await client.send(queryCommand);
		const itemsToDelete = queryResult.Items || [];

		for (const item of itemsToDelete) {
			const deleteParams = {
				TableName: Resource.Competitions.name,
				Key: {
					PK: item.PK,
					SK: item.SK,
				},
			};
			await client.send(new DeleteCommand(deleteParams));
		}

		return JSON.stringify({ message: "All items under the specified PK have been deleted", pk });
	} catch (e) {
		throw new Error("Could not delete competition");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing pk in path parameters");
	}

	let data = {
		name: "",
		status: "",
        packs: []
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #name = :name, #status = :status, #packs = :packs",
		ExpressionAttributeNames: {
			"#name": "name",
			"#status": "status",
            "#packs": "packs"
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":status": data.status,
            ":packs": data.packs
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not update competition details");
	}
});

export const check: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	let data = {
		packId: "",
		taskId: "",
		userId: "",
        answer: ""
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Packs.name,
		Key: {
			PK: data.packId,
			SK: `TASK#${data.taskId}`,
		},
	};

	var task;

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Task not found");
		}
		task = result.Item;
	} catch (e) {
		throw new Error("Could not retrieve competition");
	}

	console.log(task.verificationType);

	switch(task.verificationType) {
		case "COMPARE":
			if (task.answer.trim() === data.answer.trim()) {
				return JSON.stringify({ result: true });
			} else {
				return JSON.stringify({ result: false });
			}
		default:
			throw new Error("Verification type not supported");
	}
});
