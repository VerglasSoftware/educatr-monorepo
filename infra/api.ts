import { organisationTable, packTable, userTable } from "./storage";

export const api = new sst.aws.ApiGatewayV2("Api", {
	domain: $app.stage === "prod" ? "api.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: true },
			},
			handler: {
				link: [packTable, organisationTable],
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
api.route("GET /organisation/{orgId}/role/{id}", {
	handler: "packages/functions/src/role.get",
});
api.route("PUT /organisation/{orgId}/role/{id}", {
	handler: "packages/functions/src/role.update",
});
api.route("DELETE /organisation/{orgId}/role/{id}", {
	handler: "packages/functions/src/role.del",
});