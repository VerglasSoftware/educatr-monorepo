export interface RoleDynamo {
	SK: { S: string };
	name: { S: string };
	permissions: { L: { S: string }[] };
	createdAt: { N: string };
}

export interface Role {
	id: string;
	name: string;
	permissions: string[];
	createdAt: string;
}

export interface RoleCreateUpdate {
	name: string;
	permissions: string[];
}
