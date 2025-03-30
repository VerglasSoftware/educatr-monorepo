import { AttributeValue, DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { User, UserRole, UserUpdate } from "./types/user";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToUser = (item: Record<string, any> | undefined): User => {
	if (!item) {
		throw new Error("Item not found");
	}
	const isDynamoFormat = (val: any) => typeof val === "object" && val !== null && "S" in val;
	return {
		id: isDynamoFormat(item.PK) ? item.PK.S : (item.PK as string),
		email: isDynamoFormat(item.email) ? item.email.S : (item.email as string),
		role: isDynamoFormat(item.role) ? UserRole[item.role.S as keyof typeof UserRole] : UserRole[item.role as keyof typeof UserRole],
		given_name: isDynamoFormat(item.given_name) ? item.given_name.S : (item.given_name as string),
		family_name: isDynamoFormat(item.family_name) ? item.family_name.S : (item.family_name as string),
		nickname: isDynamoFormat(item.nickname) ? item.nickname.S : (item.nickname as string),
		picture: isDynamoFormat(item.picture) ? item.picture.S : (item.picture as string),
	};
};

export const itemsToUsers = (items: Record<string, AttributeValue>[] | undefined): User[] => {
	if (!items) {
		throw new Error("Items not found");
	}
	return items.map(itemToUser);
};

export const getMe: Handler = Util.handler(async (event) => {
	const cognitoUid: string = event.requestContext.authorizer!.jwt.claims["cognito:username"];

	const params: GetCommandInput = {
		TableName: Resource.Users.name,
		Key: {
			PK: cognitoUid,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const user = result.Item;
		if (!user) {
			throw new Error("Item not found");
		}
		return JSON.stringify(itemToUser(user));
	} catch (e) {
		throw new Error(`Could not retrieve user ${cognitoUid}: ${e}`);
	}
});

export const updateMe: Handler = Util.handler(async (event) => {
	const cognitoUid: string = event.requestContext.authorizer!.jwt.claims["cognito:username"];

	const data: UserUpdate = {
		given_name: "",
		family_name: "",
		nickname: "",
		picture: "",
	};

	if (event.body != null) {
		Object.assign(data, JSON.parse(event.body));
	} else throw new Error("No body provided");

	const params: UpdateCommandInput = {
		TableName: Resource.Users.name,
		Key: {
			PK: "USER#" + cognitoUid,
			SK: "DETAILS",
		},
		UpdateExpression: "SET #given_name = :given_name, #family_name = :family_name, #nickname = :nickname, #picture = :picture",
		ExpressionAttributeNames: {
			"#given_name": "given_name",
			"#family_name": "family_name",
			"#nickname": "nickname",
			"#picture": "picture",
		},
		ExpressionAttributeValues: {
			":given_name": data.given_name,
			":family_name": data.family_name,
			":nickname": data.nickname,
			":picture": data.picture,
		},
		ReturnValues: ReturnValue.ALL_NEW,
	};

	try {
		const result = await client.send(new UpdateCommand(params));
		const user = itemToUser(result.Attributes);
		return JSON.stringify(user);
	} catch (e) {
		throw new Error(`Could not update user ${cognitoUid}: ${e}`);
	}
});

export const getCognito: Handler = Util.handler(async (event) => {
	const { cognitoUid } = event.pathParameters || {};
	if (!cognitoUid) {
		throw new Error("Missing cognitoUid in path parameters");
	}

	const params: GetCommandInput = {
		TableName: Resource.Users.name,
		Key: {
			PK: cognitoUid,
			SK: "DETAILS",
		},
	};

	try {
		const result = await client.send(new GetCommand(params));
		const item = result.Item;
		if (!item) {
			throw new Error("User not found");
		}
		const user = itemToUser(item);
		return JSON.stringify(user);
	} catch (e) {
		console.log(e);
		throw new Error(`Could not retrieve user ${cognitoUid}: ${e}`);
	}
});
