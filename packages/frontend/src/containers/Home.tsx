import { API, Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import "./Home.css";
import Page from "../_design/components/layout/Page";
import { useAppContext } from "../lib/contextLib";
import Text from "../_design/components/core/Text";
import Container from "../_design/components/layout/Container";

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
		<Page title="Home" useAuthContext={useAppContext}>
			<Container>
				<Text variant="title" noMarginBottom>Educatr</Text>
				<Text variant="intro">Welcome to the competition platform</Text>
			</Container>
		</Page>
	);
}
