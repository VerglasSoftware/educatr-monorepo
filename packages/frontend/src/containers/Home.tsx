import { API, Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "./Home.css";

export default function Home() {
	const [userRole, setUserRole] = useState<string>(null);
	useEffect(() => {
		const fetchUserRole = async () => {
			try {
				const user = await Auth.currentAuthenticatedUser();
				const useruser = await API.get("api", `/user/cognito/${user.username}`, {});
				setUserRole(useruser.role);
			} catch (error) {
				console.error("Error fetching authenticated user", error);
			}
		};

		fetchUserRole();
	}, []);
	useEffect(() => {
		console.log("userRole", userRole);
		if (userRole && userRole !== "USER") {
			window.location.href = "/play";
		}
	}, [userRole]);

	return (
		<div className="Home">
			<Helmet>
				<title>Home</title>
			</Helmet>
			<div className="lander">
				<h1>Educatr</h1>
				<p className="text-muted">Hello, world!</p>
			</div>
		</div>
	);
}
