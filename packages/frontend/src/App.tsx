import { AppContext, AppContextType } from "./lib/contextLib";
import "./App.css";
import Routes from "./Routes.tsx";
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import NavbarMain from "./components/Navbar.tsx";
import { Box, CssBaseline, CssVarsProvider, extendTheme } from "@mui/joy";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.tsx";
import { type ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

	const location = useLocation();
	const showSidebar = location.pathname.startsWith("/dash");
	const inPlayMode = location.pathname.startsWith("/play") || location.pathname.startsWith("/launch");

	const theme = extendTheme({
		fontFamily: {
			display: "Instrument Sans",
			body: "Instrument Sans",
		},
	});

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
				<Helmet titleTemplate="%s - Educatr">
					<title></title>
				</Helmet>
				<AppContext.Provider value={{ isAuthenticated, userHasAuthenticated } as AppContextType}>
					<CssVarsProvider
						disableTransitionOnChange
						theme={theme}>
						<CssBaseline />
						{inPlayMode ? (
							<Box
								sx={{
									minHeight: "100vh",
								}}>
								{init && (
									<Particles
										id="particles"
										options={options}
									/>
								)}
								<main>
									<Routes />
								</main>
							</Box>
						) : (
							<Box
								sx={[
									{
										display: "grid",
										gridTemplateColumns: {
											xs: "1fr",
											sm: `${showSidebar && "minmax(64px, 200px)"} minmax(450px, 1fr)`,
											md: `${showSidebar && "minmax(160px, 300px)"} minmax(500px, 1fr)`,
										},
										gridTemplateRows: "64px 1fr",
										minHeight: "100vh",
									},
								]}>
								<NavbarMain />
								{showSidebar && <Sidebar />}
								<main>
									<Routes />
								</main>
							</Box>
						)}
					</CssVarsProvider>
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
			</div>
		)
	);
}

export default App;
