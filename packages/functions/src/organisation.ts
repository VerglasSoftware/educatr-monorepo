import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
	const params = {
		TableName: Resource.Organisations.name,
	};

	try {
		const command = new ScanCommand(params);
		const result = await client.send(command);
		return JSON.stringify(result.Items);
	} catch (e) {
		throw new Error("Could not retrieve organiation");
	}
});

export const create: Handler = Util.handler(async (event) => {
	let data = {
		name: "",
		logo: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else throw new Error("No body provided");

	const params = {
		TableName: Resource.Organisations.name,
		Item: {
			PK: createId(),
			SK: "DETAILS",
			name: data.name,
			logo: data.logo,
			ownerId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
			createdAt: Date.now(),
		},
	};

	try {
		const result = await client.send(new PutCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not create organisation");
	}
});

export const get: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing id in path parameters");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		if (!result.Item) {
			throw new Error("Organisation not found");
		}
		return JSON.stringify(result.Item);
	} catch (e) {
		throw new Error("Could not retrieve organisation");
	}
});

export const del: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing pk in path parameters");
	}

	const queryParams = {
		TableName: Resource.Organisations.name,
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
				TableName: Resource.Organisations.name,
				Key: {
					PK: item.PK,
					SK: item.SK,
				},
			};
			await client.send(new DeleteCommand(deleteParams));
		}

		return JSON.stringify({ message: "All items under the specified PK have been deleted", pk });
	} catch (e) {
		throw new Error("Could not delete organisation");
	}
});

export const update: Handler = Util.handler(async (event) => {
	const { id: pk } = event.pathParameters || {};

	if (!pk) {
		throw new Error("Missing pk in path parameters");
	}

	let data = {
		name: "",
		logo: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
		TableName: Resource.Organisations.name,
		Key: {
			PK: pk,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #name = :name, #logo = :logo",
		ExpressionAttributeNames: {
			"#name": "name",
			"#logo": "logo",
		},
		ExpressionAttributeValues: {
			":name": data.name,
			":logo": data.logo,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not update organisation details");
	}
});
