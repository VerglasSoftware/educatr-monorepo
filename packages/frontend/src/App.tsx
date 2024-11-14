import { AppContext, AppContextType } from "./lib/contextLib";
import "./App.css";
import Routes from "./Routes.tsx";
import { ReactNode, useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import NavbarMain from "./components/Navbar.tsx";
import { Box, CssBaseline, CssVarsProvider } from "@mui/joy";

function App({ sidebar }: { sidebar?: ReactNode }) {
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
        <AppContext.Provider
          value={{ isAuthenticated, userHasAuthenticated } as AppContextType}
        >
          <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <Box
            sx={[
              {
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: `${sidebar && 'minmax(64px, 200px)'} minmax(450px, 1fr)`,
                  md: `${sidebar && 'minmax(160px, 300px)'} minmax(500px, 1fr)`,
                },
                gridTemplateRows: '64px 1fr',
                minHeight: '100vh',
              }
            ]}
          >
              <NavbarMain />
              { sidebar }
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
