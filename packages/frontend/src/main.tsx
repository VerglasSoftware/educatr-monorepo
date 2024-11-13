import { Amplify } from "aws-amplify";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css'
import App from './App.tsx'
import config from "./config.ts";
import { BrowserRouter as Router } from "react-router-dom";

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: "api",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    ],
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
