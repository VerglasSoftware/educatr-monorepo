import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Organisation, OrganisationCreateUpdate } from "./types/organisation";
import { itemsToUsers } from "./user";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToOrganisation = (item: Record<string, any> | undefined): Organisation => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && ("S" in val || "N" in val || "L" in val);
	return {
		id: isDynamoFormat(item.PK) ? item.PK.S : (item.PK as string),
		name: isDynamoFormat(item.name) ? item.name.S : (item.name as string),
		logo: isDynamoFormat(item.logo) ? item.logo.S : (item.logo as string),
		students: isDynamoFormat(item.students) ? item.students.L.map((student: any) => student.S) : item.students,
		createdAt: isDynamoFormat(item.createdAt) ? new Date(parseInt(item.createdAt.N as string)).toISOString() : new Date(item.createdAt as string).toISOString(),
	};
};

const itemsToOrganisations = (items: Record<string, AttributeValue>[] | undefined): Organisation[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToOrganisation);
};

export const list: Handler = Util.handler(async (event) => {
	const params: ScanCommandInput = {
		TableName: Resource.Organisations.name,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: {
			":sk": { S: "DETAILS" },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const organisations = itemsToOrganisations(result.Items);
		return JSON.stringify(organisations);
	} catch (e) {
		throw new Error(`Could not retrieve organisations: ${e}`);
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing id in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const organisation = itemToOrganisation(result.Item);
		if (!organisation) {
			throw new Error("Organisation not found");
		}
		return JSON.stringify(organisation);
	} catch (e) {
		throw new Error(`Could not retrieve organisation ${orgId}: ${e}`);
	}
});

export const create: Handler = Util.handler(async (event) => {
	let data: OrganisationCreateUpdate = {
		name: "",
		logo: "",
		students: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params: PutCommandInput = {
		TableName: Resource.Organisations.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			name: data.name,
			logo: data.logo,
			students: data.students,
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		const organisation = itemToOrganisation(result.Attributes);
		return JSON.stringify(organisation);
	} catch (e) {
		throw new Error(`Could not create organisation: ${e}`);
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing id in path parameters");
	}

	let data: OrganisationCreateUpdate = {
		name: "",
		logo: "",
		students: [],
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #name = :name, #logo = :logo, #students = :students",
		ExpressionAttributeNames: {
			"#name": "name",
			"#logo": "logo",
			"#students": "students",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":logo": data.logo,
			":students": data.students,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const organisation = itemToOrganisation(result.Attributes);
		return JSON.stringify(organisation);
	} catch (e) {
		throw new Error(`Could not update organisation ${orgId}: ${e}`);
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing id in path parameters");
	}

	const params: ScanCommandInput = {
		TableName: Resource.Organisations.name,
		FilterExpression: "PK = :pk",
		ExpressionAttributeValues: {
			":pk": { S: orgId },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		if (result.Items) {
			for (const item of result.Items) {
				const deleteParams: DeleteCommandInput = {
					TableName: Resource.Organisations.name,
					Key: {
						PK: item.PK.S,
						SK: item.SK.S,
					},
				};
				await client.send(new DeleteCommand(deleteParams));
			}
		}
		return JSON.stringify({ success: true });
	} catch (e) {
		throw new Error(`Could not delete all SKs for organisation ${orgId}: ${e}`);
	}
});

export const listStudents: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Organisation not found");
		}
		const org = itemToOrganisation(result.Item);
		const students = org.students;
		console.log(`Students for organisation ${orgId}: ${students}`);

		if (!students || students.length === 0) {
			return JSON.stringify([]);
		}

		const userParams: ScanCommandInput = {
			TableName: Resource.Users.name,
			FilterExpression: students.map((_, index) => `PK = :student${index}`).join(" OR "),
			ExpressionAttributeValues: students.reduce(
				(acc: Record<string, AttributeValue>, student, index) => {
					acc[`:student${index}`] = { S: student };
					return acc;
				},
				{} as Record<string, AttributeValue>
			),
		};

		const userResult = await client.send(new ScanCommand(userParams));
		console.log(`Users for organisation ${orgId}: ${JSON.stringify(userResult.Items)}`);
		const users = itemsToUsers(userResult.Items);
		return JSON.stringify(users);
	} catch (e) {
		throw new Error(`Could not retrieve students for organisation ${orgId}: ${e}`);
	}
});
