import { createContext, Dispatch, SetStateAction, useContext } from "react";

export interface AppContextType {
	isAuthenticated: boolean;
	userHasAuthenticated: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
	isAuthenticated: false,
	userHasAuthenticated: useAppContext,
});

export function useAppContext() {
	return useContext(AppContext);
}
