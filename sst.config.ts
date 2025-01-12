/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "educatr",
			removal: input?.stage === "prod" ? "retain" : "remove",
			home: "aws",
		};
	},
	async run() {
		await import("./infra/storage");
		await import("./infra/api");
		await import("./infra/socketApi");
		await import("./infra/web");
		const auth = await import("./infra/auth");

		await import("./infra/cluster");

		return {
			UserPool: auth.userPool.id,
			Region: aws.getRegionOutput().name,
			IdentityPool: auth.identityPool.id,
			UserPoolClient: auth.userPoolClient.id,
		};
	},
});
