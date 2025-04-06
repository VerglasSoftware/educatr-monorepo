export interface Activity {
	id: string;
	userId: string;
	taskId: string;
	packId: string;
	verifierId: string;
	status: string;
	answer: string;
	correct: boolean;
	createdAt: string;
}

export interface ActivityDynamo {
	PK: { S: string };
	SK: { S: string };
	userId: { S: string };
	taskId: { S: string };
	packId: { S: string };
	verifierId: { S: string };
	status: { S: string };
	answer: { S: string };
	correct: { BOOL: boolean };
	createdAt: { N: string };
}

export interface ActivityCreateUpdate {
	userId: string;
	taskId: string;
	packId: string;
	verifierId: string;
	status: string;
	answer: string;
	correct: boolean;
}
