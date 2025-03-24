import { AttributeValue, DynamoDBClient, QueryCommand, ReturnValue } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Team, TeamCreateUpdate, TeamDynamo } from "./types/team";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToTeam = (item: Record<string, any> | undefined): Team => {
	if (!item) {
		throw new Error("Item not found");
	}
	const teamDynamo: TeamDynamo = item as unknown as TeamDynamo;
	return {
		id: teamDynamo.SK.S.split("#")[1],
		name: teamDynamo.name.S,
		students: teamDynamo.students.L.map((student) => student.S),
		createdAt: new Date(parseInt(teamDynamo.createdAt.N)).toISOString(),
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
		throw new Error("Missing ID in path parameters");
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
		const command = new QueryCommand(params);
		const result = await client.send(command);
		return JSON.stringify(itemsToTeams(result.Items));
	} catch (e) {
		console.error(e);
		throw new Error("Could not retrieve teams");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { compId, teamId } = event.pathParameters || {};
	if (!compId || !teamId) {
		throw new Error("Missing ID in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "TEAM#" + teamId,
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		return JSON.stringify(itemToTeam(result.Item));
	} catch (e) {
		throw new Error("Could not retrieve team:" + e);
	}
});

export const create: Handler = Util.handler(async (event) => {
	const { compId } = event.pathParameters || {};
	if (!compId) {
		throw new Error("Missing ID in path parameters");
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
			SK: "TEAM#" + createId(),
			name: data.name,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		await client.send(new PutCommand(params));
		return JSON.stringify(itemToTeam(params.Item));
	} catch (e) {
		throw new Error("Could not create team");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { compId, teamId } = event.pathParameters || {};
	if (!compId || !teamId) {
		throw new Error("Missing PK or SK in path parameters");
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
			SK: "TEAM#" + teamId,
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
		return JSON.stringify(itemToTeam(result.Attributes));
	} catch (e) {
		throw new Error(`Could not update team ${teamId} in comp ${compId}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { compId, teamId } = event.pathParameters || {};
	if (!compId || !teamId) {
		throw new Error("Missing PK in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Competitions.name,
		Key: {
			PK: compId,
			SK: "TEAM#" + teamId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `Team with SK ${teamId} from comp with PK ${compId} has been deleted` });
	} catch (e) {
		throw new Error(`Could not delete team with SK ${teamId} from comp ${compId}`);
	}
});
