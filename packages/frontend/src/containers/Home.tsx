import { Helmet } from "react-helmet";
import "./Home.css";

export default function Home() {
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
