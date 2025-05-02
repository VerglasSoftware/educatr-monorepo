import { createContext, Dispatch, SetStateAction, useContext } from "react";

export interface AppContextType {
	isAuthenticated: boolean;
	userHasAuthenticated: Dispatch<SetStateAction<boolean>>;
	isAuthenticating: boolean;
}

export const AppContext = createContext<AppContextType>({
	isAuthenticated: false,
	userHasAuthenticated: useAppContext,
	isAuthenticating: true,
});

export function useAppContext() {
	return useContext(AppContext);
}
