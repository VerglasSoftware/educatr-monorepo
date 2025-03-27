export interface Class {
	id: string;
	name: string;
	students: string[];
	createdAt: string;
}

export interface ClassDynamo {
	SK: { S: string };
	name: { S: string };
	students: { L: { S: string }[] };
	createdAt: { N: string };
}

export interface ClassCreateUpdate {
	name: string;
	students: string[];
}
