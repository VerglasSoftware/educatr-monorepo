import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { cardio, pulsar } from "ldrs";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Loading from "../../components/play/Loading";
import NavbarMain from "../../components/play/Navbar";
import NotInProgress from "../../components/play/NotInProgress";
import { PDF417 } from "../../components/play/PDF417";
import TaskModal from "../../components/play/TaskModal";
import "./Play.css";

export default function PlayCompetition() {
	const [competition, setCompetition] = useState<any>();
	const [packs, setPacks] = useState<any[]>();
	const [webhookStatus, setWebhookStatus] = useState<any>("Default");

	const [selectedTask, setSelectedTask] = useState<any>();
	const [selectedTaskPackId, setSelectedTaskPackId] = useState<string>("");
	const [open, setOpen] = useState<any>();

	const [waitingTask, setWaitingTask] = useState<any>();

	const [activity, setActivity] = useState<any[]>();

	const { compId } = useParams();

	const { sendMessage, lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI, {
		shouldReconnect: () => true,
		onReconnectStop: () => {
			window.location.reload();
		},
	});

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
					setActivity([...(activity?.filter((a) => a.taskId.S != newActivity.taskId) || []), newActivity]);
					console.log(waitingTask);
					if (waitingTask) if (newActivity.taskId == waitingTask.SK.S.split("#")[1]) setWaitingTask(null);
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
	pulsar.register();

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

	useEffect(() => {
		if (activity != null)
			if (packs != null)
				for (const t in activity) {
					const task = activity[t];
					if (task.status)
						if (task.status.S == "WAITING") {
							const pack: any = packs.find((p) => p.PK.S == task.packId.S);
							const task2: any = pack.tasks.find((t: any) => t.SK.S.split("#")[1] == task.taskId.S);
							setWaitingTask({
								pack: { tasks: undefined, ...pack },
								activity: activity[t],
								...task2,
							});
						}
				}
	}, [activity, packs]);

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

	if (waitingTask) {
		return (
			waitingTask && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "85vh",
						flexDirection: "column",
						overflow: "hidden",
					}}>
					<Card
						variant="plain"
						sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "60%" }}>
						<CardContent
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								padding: "2%",
							}}>
							<l-pulsar
								size="50"
								speed="2"
								color="white"></l-pulsar>

							<Typography
								level="h1"
								textColor="common.white"
								sx={{ mt: 2 }}>
								{waitingTask.pack.name.S.toUpperCase()} | {waitingTask.title.S.toUpperCase()}
							</Typography>
							<Typography
								level="body-sm"
								textColor="common.white">
								The last task you submitted needs to be manually reviewed.
							</Typography>
							<Typography
								level="body-sm"
								textColor="common.white">
								A member of our team will be with you as soon as possible.
							</Typography>
							<br />
							<PDF417 value={waitingTask.activity && waitingTask.activity.SK.S.split("#")[1]} />
						</CardContent>
					</Card>
				</Box>
			)
		);
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
									const correct = activity.find((a) => (a.taskId.S && a.correct ? a.taskId.S == task.SK.S.split("#")[1] && a.correct.BOOL === true : a.taskId == task.SK.S.split("#")[1] && a.correct === true));
									if (task.prerequisites.L.length > 0) {
										const prereqs = task.prerequisites.L.map((p) => p.S);
										const completedPrereqs = prereqs.filter((p) => activity.find((a) => a.taskId.S == p && a.correct.BOOL === true));
										if (completedPrereqs.length != prereqs.length) return null;
									}
									return (
										<Link
											component="button"
											onClick={() => {
												setSelectedTask(task);
												setSelectedTaskPackId(pack.PK.S);
												setOpen(true);
											}}
											id={task.SK.S.split("#")[1]}
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
				refreshManual={() => {
					API.get("api", `/competition/${compId}/activity`, {}).then(setActivity);
				}}
			/>
		</div>
	);
}
