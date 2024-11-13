export const api = new sst.aws.ApiGatewayV2("EducatrApi");

api.route("GET /", {
  handler: "packages/functions/src/api.handler",
});
