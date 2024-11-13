import { Route, Routes } from "react-router-dom";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import Home from "./containers/Home.tsx";
import Login from "./containers/Login.tsx";

export default function Links() {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<AuthenticatedRoute>
						<Home />
					</AuthenticatedRoute>
				}
			/>
			<Route
				path="/login"
				element={
					<UnauthenticatedRoute>
						<Login />
					</UnauthenticatedRoute>
				}
			/>
		</Routes>
	);
}
