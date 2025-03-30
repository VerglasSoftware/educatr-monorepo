import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import { API, Auth } from "aws-amplify";
import { cardio, pulsar } from "ldrs";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Activity } from "../../../../functions/src/types/activity";
import { Competition } from "../../../../functions/src/types/competition";
import { PackWithTasks } from "../../../../functions/src/types/pack";
import { Task } from "../../../../functions/src/types/task";
import { User } from "../../../../functions/src/types/user";
import AnnounceModal from "../../components/play/AnnounceModal";
import Loading from "../../components/play/Loading";
import NavbarMain from "../../components/play/Navbar";
import NotInProgress from "../../components/play/NotInProgress";
import { PDF417 } from "../../components/play/PDF417";
import TaskModal from "../../components/play/TaskModal";
import "./Play.css";

interface WaitingTask {
	id: string;
	title: string;
	pack: PackWithTasks;
	activity: Activity;
}

export default function PlayCompetition() {
	const [competition, setCompetition] = useState<Competition>();
	const [packs, setPacks] = useState<PackWithTasks[]>();
	const [webhookStatus, setWebhookStatus] = useState<string>("Default");

	const [selectedTaskPackId, setSelectedTaskPackId] = useState<string>();
	const [selectedTask, setSelectedTask] = useState<Task>();
	const [open, setOpen] = useState(false);

	const [waitingTask, setWaitingTask] = useState<WaitingTask>();

	const [announceModalOpen, setAnnounceModalOpen] = useState(false);
	const [announceMessage, setAnnounceMessage] = useState("");

	const [activities, setActivities] = useState<Activity[]>();

	const [user, setUser] = useState<User>();

	const { compId } = useParams();

	const { lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI, {
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
				case "TASK:ANSWERED": {
					const newActivity: Activity = data.body;
					setActivities([...(activities?.filter((a) => a.taskId !== newActivity.taskId) || []), newActivity]);
					if (waitingTask && newActivity.taskId === waitingTask.id) {
						setWaitingTask(null);
					}
					if (user && user.nickname != newActivity.userId) {
						if (newActivity.correct) {
							toast.success(`Someone answered ${newActivity.taskId} correctly, and points have been added to your team.`);
						} else {
							toast.error(`Someone answered ${newActivity.taskId} incorrectly, but no points have been taken from your team.`);
						}
					}
					break;
				}
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
				const promises = [API.get("api", `/competition/${compId}`, {}).then(setCompetition), API.get("api", `/pack?include=tasks`, {}).then(setPacks), API.get("api", `/competition/${compId}/activity`, {}).then(setActivities)];
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
		if (activities == null) return;
		if (packs == null) return;
		activities.forEach((activity) => {
			if (activity.status == "WAITING") {
				const pack = packs.find((p) => p.id == activity.packId);
				const task2 = pack.tasks.find((t) => t.id == activity.taskId);
				setWaitingTask({
					pack: { tasks: undefined, ...pack },
					activity: activity,
					...task2,
				});
			}
		});
	}, [activities, packs]);

	if (!competition || !packs || webhookStatus != "Open" || !activities) {
		return (
			<Loading
				competition={!!competition}
				packs={!!packs}
				activity={!!activities}
				webhookStatus={webhookStatus}
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
								{waitingTask.pack.name.toUpperCase()} | {waitingTask.title.toUpperCase()}
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
							<PDF417 value={waitingTask.activity && waitingTask.activity.id} />
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
					{packs.map((pack) => (
						<>
							<Typography
								level="h2"
								component="h1"
								textColor="common.white">
								{pack.name}
							</Typography>
							<Box sx={{ display: "grid", flexGrow: 1, gridTemplateColumns: "repeat(5, 1fr)", justifyContent: "center", gap: 2 }}>
								{pack.tasks
									.sort((a, b) => {
										// Sort numerically if titles are numbers, otherwise lexicographically
										const numA = parseFloat(a.title);
										const numB = parseFloat(b.title);
										if (!isNaN(numA) && !isNaN(numB)) {
											return numA - numB;
										}
										if (!isNaN(numA) || !isNaN(numB)) {
											return isNaN(numA) ? 1 : -1;
										}
										return a.title.localeCompare(b.title, undefined, { numeric: true });
									})
									.map((task) => {
										const correct = !!activities.find((a) => a.taskId === task.id && a.correct === true);
										if (task.prerequisites && task.prerequisites.length > 0) {
											const prereqs = task.prerequisites.map((p) => p);
											const completedPrereqs = prereqs.filter((p) => activities.find((a) => a.taskId == p && a.correct === true));
											if (completedPrereqs.length != prereqs.length) return null;
										}
										return (
											<Link
												component="button"
												onClick={() => {
													setSelectedTask(task);
													setSelectedTaskPackId(pack.id);
													setOpen(true);
												}}
												id={task.id}
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
				setActivities={setActivities}
				// refreshManual={() => {
				// 	API.get("api", `/competition/${compId}/activity`, {}).then(setActivities);
				// }}
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
