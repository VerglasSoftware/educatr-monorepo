import { Resource } from "sst";
import { socketConnectionsTable } from "./storage";

const permissions = new sst.Linkable("MyStorage", {
	properties: {
	},
	include: [
	  sst.aws.permission({
		actions: ["execute-api:*"],
		resources: ["*"]
	  })
	]
  });

export const api = new sst.aws.ApiGatewayWebSocket("SocketApi", {
    domain: $app.stage === "prod" ? "ws.educatr.uk" : undefined,
    transform: {
		route: {
			args: {
				auth: { iam: $app.stage === "prod" ? true : false },
			},
			handler: {
				link: [socketConnectionsTable, permissions],
			},
		},
	},
});

api.route("$connect", {
	handler: "packages/functions/src/socket/connect.main",
	link: [api]
});

api.route("$disconnect", {
	handler: "packages/functions/src/socket/disconnect.main",
	link: [api]
});

api.route("sendmessage", {
	handler: "packages/functions/src/socket/sendMessage.main",
	link: [api]
});
