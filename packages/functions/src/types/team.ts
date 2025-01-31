export interface Team {
	id: string;
	name: string;
	students: string[];
	createdAt: string;
}

export interface TeamDynamo {
	SK: { S: string };
	name: { S: string };
	students: { L: { S: string }[] };
	createdAt: { N: string };
}

export interface TeamCreateUpdate {
	name: string;
	students: string[];
}
