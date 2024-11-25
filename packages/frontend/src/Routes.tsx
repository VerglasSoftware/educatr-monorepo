import { Route, Routes } from "react-router-dom";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import Home from "./containers/Home.tsx";
import Login from "./containers/Login.tsx";
import PackList from "./containers/dash/PackList.tsx";
import PackDetail from "./containers/dash/PackDetail.tsx";
import ClassList from "./containers/organisation/ClassList.tsx";
import ClassDetail from "./containers/organisation/ClassDetail.tsx";
import CompetitionList from "./containers/organisation/CompetitionList.tsx";
import CompetitionDetail from "./containers/organisation/CompetitionDetail.tsx";

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

			<Route
				path="/dash/packs"
				element={
					<AuthenticatedRoute>
						<PackList />
					</AuthenticatedRoute>
				}
			/>
			<Route
				path="/dash/packs/:id"
				element={
					<AuthenticatedRoute>
						<PackDetail />
					</AuthenticatedRoute>
				}
			/>

			<Route
				path="/dash/:orgId/classes"
				element={
					<AuthenticatedRoute>
						<ClassList />
          </AuthenticatedRoute>
				}
			/>
            
			<Route
				path="/dash/:orgId/competitions"
				element={
					<AuthenticatedRoute>
						<CompetitionList />
					</AuthenticatedRoute>
				}
			/>
			<Route
				path="/dash/:orgId/classes/:classId"
				element={
					<AuthenticatedRoute>
						<ClassDetail />
</AuthenticatedRoute>
				}
			/>
      
      <Route
				path="/dash/:orgId/competitions/:compId"
				element={
					<AuthenticatedRoute>
						<CompetitionDetail />
					</AuthenticatedRoute>
				}
			/>

		</Routes>
	);
}
