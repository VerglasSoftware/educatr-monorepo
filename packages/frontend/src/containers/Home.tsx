import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "./Home.css";

export default function Home() {
	const [tasks, setTasks] = useState(null);
	useEffect(() => {
		async function onLoad() {
			try {
				const tasks = await API.get("api", `/pack/cl9mbkve440iskgq79k640xd/task`, {});
				console.log(tasks);
				setTasks(tasks);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);
	return (
		<div className="Home">
			<Helmet>
				<title>Home</title>
			</Helmet>
			<div className="lander">
				<h1>Educatr</h1>
				<p className="text-muted">Hello, world!</p>
				{tasks && <div>TASKS</div>}
			</div>
		</div>
	);
}
