import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Team, TeamCreateUpdate } from "./types/team";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToTeam = (item: Record<string, any> | undefined): Team => {
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

export const itemsToTeams = (items: Record<string, AttributeValue>[] | undefined): Team[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToTeam);
};

export const list: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Competitions.name,
		FilterExpression: "PK = :compId AND begins_with(SK, :skPrefix)",
		ExpressionAttributeValues: {
			":compId": { S: compId },
			":skPrefix": { S: "TEAM#" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const teams = itemsToTeams(result.Items);
		return JSON.stringify(teams);
	} catch (e) {
		throw new Error(`Could not retrieve teams for competition ${compId}: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { compId, teamId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!teamId) {
		throw new Error("Missing team id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: `TEAM#${teamId}`,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const team = itemToTeam(result.Item);
		if (!team) {
			throw new Error("Team not found");
		}
		return JSON.stringify(team);
	} catch (e) {
		throw new Error(`Could not retrieve team ${teamId} for competition ${compId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}

	const data: TeamCreateUpdate = {
		name: "",
		students: [],
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Competitions.name,
		Item: {
			PK: compId,
			SK: `TEAM#${createId()}`,
			name: data.name,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		const team = itemToTeam(params.Item);
		return JSON.stringify(team);
	} catch (e) {
		throw new Error(`Could not create team in competition ${compId}: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId, teamId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!teamId) {
		throw new Error("Missing team id in path parameters");
	}

	const data: TeamCreateUpdate = {
		name: "",
		students: [],
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
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
		const team = itemToTeam(result.Attributes);
		return JSON.stringify(team);
	} catch (e) {
		throw new Error(`Could not update team ${teamId} for competition ${compId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { compId, teamId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing competition id in path parameters");
	}
	if (!teamId) {
		throw new Error("Missing team id in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: `TEAM#${teamId}`,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete team ${teamId} for competition ${compId}: ${e}`);
	}
});
