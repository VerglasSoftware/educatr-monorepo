import { Route, Routes } from "react-router-dom";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import Home from "./containers/Home.tsx";
import Login from "./containers/Login.tsx";
import Signup from "./containers/Signup.tsx";
import PackDetail from "./containers/dash/PackDetail.tsx";
import PackList from "./containers/dash/PackList.tsx";
// import TaskEditor from "./containers/dash/TaskEditor.tsx";
import TaskEditor from "./containers/dash/TaskEditor.tsx";
import LaunchCompetition from "./containers/launch/Competition.tsx";
import ClassDetail from "./containers/organisation/ClassDetail.tsx";
import ClassList from "./containers/organisation/ClassList.tsx";
import CompetitionDetail from "./containers/organisation/CompetitionDetail.tsx";
import CompetitionList from "./containers/organisation/CompetitionList.tsx";
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
				element={
					<AuthenticatedRoute>
						<Signup />
					</AuthenticatedRoute>
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
				path="/dash/packs/:id/edit"
				element={
					<AuthenticatedRoute>
						<TaskEditor />
					</AuthenticatedRoute>
				}
			/>
			<Route
				path="/dash/:id"
				element={
					<AuthenticatedRoute>
						<OrganisationDetail />
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
					<AuthenticatedRoute>
						<LaunchCompetition />
					</AuthenticatedRoute>
				}
			/>
		</Routes>
	);
}
