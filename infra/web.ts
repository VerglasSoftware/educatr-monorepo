import { api } from "./api";
import { userPool, identityPool, userPoolClient } from "./auth";

const region = aws.getRegionOutput().name;

export const frontend = new sst.aws.StaticSite("Frontend", {
  path: "packages/frontend",
  build: {
    output: "dist",
    command: "npm run build",
  },
  domain:
    $app.stage === "production"
      ? {
          name: "educatr.uk",
          redirects: ["www.educatr.uk"],
        }
      : undefined,
  environment: {
    VITE_REGION: region,
    VITE_API_URL: api.url,
    VITE_USER_POOL_ID: userPool.id,
    VITE_IDENTITY_POOL_ID: identityPool.id,
    VITE_USER_POOL_CLIENT_ID: userPoolClient.id,
  },
});
