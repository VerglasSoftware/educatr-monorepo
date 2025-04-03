import { Route, Routes } from "react-router-dom";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import Home from "./containers/Home.tsx";
import Login from "./containers/Login.tsx";
import Signup from "./containers/Signup.tsx";
import CompetitionDetail from "./containers/dash/competition/CompetitionDetail.tsx";
import CompetitionList from "./containers/dash/competition/CompetitionList.tsx";
import PackDetail from "./containers/dash/packs/PackDetail.tsx";
import PackList from "./containers/dash/packs/PackList.tsx";
import TaskEditor from "./containers/dash/packs/TaskEditor.tsx";
import LaunchCompetition from "./containers/launch/Competition.tsx";
import ClassDetail from "./containers/organisation/ClassDetail.tsx";
import ClassList from "./containers/organisation/ClassList.tsx";
import OrganisationDetail from "./containers/organisation/OrganisationDetail.tsx";
import PlayCompetition from "./containers/play/Competition.tsx";
import PlayHome from "./containers/play/Home.tsx";

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
				path="/signup"
				element={<Signup />}
			/>

			<Route
				path="/dash/packs"
				element={
					<ProtectedRoute requiredRole="USER">
						<PackList />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dash/packs/:id"
				element={
					<ProtectedRoute requiredRole="USER">
						<PackDetail />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dash/packs/:id/edit"
				element={
					<ProtectedRoute requiredRole="USER">
						<TaskEditor />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dash/:id"
				element={
					<ProtectedRoute requiredRole="USER">
						<OrganisationDetail />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/dash/:orgId/classes"
				element={
					<ProtectedRoute requiredRole="USER">
						<ClassList />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/dash/competitions"
				element={
					<ProtectedRoute requiredRole="USER">
						<CompetitionList />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dash/:orgId/classes/:classId"
				element={
					<ProtectedRoute requiredRole="USER">
						<ClassDetail />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/dash/competitions/:compId"
				element={
					<ProtectedRoute requiredRole="USER">
						<CompetitionDetail />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/play"
				element={
					<AuthenticatedRoute>
						<PlayHome />
					</AuthenticatedRoute>
				}
			/>
			<Route
				path="/play/:compId"
				element={
					<AuthenticatedRoute>
						<PlayCompetition />
					</AuthenticatedRoute>
				}
			/>

			<Route
				path="/launch/:compId"
				element={
					<ProtectedRoute requiredRole="USER">
						<LaunchCompetition />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}
