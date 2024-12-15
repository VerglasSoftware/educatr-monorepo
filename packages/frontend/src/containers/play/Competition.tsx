import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { cardio } from "ldrs";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Loading from "../../components/play/Loading";
import NavbarMain from "../../components/play/Navbar";
import NotInProgress from "../../components/play/NotInProgress";
import TaskModal from "../../components/play/TaskModal";
import "./Play.css";

export default function PlayCompetition() {
	const [competition, setCompetition] = useState<any>();
	const [packs, setPacks] = useState<any[]>();
	const [webhookStatus, setWebhookStatus] = useState<any>("Default");

	const [selectedTask, setSelectedTask] = useState<any>();
	const [selectedTaskPackId, setSelectedTaskPackId] = useState<string>("");
	const [open, setOpen] = useState<any>();

	const [activity, setActivity] = useState<any[]>();

	const { compId } = useParams();

	const { sendMessage, lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI);

	useEffect(() => {
		if (lastMessage !== null) {
			const data = JSON.parse(lastMessage.data);
			console.log(data);

			if (data.filter.competitionId && data.filter.competitionId != compId) return;

			switch (data.type) {
				case "COMPETITION:STATUS_UPDATE":
					setCompetition({ ...competition, status: data.body.status });
					break;
				case "TASK:ANSWERED":
					const newActivity = data.body;
					setActivity([...(activity || []), newActivity]);
					break;
				default:
					break;
			}
		}
	}, [lastMessage]);

	useEffect(() => {
		const connectionStatus = {
			[ReadyState.CONNECTING]: "Connecting",
			[ReadyState.OPEN]: "Open",
			[ReadyState.CLOSING]: "Closing",
			[ReadyState.CLOSED]: "Closed",
			[ReadyState.UNINSTANTIATED]: "Uninstantiated",
		}[readyState];
		console.log(connectionStatus);
		setWebhookStatus(connectionStatus);
	}, [readyState]);

	cardio.register();

	useEffect(() => {
		async function onLoad() {
			try {
				const promises = [API.get("api", `/competition/${compId}`, {}).then(setCompetition), API.get("api", `/pack?include=tasks`, {}).then(setPacks), API.get("api", `/competition/${compId}/activity`, {}).then(setActivity)];

				await Promise.allSettled(promises);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	if (!competition || !packs || webhookStatus != "Open" || !activity) {
		return (
			<Loading
				competition={!!competition}
				packs={!!packs}
				activity={!!activity}
				webhookStatus={!!webhookStatus}
			/>
		);
	}

	if (competition.status != "IN_PROGRESS") {
		return <NotInProgress competition={competition} />;
	}

	return (
		<div className="Home">
			<Helmet>
				<title>{competition.name}</title>
			</Helmet>
			<NavbarMain />
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					flexDirection: "column",
					padding: "2%",
				}}>
				<Stack
					spacing={2}
					sx={{ width: "100%" }}>
					{packs.map((pack: any) => (
						<>
							<Typography
								level="h2"
								component="h1"
								textColor="common.white">
								{pack.name.S}
							</Typography>
							<Box sx={{ display: "grid", flexGrow: 1, gridTemplateColumns: "repeat(5, 1fr)", justifyContent: "center", gap: 2 }}>
								{pack.tasks.map((task: any) => {
									const correct = activity.find((a) => (a.taskId.S ? a.taskId.S == task.SK.S.split("#")[1] && a.correct.BOOL === true : a.taskId == task.SK.S.split("#")[1] && a.correct === true));
									return (
										<Link
											component="button"
											onClick={() => {
												setSelectedTask(task);
												setSelectedTaskPackId(pack.PK.S);
												setOpen(true);
											}}
											disabled={correct}>
											<Card
												variant="plain"
												sx={{ backgroundColor: correct ? "rgb(0 255 0 / 0.4)" : "rgb(0 0 0 / 0.3)", width: "100%" }}>
												<CardContent
													sx={{
														display: "flex",
														flexDirection: "column",
														alignItems: "center",
														justifyContent: "center",
														padding: "2%",
													}}>
													<Typography
														level="title-lg"
														textColor="common.white">
														{task.title.S}
													</Typography>
													<Typography
														level="body-sm"
														textColor="common.white">
														{task.points.N} point{task.points.N != 1 && "s"}
													</Typography>
												</CardContent>
											</Card>
										</Link>
									);
								})}
							</Box>
						</>
					))}
				</Stack>
			</Box>

			<TaskModal
				open={open}
				setOpen={setOpen}
				competition={competition}
				task={selectedTask}
				packId={selectedTaskPackId}
			/>
		</div>
	);
}
