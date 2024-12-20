import { executeApi } from "./cluster";
import { socketApi } from "./socketApi";
import { competitionTable, organisationTable, packTable, socketConnectionsTable, userTable } from "./storage";

export const api = new sst.aws.ApiGatewayV2("Api", {
	domain: $app.stage === "prod" ? "api.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: true },
			},
			handler: {
				link: [packTable, organisationTable, competitionTable, socketApi, socketConnectionsTable, userTable, executeApi],
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

api.route("GET /organisation", {
	handler: "packages/functions/src/organisation.list",
});
api.route("POST /organisation", {
	handler: "packages/functions/src/organisation.create",
});
api.route("GET /organisation/{id}", {
	handler: "packages/functions/src/organisation.get",
});
api.route("PUT /organisation/{id}", {
	handler: "packages/functions/src/organisation.update",
});
api.route("DELETE /organisation/{id}", {
	handler: "packages/functions/src/organisation.del",
});

api.route("GET /organisation/{id}/students", {
	handler: "packages/functions/src/organisation.listStudents",
});

api.route("GET /pack/{packId}/task", {
	handler: "packages/functions/src/task.list",
});
api.route("POST /pack/{packId}/task", {
	handler: "packages/functions/src/task.create",
});
api.route("GET /pack/{packId}/task/{taskId}", {
	handler: "packages/functions/src/task.get",
});
api.route("PUT /pack/{packId}/task/{taskId}", {
	handler: "packages/functions/src/task.update",
});
api.route("DELETE /pack/{packId}/task/{taskId}", {
	handler: "packages/functions/src/task.del",
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
	handler: "packages/functions/src/class.list",
});
api.route("POST /organisation/{orgId}/class", {
	handler: "packages/functions/src/class.create",
});
api.route("GET /organisation/{orgId}/class/{classId}", {
	handler: "packages/functions/src/class.get",
});
api.route("PUT /organisation/{orgId}/class/{classId}", {
	handler: "packages/functions/src/class.update",
});
api.route("DELETE /organisation/{orgId}/class/{classId}", {
	handler: "packages/functions/src/class.del",
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
api.route("POST /competition/{id}/check", {
	handler: "packages/functions/src/competition.check",
});
api.route("POST /competition/{id}/run", {
	handler: "packages/functions/src/competition.run",
});

api.route("GET /competition/{compId}/activity", {
	handler: "packages/functions/src/activity.list",
});
api.route("POST /competition/{compId}/activity", {
	handler: "packages/functions/src/activity.create",
});
api.route("GET /competition/{compId}/activity/{activityId}", {
	handler: "packages/functions/src/activity.get",
});
api.route("PUT /competition/{compId}/activity/{activityId}", {
	handler: "packages/functions/src/activity.update",
});
api.route("DELETE /competition/{compId}/activity/{activityId}", {
	handler: "packages/functions/src/activity.del",
});

api.route("GET /competition/{orgId}/team", {
	handler: "packages/functions/src/team.list",
});
api.route("POST /competition/{orgId}/team", {
	handler: "packages/functions/src/team.create",
});
api.route("GET /competition/{orgId}/team/{teamId}", {
	handler: "packages/functions/src/team.get",
});
api.route("PUT /competition/{orgId}/team/{teamId}", {
	handler: "packages/functions/src/team.update",
});
api.route("DELETE /competition/{orgId}/team/{teamId}", {
	handler: "packages/functions/src/team.del",
});

api.route("GET /user/me", {
	handler: "packages/functions/src/user.getMe",
});
api.route("PUT /user/me", {
	handler: "packages/functions/src/user.updateMe",
});

api.route("GET /user/cognito/:cognitoUid", {
	handler: "packages/functions/src/user.getCognito",
});
