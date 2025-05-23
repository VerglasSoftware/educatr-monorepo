import { Amplify, Auth } from "aws-amplify";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import config from "./config.ts";

Amplify.configure({
	Auth: {
		mandatorySignIn: true,
		region: config.cognito.REGION,
		userPoolId: config.cognito.USER_POOL_ID,
		identityPoolId: config.cognito.IDENTITY_POOL_ID,
		userPoolWebClientId: config.cognito.APP_CLIENT_ID,
		oauth: {
			domain: "educatr.auth.eu-west-1.amazoncognito.com",
			//scope: ["openid", "profile", "email"],
			redirectSignIn: "https://educatr.uk",
			redirectSignOut: "https://educatr.uk",
			responseType: "token",
		},
	},
	API: {
		endpoints: [
			{
				name: "api",
				endpoint: config.apiGateway.URL,
				region: config.apiGateway.REGION,
				custom_header: async () => {
					try {
						const session = await Auth.currentSession();
						const jwtToken = session.getIdToken().getJwtToken();
						return { Authorization: `Bearer ${jwtToken}` };
					} catch (error) {
						console.error("Error retrieving JWT token:", error);
						return {};
					}
				},
			},
		],
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Router>
			<App />
		</Router>
	</StrictMode>
);
