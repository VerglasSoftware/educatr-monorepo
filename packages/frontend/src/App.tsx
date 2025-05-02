import { type ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadFull } from "tsparticles";
import "./App.css";
import { AppContext, AppContextType } from "./lib/contextLib";
import Routes from "./Routes.tsx";
import LoadingPage from "./_design/components/navigation/LoadingPage.tsx";

function App() {
	const [isAuthenticated, userHasAuthenticated] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(true);
	const [init, setInit] = useState(false);

	useEffect(() => {
		onLoad();
	}, []);

	useEffect(() => {
		initParticlesEngine(async (engine) => {
			await loadFull(engine);
		})
			.then(() => {
				setInit(true);
			})
			.catch((e) => {
				console.error(e);
			});
	}, []);

	const options: ISourceOptions = {
		particles: {
			number: {
				value: 100,
			},
			color: {
				value: "#ffffff",
			},
			links: {
				enable: true,
				distance: 200,
				opacity: 0.5,
			},
			shape: {
				type: "circle",
			},
			opacity: {
				value: 0.6,
			},
			size: {
				value: {
					min: 4,
					max: 6,
				},
			},
			move: {
				enable: true,
				speed: 1,
			},
		},
		background: {
			color: "#1c1851",
		},
		poisson: {
			enable: true,
		},
	};

	async function onLoad() {
		try {
			await Auth.currentSession();
			userHasAuthenticated(true);
		} catch (e) {
			if (e !== "No current user") {
				console.log(e);
			}
		}

		setIsAuthenticating(false);
	}

	return (
		<AppContext.Provider value={{ isAuthenticated, userHasAuthenticated, isAuthenticating } as AppContextType}>
				{
					isAuthenticating ? (
						<LoadingPage />
					) : (
						<Routes />
					)
				}
			<ToastContainer
				position="bottom-right"
				autoClose={2500}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss={false}
				draggable
				pauseOnHover
				theme="dark"
			/>
		</AppContext.Provider>
	);
}

export default App;
