import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "./Signup.css";
import SignupTeacher from "./SignupTeacher";

export default function Signup() {
	return (
		<div className="Signup">
			<h1>Temp User Signup Form</h1>
			<br />
			<Tabs
				defaultActiveKey="teacher"
				id="users-tab"
				className="mb-3">
				<Tab
					eventKey="teacher"
					title="Teacher">
					<SignupTeacher />
				</Tab>
			</Tabs>
		</div>
	);
}
