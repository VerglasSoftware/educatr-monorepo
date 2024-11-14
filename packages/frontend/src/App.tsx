import { AppContext, AppContextType } from "./lib/contextLib";
import "./App.css";
import Routes from "./Routes.tsx";
import { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import NavbarMain from "./components/Navbar.tsx";

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
        <AppContext.Provider
          value={{ isAuthenticated, userHasAuthenticated } as AppContextType}
        >
          <NavbarMain />
          <main>
            <Routes />
          </main>
        </AppContext.Provider>
      </div>
    )
  );
}

export default App;
