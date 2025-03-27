export enum UserRole {
	STUDENT = "STUDENT",
	USER = "USER",
}

export interface UserDynamo {
	PK: { S: string };
	SK: { S: string };
	email: { S: string };
	role: { S: string };
	given_name: { S: string };
	family_name: { S: string };
	nickname: { S: string };
	picture: { S: string };
}

export interface User {
	id: string; // username
	email: string;
	role: UserRole;
	given_name: string;
	family_name: string;
	nickname: string;
	picture: string;
}

export interface UserUpdate {
	given_name: string;
	family_name: string;
	nickname: string;
	picture: string;
}
