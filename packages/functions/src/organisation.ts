import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { Organisation, OrganisationCreateUpdate, OrganisationDynamo } from "./types/organisation";
import { itemsToUsers } from "./user";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const itemToOrganisation = (item: Record<string, any> | undefined): Organisation => {
	if (!item) {
		throw new Error("Item not found");
	}
	const packDynamo: OrganisationDynamo = item as unknown as OrganisationDynamo;
	return {
		id: packDynamo.PK.S,
		name: packDynamo.name.S,
		logo: packDynamo.logo.S,
		students: packDynamo.students.L.map((student) => student.S),
		createdAt: new Date(parseInt(packDynamo.createdAt.N)).toISOString(),
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
		throw new Error("Could not retrieve organiations");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing ID in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: "ORG#" + orgId,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const organisation = itemToOrganisation(result.Item);
		return JSON.stringify(organisation);
	} catch (e) {
		throw new Error("Could not retrieve organisation");
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
		throw new Error("Could not create organisation");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing PK in path parameters");
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
			PK: "ORG#" + orgId,
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
		throw new Error("Could not update organisation details");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing PK in path parameters");
	}

	const params: DeleteCommandInput = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: orgId,
		},
	};

	try {
		await client.send(new DeleteCommand(params));
		return JSON.stringify({ message: `Organisation with PK ${orgId} has been deleted` });
	} catch (e) {
		return JSON.stringify({ message: `Could not delete organisation with PK ${orgId}` });
	}
});

export const listStudents: Handler = Util.handler(async (event) => {
	const { orgId } = event.pathParameters || {};
	if (!orgId) {
		throw new Error("Missing ID in path parameters");
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
		const students = itemToOrganisation(result.Item).students;

		const userParams: ScanCommandInput = {
			TableName: Resource.Users.name,
			FilterExpression: "PK IN (:students)",
			ExpressionAttributeValues: {
				":students": { SS: students },
			},
		};

		const userResult = await client.send(new ScanCommand(userParams));
		const users = itemsToUsers(userResult.Items);

		return JSON.stringify(users);
	} catch (e) {
		throw new Error("Could not retrieve organisation");
	}
});
