import { userPool, userPoolClient } from "./auth";
import { executeApi } from "./cluster";
import { email } from "./email";
import { socketApi } from "./socketApi";
import { competitionTable, organisationTable, packTable, socketConnectionsTable, stripeSecret, stripeWebhookSecret, userTable } from "./storage";
import { frontend } from "./web";

export const api = new sst.aws.ApiGatewayV2("Api", {
	domain: $app.stage === "prod" ? "api.educatr.uk" : undefined,
	transform: {
		route: {
			handler: {
				link: [packTable, organisationTable, competitionTable, socketApi, socketConnectionsTable, userTable, stripeSecret, stripeWebhookSecret, email],
			},
		},
	},
});

const authorizer = api.addAuthorizer({
	name: "myCognitoAuthorizer",
	jwt: {
		issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
		audiences: [userPoolClient.id],
	},
});

api.route("GET /", {
	handler: "packages/functions/src/api.handler",
});

api.route(
	"GET /pack",
	{
		handler: "packages/functions/src/pack.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /pack",
	{
		handler: "packages/functions/src/pack.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /pack/{packId}",
	{
		handler: "packages/functions/src/pack.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /pack/{packId}",
	{
		handler: "packages/functions/src/pack.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /pack/{packId}",
	{
		handler: "packages/functions/src/pack.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /organisation",
	{
		handler: "packages/functions/src/organisation.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /organisation",
	{
		handler: "packages/functions/src/organisation.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /organisation/{orgId}",
	{
		handler: "packages/functions/src/organisation.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /organisation/{orgId}",
	{
		handler: "packages/functions/src/organisation.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /organisation/{orgId}",
	{
		handler: "packages/functions/src/organisation.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /organisation/{orgId}/students",
	{
		handler: "packages/functions/src/organisation.listStudents",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /pack/{packId}/task",
	{
		handler: "packages/functions/src/task.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /pack/{packId}/task",
	{
		handler: "packages/functions/src/task.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /pack/{packId}/task/{taskId}",
	{
		handler: "packages/functions/src/task.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /pack/{packId}/task/{taskId}",
	{
		handler: "packages/functions/src/task.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /pack/{packId}/task/{taskId}",
	{
		handler: "packages/functions/src/task.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /organisation/{orgId}/role",
	{
		handler: "packages/functions/src/role.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /organisation/{orgId}/role",
	{
		handler: "packages/functions/src/role.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /organisation/{orgId}/role/{roleId}",
	{
		handler: "packages/functions/src/role.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /organisation/{orgId}/role/{roleId}",
	{
		handler: "packages/functions/src/role.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /organisation/{orgId}/role/{roleId}",
	{
		handler: "packages/functions/src/role.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /organisation/{orgId}/class",
	{
		handler: "packages/functions/src/class.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /organisation/{orgId}/class",
	{
		handler: "packages/functions/src/class.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /organisation/{orgId}/class/{classId}",
	{
		handler: "packages/functions/src/class.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /organisation/{orgId}/class/{classId}",
	{
		handler: "packages/functions/src/class.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /organisation/{orgId}/class/{classId}",
	{
		handler: "packages/functions/src/class.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition",
	{
		handler: "packages/functions/src/competition.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /competition",
	{
		handler: "packages/functions/src/competition.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /competition/{compId}",
	{
		handler: "packages/functions/src/competition.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /competition/{compId}",
	{
		handler: "packages/functions/src/competition.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /competition/{compId}",
	{
		handler: "packages/functions/src/competition.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /competition/{compId}/check",
	{
		handler: "packages/functions/src/competition.check",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /competition/{compId}/run",
	{
		handler: "packages/functions/src/competition.run",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition/{compId}/activity",
	{
		handler: "packages/functions/src/activity.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /competition/{compId}/activity",
	{
		handler: "packages/functions/src/activity.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /competition/{compId}/activity/{activityId}",
	{
		handler: "packages/functions/src/activity.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /competition/{compId}/activity/{activityId}",
	{
		handler: "packages/functions/src/activity.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /competition/{compId}/activity/{activityId}",
	{
		handler: "packages/functions/src/activity.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"DELETE /competition/{compId}/activity",
	{
		handler: "packages/functions/src/activity.clear",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"POST /competition/{compId}/activity/{activityId}/approve",
	{
		handler: "packages/functions/src/activity.approve",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /competition/{compId}/activity/{activityId}/reject",
	{
		handler: "packages/functions/src/activity.reject",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition/{compId}/team",
	{
		handler: "packages/functions/src/team.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"POST /competition/{compId}/team",
	{
		handler: "packages/functions/src/team.create",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"GET /competition/{compId}/team/{teamId}",
	{
		handler: "packages/functions/src/team.get",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /competition/{compId}/team/{teamId}",
	{
		handler: "packages/functions/src/team.update",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"DELETE /competition/{compId}/team/{teamId}",
	{
		handler: "packages/functions/src/team.del",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition/{compId}/leaderboard",
	{
		handler: "packages/functions/src/competition.getLb",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition/{compId}/topusers",
	{
		handler: "packages/functions/src/competition.topUsers",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition/{compId}/whowon",
	{
		handler: "packages/functions/src/competition.whoWon",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /competition/{compId}/packs",
	{
		handler: "packages/functions/src/competition.getPacks",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"POST /competition/{compId}/announce",
	{
		handler: "packages/functions/src/competition.announce",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /user",
	{
		handler: "packages/functions/src/user.list",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /user/me",
	{
		handler: "packages/functions/src/user.getMe",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
api.route(
	"PUT /user/me",
	{
		handler: "packages/functions/src/user.updateMe",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /user/cognito/{cognitoId}",
	{
		handler: "packages/functions/src/user.getCognito",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"GET /task/importTasks",
	{
		handler: "packages/functions/src/task.importTasks",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);

api.route(
	"POST /billing/webhook",
	{
		handler: "packages/functions/src/billing/webhook/post.handler",
	},
);
api.route(
	"POST /billing/organisation/request",
	{
		handler: "packages/functions/src/billing/organisation/request/post.handler",
	},
	{ auth: { jwt: { authorizer: authorizer.id } } }
);
