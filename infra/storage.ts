export const organisationTable = new sst.aws.Dynamo("Organisations", {
	fields: {
		PK: "string",
		SK: "string",
	},
	primaryIndex: { hashKey: "PK", rangeKey: "SK" },
});

export const userTable = new sst.aws.Dynamo("Users", {
	fields: {
		PK: "string",
		SK: "string",
	},
	primaryIndex: { hashKey: "PK", rangeKey: "SK" },
});

export const competitionTable = new sst.aws.Dynamo("Competitions", {
	fields: {
		PK: "string",
		SK: "string",
	},
	primaryIndex: { hashKey: "PK", rangeKey: "SK" },
});

export const packTable = new sst.aws.Dynamo("Packs", {
	fields: {
		PK: "string",
		SK: "string",
	},
	primaryIndex: { hashKey: "PK", rangeKey: "SK" },
});

export const socketConnectionsTable = new sst.aws.Dynamo("SocketConnections", {
	fields: {
		id: "string",
	},
	primaryIndex: { hashKey: "id" },
});

export const entraClientId = new sst.Secret("ENTRA_CLIENT_ID");
export const entraClientSecret = new sst.Secret("ENTRA_CLIENT_SECRET");
