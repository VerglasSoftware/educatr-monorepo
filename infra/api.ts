import { organisationTable, packTable, userTable, competitionTable } from "./storage";

export const api = new sst.aws.ApiGatewayV2("Api", {
	domain: $app.stage === "prod" ? "api.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: true },
			},
			handler: {
				link: [packTable, organisationTable, competitionTable],
			},
		},
	},
});

api.route("GET /", {
	handler: "packages/functions/src/api.handler",
});

api.route("GET /pack", {
	handler: "packages/functions/src/pack.list",
});
api.route("POST /pack", {
	handler: "packages/functions/src/pack.create",
});
api.route("GET /pack/{id}", {
	handler: "packages/functions/src/pack.get",
});
api.route("PUT /pack/{id}", {
	handler: "packages/functions/src/pack.update",
});
api.route("DELETE /pack/{id}", {
	handler: "packages/functions/src/pack.del",
});

api.route("GET /organisation/{orgId}/role", {
	handler: "packages/functions/src/role.list",
});
api.route("POST /organisation/{orgId}/role", {
	handler: "packages/functions/src/role.create",
});
api.route("GET /organisation/{orgId}/role/{roleId}", {
	handler: "packages/functions/src/role.get",
});
api.route("PUT /organisation/{orgId}/role/{roleId}", {
	handler: "packages/functions/src/role.update",
});
api.route("DELETE /organisation/{orgId}/role/{roleId}", {
	handler: "packages/functions/src/role.del",
});

api.route("GET /organisation/{orgId}/class", {
	handler: "packages/functions/src/role.list",
});
api.route("POST /organisation/{orgId}/class", {
	handler: "packages/functions/src/role.create",
});
api.route("GET /organisation/{orgId}/class/{classId}", {
	handler: "packages/functions/src/role.get",
});
api.route("PUT /organisation/{orgId}/class/{classId}", {
	handler: "packages/functions/src/role.update",
});
api.route("DELETE /organisation/{orgId}/class/{classId}", {
	handler: "packages/functions/src/role.del",
});
  
api.route("GET /competition", {
	handler: "packages/functions/src/competition.list",
});
api.route("POST /competition", {
	handler: "packages/functions/src/competition.create",
});
api.route("GET /competition/{id}", {
	handler: "packages/functions/src/competition.get",
});
api.route("PUT /competition/{id}", {
	handler: "packages/functions/src/competition.update",
});
api.route("DELETE /competition/{id}", {
	handler: "packages/functions/src/competition.del",
});
