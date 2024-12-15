import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Util } from "@educatr/core/util";
import { createId } from "@paralleldrive/cuid2";
import { Handler } from "aws-lambda";
import { Resource } from "sst";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getMe: Handler = Util.handler(async (event) => {
	const cognitoUid = event.requestContext.authorizer!.iam.cognitoIdentity.identityId;
    console.log(cognitoUid);

    const params = {
        TableName: Resource.Users.name,
        FilterExpression: "cognitoUid = :cognitoUid",
        ExpressionAttributeValues: {
          ":cognitoUid": { S: cognitoUid },
        },
      };

	try {
		const result = await client.send(new ScanCommand(params));
        console.log("result" +  result);
        console.log(result.Items);
		if (!result.Items![0]) {
			throw new Error("User not found");
		}
		return JSON.stringify(result.Items![0]);
	} catch (e) {
        console.log(e);
		throw new Error("Could not retrieve user");
	}
});

export const updateMe: Handler = Util.handler(async (event) => {
	const cognitoUid = event.requestContext.authorizer!.iam.cognitoIdentity.identityId;

	let data = {
		given_name: "",
        family_name: "",
        nickname: "",
        picture: "",
	};

	if (event.body != null) {
		data = JSON.parse(event.body);
	} else {
		throw new Error("No body provided");
	}

	const params = {
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
