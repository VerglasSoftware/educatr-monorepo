import { socketConnectionsTable } from "./storage";

const permissions = new sst.Linkable("MyStorage", {
	properties: {},
	include: [
		sst.aws.permission({
			actions: ["execute-api:*"],
			resources: ["*"],
		}),
	],
});

export const socketApi = new sst.aws.ApiGatewayWebSocket("SocketApi", {
	domain: $app.stage === "prod" ? "ws.educatr.uk" : undefined,
	transform: {
		route: {
			args: {
				auth: { iam: $app.stage === "prod" ? false : false },
			},
			handler: {
				link: [socketConnectionsTable, permissions],
			},
		},
	},
});

socketApi.route("$connect", {
	handler: "packages/functions/src/socket/connect.main",
	link: [socketApi],
});

socketApi.route("$disconnect", {
	handler: "packages/functions/src/socket/disconnect.main",
	link: [socketApi],
});

socketApi.route("sendmessage", {
	handler: "packages/functions/src/socket/sendMessage.main",
	link: [socketApi],
});
