import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import { API, Auth } from "aws-amplify";
import { cardio, pulsar } from "ldrs";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import NewWindow from "react-new-window";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Activity } from "../../../../functions/src/types/activity";
import { Competition } from "../../../../functions/src/types/competition";
import { Pack, PackWithTasks } from "../../../../functions/src/types/pack";
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
	task: Task;
	pack: Pack;
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

	const [teamPoints, setTeamPoints] = useState(0);
	const [activities, setActivities] = useState<Activity[]>();
	const [taskLookup, setTaskLookup] = useState<Record<string, Task>>({});

	const [user, setUser] = useState(null);

	const [websocketUrl, setWebsocketUrl] = useState<string>(null);

	const { compId } = useParams();

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const { lastMessage, readyState } = useWebSocket(
		websocketUrl,
		{
			shouldReconnect: () => true,
			onReconnectStop: () => {
				window.location.reload();
			},
		},
		!!websocketUrl
	);

	useEffect(() => {
		async function handleMessage() {
			if (lastMessage) {
				const data = JSON.parse(lastMessage.data);
				if (data.filter.competitionId !== compId) return;
				switch (data.type) {
					case "COMPETITION:STATUS_UPDATE":
						setCompetition({ ...competition, status: data.body.status });
						break;
					case "TASK:ANSWERED": {
						const newActivity: Activity = data.body;
						setActivities([...(activities?.filter((a) => a.taskId !== newActivity.taskId) || []), newActivity]);
						if (waitingTask && newActivity.taskId === waitingTask.id) {
							setWaitingTask(null);
						}
						if (user && user.username != newActivity.userId) {
							// path parameter is the userId
							console.log("userId", newActivity.userId);
							const useruser: User = await API.get("api", `/user/cognito/${newActivity.userId}`, {});
							const pack = packs.find((p) => p.id == newActivity.packId);
							const task = pack.tasks.find((t) => t.id == newActivity.taskId);

							if (newActivity.correct) {
								toast.success(`${useruser.nickname || useruser.given_name} answered ${task.title} in ${pack.name} correctly, and ${task.points} points have been added to your team.`);
							} else {
								toast.error(`${useruser.nickname || useruser.given_name} answered ${task.title} in ${pack.name} incorrectly, but no points have been taken from your team.`);
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
		}
		handleMessage();
	}, [lastMessage]);

	useEffect(() => {
		const connectionStatus = {
			[ReadyState.CONNECTING]: "Connecting",
			[ReadyState.OPEN]: "Open",
			[ReadyState.CLOSING]: "Closing",
			[ReadyState.CLOSED]: "Closed",
			[ReadyState.UNINSTANTIATED]: "Uninstantiated",
		}[readyState];
		setWebhookStatus(connectionStatus);
	}, [readyState]);

	cardio.register();
	pulsar.register();

	useEffect(() => {
		async function onLoad() {
			try {
				const [competitionData, packsData, activitiesData]: [Competition, PackWithTasks[], Activity[]] = await Promise.all([API.get("api", `/competition/${compId}`, {}) as Promise<Competition>, API.get("api", `/pack?include=tasks`, {}) as Promise<PackWithTasks[]>, API.get("api", `/competition/${compId}/activity`, {}) as Promise<Activity[]>]);
				setCompetition(competitionData);
				setPacks(packsData.filter((pack) => competitionData.packs.includes(pack.id)));
				setActivities(activitiesData);
			} catch (e) {
				console.log(e);
			}
		}

		async function fetchUser() {
			try {
				const currentUser = await Auth.currentAuthenticatedUser();
				setUser(currentUser);
				const userId = currentUser.username;
				setWebsocketUrl(`${import.meta.env.VITE_WEBSOCKET_URI}?userId=${encodeURIComponent(userId)}`);
			} catch (error) {
				console.error("Error fetching user", error);
			}
		}

		onLoad();
		fetchUser();
	}, []);

	useEffect(() => {
		if (!packs) return;

		const lookup: Record<string, Task> = {};
		packs.forEach((pack) => {
			pack.tasks.forEach((task) => {
				lookup[task.id] = task;
			});
		});

		setTaskLookup(lookup);
	}, [packs]);

	useEffect(() => {
		if (!activities || !taskLookup) return;

		const countedTaskIds = new Set();

		const totalPoints = activities
			.filter((a) => a.correct === true)
			.filter((a) => {
				if (countedTaskIds.has(a.taskId)) return false;
				countedTaskIds.add(a.taskId);
				return true;
			})
			.reduce((sum, act) => {
				const task = taskLookup[act.taskId];
				return sum + (task?.points || 0);
			}, 0);

		setTeamPoints(totalPoints);
	}, [activities, taskLookup]);

	useEffect(() => {
		if (activities == null) return;
		if (packs == null) return;
		activities.forEach((activity) => {
			if (activity.status == "WAITING") {
				const pack = packs.find((p) => p.id == activity.packId);
				const task2 = pack.tasks.find((t) => t.id == activity.taskId);
				setWaitingTask({
					pack: { tasks: undefined, ...pack },
					task: task2,
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
				<>
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
					{isClient && waitingTask.task.answerType === "WEB" && (
						<NewWindow>
							<iframe
								srcDoc={waitingTask.activity && waitingTask.activity.answer}
								className="bg-white w-full h-full"
							/>
						</NewWindow>
					)}
				</>
			)
		);
	}

	return (
		<div className="Home">
			<Helmet>
				<title>{competition.name}</title>
			</Helmet>
			<NavbarMain
				competition={competition}
				points={teamPoints}
			/>
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
