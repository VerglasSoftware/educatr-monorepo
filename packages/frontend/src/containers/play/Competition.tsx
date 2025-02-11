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
import AnnounceModal from "../../components/play/AnnounceModal";
import { toast } from "react-toastify";
import { Auth } from "aws-amplify";

export default function PlayCompetition() {
	const [competition, setCompetition] = useState<any>();
	const [packs, setPacks] = useState<any[]>();
	const [webhookStatus, setWebhookStatus] = useState<any>("Default");

	const [selectedTask, setSelectedTask] = useState<any>();
	const [selectedTaskPackId, setSelectedTaskPackId] = useState<string>("");
	const [open, setOpen] = useState<any>();

	const [waitingTask, setWaitingTask] = useState<any>();

	const [announceModalOpen, setAnnounceModalOpen] = useState(false);
	const [announceMessage, setAnnounceMessage] = useState("");

	const [activity, setActivity] = useState<any[]>();

	const [user, setUser] = useState<any>();

	const { compId } = useParams();

	const { sendMessage, lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI, {
		shouldReconnect: () => true,
		onReconnectStop: () => {
			window.location.reload();
		},
	});

	useEffect(() => {
		if (lastMessage) {
			const data = JSON.parse(lastMessage.data);
			if (data.type !== "COMPETITION:ANNOUNCE" && (!data.filter?.competitionId || data.filter.competitionId !== compId)) return;

			switch (data.type) {
				case "COMPETITION:STATUS_UPDATE":
					setCompetition({ ...competition, showLeaderboard: data.body.showLeaderboard });
					break;
				case "TASK:ANSWERED":
					const newActivity = data.body;
					setActivity([...(activity?.filter((a) => a.taskId.S !== newActivity.taskId) || []), newActivity]);
					if (waitingTask && newActivity.taskId === waitingTask.SK.S.split("#")[1]) {
						setWaitingTask(null);
					}
					if (user && user.username != newActivity.userId) {
						if (newActivity.correct) {
							toast.success(`Someone answered ${newActivity.taskId} correctly, and points have been added to your team.`);
						} else {
							toast.error(`Someone answered ${newActivity.taskId} incorrectly, but no points have been taken from your team.`);
						}
					}
					break;
				case "COMPETITION:SHOW_LEADERBOARD":
					setCompetition({ ...competition, showLeaderboard: data.body.showLeaderboard });
					break;
				case "COMPETITION:ANNOUNCE":
					setAnnounceMessage(data.body.announce);
					setAnnounceModalOpen(true);
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

		async function fetchUser() {
			try {
				const currentUser = await Auth.currentAuthenticatedUser();
				console.log(currentUser);
				setUser(currentUser);
			} catch (error) {
				console.error("Error fetching user", error);
			}
		}

		onLoad();
		fetchUser();
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
			<NavbarMain competition={competition} />
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
									const correct = activity.find((a) => (a.taskId && a.correct ? a.taskId == task.SK.split("#")[1] && a.correct === true : a.taskId == task.SK.split("#")[1] && a.correct === true));
									if (task.prerequisites && task.prerequisites.length > 0) {
										const prereqs = task.prerequisites.map((p) => p);
										const completedPrereqs = prereqs.filter((p) => activity.find((a) => a.taskId == p && a.correct === true));
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
											id={task.SK.split("#")[1]}
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
														{task.title}
													</Typography>
													<Typography
														level="body-sm"
														textColor="common.white">
														{task.points} point{task.points != 1 && "s"}
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

			{announceModalOpen && (
				<AnnounceModal
					open={announceModalOpen}
					setOpen={setAnnounceModalOpen}
					announce={announceMessage}
				/>
			)}
		</div>
	);
}
