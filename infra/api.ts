import { packTable, userTable } from "./storage";

export const api = new sst.aws.ApiGatewayV2("Api", {
	domain: $app.stage === "prod" ? "api.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: true },
			},
			handler: {
				link: [packTable],
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
api.route("GET /pack/{packId}", {
	handler: "packages/functions/src/pack.get",
});
api.route("PUT /pack/{packId}", {
	handler: "packages/functions/src/pack.update",
});
api.route("DELETE /pack/{packId}", {
	handler: "packages/functions/src/pack.del",
});

api.route("GET /pack/{packId}/task", {
	handler: "packages/functions/src/task.list",
});