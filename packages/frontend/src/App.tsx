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

function App() {
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

	useEffect(() => {
		onLoad();
	}, []);

  const location = useLocation();
  const showSidebar = ["/dash", "/dash/packs"].includes(location.pathname);

  const theme = extendTheme({
    fontFamily: {
      display: 'Instrument Sans',
      body: 'Instrument Sans',
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
            <title>My Title</title>
        </Helmet>
        <AppContext.Provider
          value={{ isAuthenticated, userHasAuthenticated } as AppContextType}
        >
          <CssVarsProvider disableTransitionOnChange theme={theme}>
            <CssBaseline />
            <Box
            sx={[
              {
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: `${showSidebar && 'minmax(64px, 200px)'} minmax(450px, 1fr)`,
                  md: `${showSidebar && 'minmax(160px, 300px)'} minmax(500px, 1fr)`,
                },
                gridTemplateRows: '64px 1fr',
                minHeight: '100vh',
              }
            ]}
          >
              <NavbarMain />
              { showSidebar && <Sidebar /> }
              <main>
                <Routes />
              </main>
            </Box>
          </CssVarsProvider>
        </AppContext.Provider>
      </div>
    )
  );
}

export default App;
