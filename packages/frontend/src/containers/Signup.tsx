import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "./Signup.css";
import SignupStudent from "./SignupStudent";
import SignupTeacher from "./SignupTeacher";

export default function Signup() {
	return (
		<div className="Signup">
			<h1>Temp User Signup Form</h1>
			<br />
			<Tabs
				defaultActiveKey="student"
				id="users-tab"
				className="mb-3">
				<Tab
					eventKey="student"
					title="Student">
					<SignupStudent />
				</Tab>
				<Tab
					eventKey="teacher"
					title="Teacher">
					<SignupTeacher />
				</Tab>
			</Tabs>
		</div>
	);
}
