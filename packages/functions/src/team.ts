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
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :orgId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":orgId": { S: pk },
			":skPrefix": { S: "TEAM#" },
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
		throw new Error("Could not retrieve teams");
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { orgId: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing ID in path parameters");
	}

	let data = {
		name: "",
		students: []
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: pk,
			SK: `TEAM#${createId()}`,
			name: data.name,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(params.Item);
	} catch (e) {
		throw new Error("Could not create team");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId: pk, teamId } = event.pathParameters || {};

	if (!pk || !teamId) {
		throw new Error("Missing ID in path parameters");
	}

	const params = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `TEAM#${teamId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("TEAM not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve team:" + e);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId: pk, teamId } = event.pathParameters || {};

	if (!pk || !teamId) {
		throw new Error("Missing pk in path parameters");
	}

	const deleteParams = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: pk,
			SK: `TEAM#${teamId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(deleteParams));

		return JSON.stringify({
			message: `TEAM with SK ${teamId} under org with PK ${pk} has been deleted`,
			pk,
			teamId,
		});
	} catch (e) {
		throw new Error(`Could not delete team with SK ${teamId} from org ${pk}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId: pk, teamId } = event.pathParameters || {};

	if (!pk || !teamId) {
		throw new Error("Missing PK or SK in path parameters");
	}

	let data = {
		name: "",
		students: []
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
			SK: `TEAM#${teamId}`,
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
		throw new Error(`Could not update team ${teamId} in org ${pk}`);
	}
});