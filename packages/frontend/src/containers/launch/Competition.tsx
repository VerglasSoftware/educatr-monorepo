import { Box, Button, ButtonGroup, Card, CardContent, Divider, Typography } from "@mui/joy";
import { DotWave } from "@uiball/loaders";
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";
import { API } from "aws-amplify";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Activity } from "../../../../functions/src/types/activity";
import { Competition } from "../../../../functions/src/types/competition";
import { Pack, PackWithTasks } from "../../../../functions/src/types/pack";
import { Task } from "../../../../functions/src/types/task";
import { Team } from "../../../../functions/src/types/team";
import { User } from "../../../../functions/src/types/user";
import NavbarMain from "../../components/launch/Navbar";
import LeaderboardChart from "../../components/play/LeaderboardChart";

interface SelectedTask {
	id: string;
	task: Task;
	pack: Pack;
	activity: Activity;
}

interface EnrichedActivity {
	activity: Activity;
	user: User;
	team: Team;
	task: Task;
	pack: Pack;
	verifier: User;
	type: string;
}

export default function LaunchCompetition() {
	const [competition, setCompetition] = useState<Competition>();
	const [packs, setPacks] = useState<PackWithTasks[]>();
	const [users, setUsers] = useState<User[]>();
	const [teams, setTeams] = useState<Team[]>([]);
	const [socketsLogs, setSocketsLogs] = useState<{ body: Activity; type: string; filter: { competitionId: string } }[]>([]);
	const [enrichedActivities, setEnrichedActivities] = useState<EnrichedActivity[]>([]);

	const [startButtonLoading, setStartButtonLoading] = useState(false);
	const [pauseButtonLoading, setPauseButtonLoading] = useState(false);
	const [resumeButtonLoading, setResumeButtonLoading] = useState(false);
	const [endButtonLoading, setEndButtonLoading] = useState(false);
	const [webhookStatus, setWebhookStatus] = useState<string>("Default");

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

	const [scanButtonLoading, setScanButtonLoading] = useState(false);
	const [approveButtonLoading, setApproveButtonLoading] = useState(false);
	const [rejectButtonLoading, setRejectButtonLoading] = useState(false);

	const [openLeaderboard, setOpenLeaderboard] = useState(false);

	const [announce, setAnnounce] = useState<string>();

	const [selectedTask, setSelectedTask] = useState<SelectedTask>();

	const { compId } = useParams();

	const { lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI, {
		shouldReconnect: () => true,
		onReconnectStop: () => {
			window.location.reload();
		},
	});

	useEffect(() => {
		async function loadVideoDevices() {
			const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput");
			setVideoDevices(devices);
			if (devices.length > 0) {
				setSelectedDeviceId(devices[0].deviceId); // default to first
			}
		}
		loadVideoDevices();
	}, []);

	useEffect(() => {
		if (lastMessage) {
			const data = JSON.parse(lastMessage.data);
			console.log(data);
			if (data.filter.competitionId !== compId) return;
			if (data.type === "TASK:ANSWERED" || data.type === "TASK:MANUAL") {
				setSocketsLogs((prevSocketsLogs) => [...prevSocketsLogs, data]);
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

	useEffect(() => {
		async function onLoad() {
			try {
				const competition = await API.get("api", `/competition/${compId}`, {});
				setCompetition(competition);

				const packs = await API.get("api", `/competition/${compId}/packs`, {});
				setPacks(packs);

				const users = await API.get("api", `/user`, {});
				setUsers(users);

				const teams = await API.get("api", `/competition/${compId}/team`, {});
				setTeams(teams);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	useEffect(() => {
		async function enrich() {
			if (!packs) return;
			const results: EnrichedActivity[] = await Promise.all(
				socketsLogs.map(async (socketsLog) => {
					const pack = packs.find((p) => p.tasks.some((t) => t.id === socketsLog.body.taskId));
					const task = pack?.tasks.find((t) => t.id === socketsLog.body.taskId);
					const user = users.find((u) => u.id === socketsLog.body.userId);
					const team = teams.find((t) => t.students.some((s) => s === user?.id));
					let verifier: User | undefined;
					if (socketsLog.body.verifierId) {
						verifier = users.find((u) => u.id === socketsLog.body.verifierId);
					}
					return {
						activity: socketsLog.body,
						task,
						pack,
						user,
						team,
						verifier,
						type: socketsLog.type,
					};
				})
			);
			setEnrichedActivities(results);
		}

		enrich();
	}, [socketsLogs, packs]);

	async function approveTask() {
		setApproveButtonLoading(true);
		await API.post("api", `/competition/${compId}/activity/${selectedTask.id}/approve`, {});
		setApproveButtonLoading(false);
		setSelectedTask(null);
	}

	async function rejectTask() {
		setRejectButtonLoading(true);
		await API.post("api", `/competition/${compId}/activity/${selectedTask.id}/reject`, {});
		setRejectButtonLoading(false);
		setSelectedTask(null);
	}

	async function startScan() {
		setScanButtonLoading(true);
		videoRef.current!.hidden = false;
		try {
			const hints = new Map();
			hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);

			const codeReader = new BrowserMultiFormatReader(hints);

			// Get user media
			const videoInputDevices = await codeReader.listVideoInputDevices();
			if (videoInputDevices.length === 0) {
				console.error("No video input devices found");
				return;
			}

			const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId ?? "", videoRef.current!);
			setScanButtonLoading(false);
			videoRef.current!.hidden = true;
			console.log("Decoded text:", result.getText());

			const activity = await API.get("api", `/competition/${compId}/activity/${result.getText()}`, {});
			console.log(packs);
			const pack = { tasks: undefined, ...packs!.find((p) => p.tasks.find((t) => t.id == activity.taskId)) };
			console.log(pack);
			setSelectedTask({
				task: packs!.find((p) => p.tasks.find((t) => t.id == activity.taskId)).tasks.find((t) => t.id == activity.taskId),
				pack,
				...activity,
			});
		} catch (error) {
			setScanButtonLoading(false);
			videoRef.current!.hidden = true;
			console.error("Error during scanning:", error);
		}
	}

	async function sendAnnoucement() {
		setStartButtonLoading(true);
		await API.post("api", `/competition/${compId}/announce`, {
			body: { message: announce },
		});
		setStartButtonLoading(false);
		setAnnounce("");
	}

	async function showLeaderboard() {
		setStartButtonLoading(true);
		const showingLeaderboard = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, showLeaderboard: true },
		});
		setCompetition(showingLeaderboard);
		setStartButtonLoading(false);
	}

	async function hideLeaderboard() {
		setEndButtonLoading(true);
		const notShowingLeaderboard = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, showLeaderboard: false },
		});
		setCompetition(notShowingLeaderboard);
		setEndButtonLoading(false);
	}

	async function startCompetition() {
		setStartButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "IN_PROGRESS" },
		});
		setCompetition(newCompetition);
		setStartButtonLoading(false);
	}

	async function pauseCompetition() {
		setPauseButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "PAUSED" },
		});
		setCompetition(newCompetition);
		setPauseButtonLoading(false);
	}

	async function resumeCompetition() {
		setResumeButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "IN_PROGRESS" },
		});
		setCompetition(newCompetition);
		setResumeButtonLoading(false);
	}

	async function endCompetition() {
		setEndButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "ENDED" },
		});
		setCompetition(newCompetition);
		setEndButtonLoading(false);
	}

	if (!competition || !packs || webhookStatus != "Open" || !users || !teams) {
		return (
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
						<DotWave color="#FFF" />

						<Typography
							level="title-lg"
							textColor="common.white"
							sx={{ mt: 2 }}>
							Getting ready
						</Typography>
						{!competition && (
							<Typography
								level="body-sm"
								textColor="common.white">
								Downloading competition data
							</Typography>
						)}
						{!packs && (
							<Typography
								level="body-sm"
								textColor="common.white">
								Downloading pack data
							</Typography>
						)}
						{!users && (
							<Typography
								level="body-sm"
								textColor="common.white">
								Downloading competition user data
							</Typography>
						)}
						{!teams && (
							<Typography
								level="body-sm"
								textColor="common.white">
								Downloading competition team data
							</Typography>
						)}
						{webhookStatus != "Open" && (
							<Typography
								level="body-sm"
								textColor="common.white">
								Connecting to stream
							</Typography>
						)}
					</CardContent>
				</Card>
			</Box>
		);
	}

	return (
		competition &&
		packs &&
		users &&
		teams &&
		webhookStatus == "Open" && (
			<div className="Home">
				<Helmet>
					<title>{competition.name}</title>
				</Helmet>

				<NavbarMain />

				<Box
					sx={{
						display: { xs: "block", sm: "flex" }, // Change display to block (single column) on small screens and flex on larger ones
						flexDirection: { xs: "column", sm: "row" }, // Column layout for small screens, row layout for larger
						justifyContent: "space-between",
						padding: "2%",
						gap: 3,
					}}>
					{/* First Box (Left side) */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							width: "100%", // Use full width for smaller screens
							gap: 2,
						}}>
						<Card
							variant="plain"
							sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "left",
									justifyContent: "center",
									padding: "2%",
								}}>
								<Typography
									level="h2"
									component="h1"
									textColor="common.white">
									{competition.name} Launchpad
								</Typography>

								<ButtonGroup
									variant="solid"
									buttonFlex={1}>
									<Button
										color="success"
										disabled={competition.status != "NOT_STARTED"}
										onClick={startCompetition}
										loading={startButtonLoading}>
										Start
									</Button>
									{competition.status != "PAUSED" && (
										<Button
											color="warning"
											disabled={competition.status != "IN_PROGRESS"}
											onClick={pauseCompetition}
											loading={pauseButtonLoading}>
											Pause
										</Button>
									)}
									{competition.status == "PAUSED" && (
										<Button
											color="success"
											disabled={competition.status != "PAUSED"}
											onClick={resumeCompetition}
											loading={resumeButtonLoading}>
											Resume
										</Button>
									)}
									<Button
										color="danger"
										disabled={competition.status != "PAUSED"}
										onClick={endCompetition}
										loading={endButtonLoading}>
										End
									</Button>
								</ButtonGroup>
							</CardContent>
						</Card>

						<Card
							variant="plain"
							sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "left",
									justifyContent: "center",
									padding: "2%",
								}}>
								<Typography
									level="h3"
									component="h2"
									textColor="common.white">
									Manual Verification
								</Typography>
								{videoDevices.length > 1 && (
									<select
										value={selectedDeviceId ?? ""}
										onChange={(e) => setSelectedDeviceId(e.target.value)}
										style={{ marginBottom: "8px", padding: "4px" }}>
										{videoDevices.map((device) => (
											<option
												key={device.deviceId}
												value={device.deviceId}>
												{device.label || `Camera ${device.deviceId}`}
											</option>
										))}
									</select>
								)}
								<Button
									color="primary"
									disabled={competition.status != "IN_PROGRESS"}
									onClick={startScan}
									loading={scanButtonLoading}>
									Scan
								</Button>

								<video
									ref={videoRef}
									style={{ width: "100%", border: "1px solid black" }}
									autoPlay
									hidden={true}></video>

								<Divider orientation="horizontal" />

								{selectedTask && (
									<>
										<Typography
											level="h4"
											component="h3"
											textColor="common.white">
											{selectedTask.pack.name} | {selectedTask.task.title}
										</Typography>

										<Typography
											level="body-md"
											textColor="common.white">
											{selectedTask.task.content}
										</Typography>

										<ButtonGroup
											variant="solid"
											buttonFlex={1}>
											<Button
												color="success"
												onClick={approveTask}
												loading={approveButtonLoading}>
												Grant
											</Button>
											<Button
												color="danger"
												onClick={rejectTask}
												loading={rejectButtonLoading}>
												Reject
											</Button>
										</ButtonGroup>
									</>
								)}
							</CardContent>
						</Card>

						<Card
							variant="plain"
							sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "left",
									justifyContent: "center",
									padding: "2%",
								}}>
								<Typography
									level="h3"
									component="h2"
									textColor="common.white">
									Leaderboard View Control
								</Typography>
								<ButtonGroup
									variant="solid"
									buttonFlex={1}>
									<Button
										color="success"
										disabled={competition.showLeaderboard}
										onClick={showLeaderboard}
										loading={startButtonLoading}>
										Show
									</Button>
									<Button
										color="danger"
										disabled={!competition.showLeaderboard}
										onClick={hideLeaderboard}
										loading={endButtonLoading}>
										Hide
									</Button>
								</ButtonGroup>
							</CardContent>
						</Card>

						<Card
							variant="plain"
							sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "left",
									justifyContent: "center",
									padding: "2%",
								}}>
								<Typography
									level="h3"
									component="h2"
									textColor="common.white">
									Send Announcement Message
								</Typography>
								<textarea
									style={{ width: "100%", marginBottom: "8px" }}
									value={announce}
									onChange={(e) => setAnnounce(e.target.value)}
								/>
								<Button
									color="success"
									onClick={sendAnnoucement}
									loading={startButtonLoading}>
									Send
								</Button>
							</CardContent>
						</Card>
					</Box>

					{/* Second Box (Right side - Leaderboard & Activity Log) */}
					<Box
						sx={{
							display: { xs: "none", sm: "flex" }, // Hide leaderboard on small screens
							flexDirection: "column",
							width: "48%",
						}}>
						<Card
							variant="plain"
							sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "left",
									justifyContent: "center",
									padding: "2%",
								}}>
								<Typography
									level="h3"
									component="h2"
									textColor="common.white">
									Leaderboard
								</Typography>
								{!openLeaderboard && (
									<Box
										sx={{
											height: "30vh",
											backgroundColor: "white",
											width: "100%",
										}}>
										<LeaderboardChart competitionId={competition.id} />
									</Box>
								)}
								<Button
									color="primary"
									onClick={() => setOpenLeaderboard(true)}>
									Open
								</Button>
							</CardContent>
						</Card>

						<Card
							variant="plain"
							sx={{
								backgroundColor: "rgb(0 0 0 / 0.3)",
								width: "100%",
								marginTop: "2%",
								height: "35vh",
								overflow: "scroll",
							}}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "left",
									padding: "2%",
								}}>
								<Typography
									level="h3"
									component="h2"
									textColor="common.white">
									Activity Log
								</Typography>
								<Box
									sx={{
										marginTop: 1,
										width: "100%",
										overflow: "scroll",
									}}>
									{[...enrichedActivities]
										.sort((a, b) => new Date(b.activity.createdAt).getTime() - new Date(a.activity.createdAt).getTime())
										.map(({ activity, task, pack, user, team, verifier, type }) => (
											<Card
												variant="outlined"
												sx={{
													backgroundColor: "rgb(0 0 0 / 0.3)",
													marginTop: 1,
													width: "100%",
													maxHeight: "12vh",
												}}>
												<CardContent
													sx={{
														display: "flex",
														flexDirection: "column",
														alignItems: "left",
													}}>
													{type == "TASK:ANSWERED" && verifier && (
														<Typography
															level="body-md"
															component="h3"
															textColor="common.white">
															{user.given_name} {user.family_name} from {team.name} answered {task.title} | {pack.name} and was verified by {verifier.given_name} {verifier.family_name}
														</Typography>
													)}
													{type == "TASK:ANSWERED" && !verifier && (
														<Typography
															level="body-md"
															component="h3"
															textColor="common.white">
															{user.given_name} {user.family_name} from {team.name} answered {task.title} | {pack.name} {activity.correct ? "correctly" : "incorrectly"}
														</Typography>
													)}
													{type == "TASK:MANUAL" && (
														<Typography
															level="body-md"
															component="h3"
															textColor="common.white">
															{user.given_name} {user.family_name} from {team.name} is waiting for manual verification on {task.title} | {pack.name}
														</Typography>
													)}
												</CardContent>
											</Card>
										))}
								</Box>
							</CardContent>
						</Card>
					</Box>
				</Box>

				{openLeaderboard && (
					<Box
						sx={{
							height: "100vh",
							width: "100vw",
							backgroundColor: "white",
							position: "absolute",
							left: 0,
							top: 0,
							zIndex: 999,
						}}>
						<LeaderboardChart competitionId={competition.id} />
					</Box>
				)}
			</div>
		)
	);
}
