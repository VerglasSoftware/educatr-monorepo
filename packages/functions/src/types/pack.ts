export interface PackDynamo {
	PK: { S: string };
	SK: { S: string };
	name: { S: string };
	description: { S: string };
	ownerId: { S: string };
	createdAt: { N: string };
}

export interface Pack {
	id: string;
	name: string;
	description: string;
	ownerId: string; // AWS Cognito username
	createdAt: string;
}

export interface PackCreateUpdate {
	name: string;
	description: string;
}
