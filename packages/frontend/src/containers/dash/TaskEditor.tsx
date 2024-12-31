import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/dash/breadcrumb";
import "./TaskEditor.css";

export default function TaskEditor() {
	const [pack, setPack] = useState<any>();
	const [tasks, setTasks] = useState<any[]>([]);

	const { id } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const pack = await API.get("api", `/pack/${id}`, {});
				const tasks = await API.get("api", `/pack/${id}/task`, {});
				setPack(pack);
				setTasks(tasks);
			} catch (e) {
				console.log(e);
			}
		}
		onLoad();
	}, [id]);

	return (
		pack &&
		tasks && (
			<div className="Home">
				<Helmet>
					<title>{pack.name} - Task Editor</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Packs", href: "/dash/packs" },
								{ label: pack.name, href: `/dash/packs/${id}` },
								{ label: "Editor", href: `/dash/packs/${id}/edit` },
							]}
						/>
					</Box>
					<Box
						sx={{
							display: "flex",
							mb: 1,
							gap: 1,
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "start", sm: "center" },
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}>
						<Typography
							level="h2"
							component="h1">
							{pack.name}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<Button
							variant="plain"
							onClick={() => console.log("back")}>
							<ArrowBackIcon />
						</Button>
						<Typography
							level="h3"
							component="h2"
							sx={{ my: 0 }}>
							{tasks[0].title.S}
						</Typography>
						<Button
							variant="plain"
							onClick={() => console.log("forward")}>
							<ArrowForwardIcon />
						</Button>
					</Box>
					<Box></Box>
				</div>
			</div>
		)
	);
}
