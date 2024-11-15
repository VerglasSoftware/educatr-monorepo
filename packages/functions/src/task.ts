import { Handler } from "aws-lambda";
import { DynamoDBClient, ReturnValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { createId } from "@paralleldrive/cuid2";
import { Util } from "@educatr/core/util";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list: Handler = Util.handler(async (event) => {
    const { packId: pk } = event.pathParameters || {};

    if (!pk) {
        throw new Error("Missing id in path parameters");
    }

    const params = {
        TableName: Resource.Packs.name,
        FilterExpression: "PK = :packId AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
            ":packId": { S: pk },
            ":skPrefix": { S: "PACK#" }
        },
    };

    try {
        const command = new ScanCommand(params);
        const result = await client.send(command);

        const packs = result.Items?.map((item) => {
            const sk = item.SK as unknown as string;
            const id = sk.split('#')[1];
            return { ...item, id };
        }) || [];

        return JSON.stringify(packs);
    } catch (e) {
        console.error(e);
        throw new Error("Could not retrieve packs");
    }
});
