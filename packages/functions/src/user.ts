import { AttributeValue, DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, ScanCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { User, UserDynamo, UserRole, UserUpdate } from "./types/user";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const itemToUser = (item: Record<string, any> | undefined): User => {
	if (!item) {
		throw new Error("Item not found");
	}
	const userDynamo: UserDynamo = item as unknown as UserDynamo;
	return {
		id: userDynamo.PK.S.split("#")[1],
		email: userDynamo.email.S,
		role: UserRole[userDynamo.role.S as keyof typeof UserRole],
		given_name: userDynamo.given_name.S,
		family_name: userDynamo.family_name.S,
		nickname: userDynamo.nickname.S,
		picture: userDynamo.picture.S,
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

	const params: QueryCommandInput = {
		TableName: Resource.Users.name,
		KeyConditionExpression: "PK = :cognitoUid",
		ExpressionAttributeValues: {
			":cognitoUid": cognitoUid,
		},
	};

	try {
		const result = await client.send(new QueryCommand(params));
		const item = result.Items?.[0];

		if (!item) {
			throw new Error("Item not found");
		}
		const user: User = {
			id: item.PK,
			email: item.email,
			role: item.role,
			given_name: item.given_name,
			family_name: item.family_name,
			nickname: item.nickname,
			picture: item.picture,
		};
		return JSON.stringify(user);
	} catch (e) {
		console.log(e);
		throw new Error("Could not retrieve user");
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
		return JSON.stringify(result.Attributes);
	} catch (e) {
		throw new Error("Could not update user details");
	}
});

export const getCognito: Handler = Util.handler(async (event) => {
	const { cognitoUid } = event.pathParameters || {};

	const params: ScanCommandInput = {
		TableName: Resource.Users.name,
		FilterExpression: "cognitoUid = :cognitoUid",
		ExpressionAttributeValues: {
			":cognitoUid": { S: cognitoUid as string },
		},
	};

	try {
		const result = await client.send(new ScanCommand(params));
		const item = result.Items?.[0]; // unknown type as i cant execute this without cors error
		if (!item) {
			throw new Error("User not found");
		}
		return JSON.stringify(item);
	} catch (e) {
		console.log(e);
		throw new Error("Could not retrieve user");
	}
});
