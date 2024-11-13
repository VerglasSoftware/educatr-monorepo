import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import "./App.css";
import { AppContext, AppContextType } from "./lib/contextLib";
import Routes from "./Routes.tsx";

function App() {
	const [isAuthenticated, userHasAuthenticated] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(true);

	useEffect(() => {
		onLoad();
	}, []);

	async function onLoad() {
		try {
			await Auth.currentSession();
			userHasAuthenticated(true);
		} catch (e) {
			if (e !== "No current user") {
				alert(e);
			}
		}

		setIsAuthenticating(false);
	}

	return (
		!isAuthenticating && (
			<div className="App">
				{/* navbar here */}
				<AppContext.Provider value={{ isAuthenticated, userHasAuthenticated } as AppContextType}>
					<Routes />
				</AppContext.Provider>
			</div>
		)
	);
}

export default App;
