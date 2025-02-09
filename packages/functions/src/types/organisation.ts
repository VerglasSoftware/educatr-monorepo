export interface Organisation {
	id: string;
	name: string;
	logo: string;
	students: string[];
	createdAt: string;
}

export interface OrganisationDynamo {
	PK: { S: string };
	SK: { S: string };
	name: { S: string };
	logo: { S: string };
	students: { L: { S: string }[] };
	createdAt: { N: string };
}

export interface OrganisationCreateUpdate {
	name: string;
	logo: string;
	students: string[];
}
