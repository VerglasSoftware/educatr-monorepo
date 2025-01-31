export interface Activity {
	id: string;
	userId: string;
	taskId: string;
	verifierId: string;
	status: string;
	correct: string;
	createdAt: string;
}

export interface ActivityDynamo {
	PK: { S: string };
	SK: { S: string };
	userId: { S: string };
	taskId: { S: string };
	verifierId: { S: string };
	status: { S: string };
	correct: { S: string };
	createdAt: { N: string };
}

export interface ActivityCreateUpdate {
	userId: string;
	taskId: string;
	verifierId: string;
	status: string;
	correct: string;
}
