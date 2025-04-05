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
import "../play/Play.css";

interface SelectedTask {
	id: string;
	task: Task;
	pack: Pack;
	activity: Activity;
}

interface EnrichedActivity {
	activity: Activity;
	task: Task;
	pack: Pack;
	userName: string;
	verifierName?: string;
	type: string;
}

export default function LaunchCompetition() {
	const [competition, setCompetition] = useState<Competition>();
	const [packs, setPacks] = useState<PackWithTasks[]>();
	const [socketsLogs, setSocketsLogs] = useState<{ body: Activity; type: string; filter: { competitionId: string } }[]>([]);
	const [enrichedActivities, setEnrichedActivities] = useState<EnrichedActivity[]>([]);

	const [startButtonLoading, setStartButtonLoading] = useState(false);
	const [pauseButtonLoading, setPauseButtonLoading] = useState(false);
	const [resumeButtonLoading, setResumeButtonLoading] = useState(false);
	const [endButtonLoading, setEndButtonLoading] = useState(false);
	const [webhookStatus, setWebhookStatus] = useState<string>("Default");

	const videoRef = useRef<HTMLVideoElement | null>(null);
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

				const packs = await API.get("api", `/pack?include=tasks`, {});
				setPacks(packs);
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
					const user: User = await API.get("api", `/user/cognito/${socketsLog.body.userId}`, {});
					const teams: Team[] = await API.get("api", `/competition/${compId}/team`, {});
					const team = teams.find((t) => t.students.some((m) => m === user.id));
					let verifier: User = null;
					if (socketsLog.body.verifierId) {
						verifier = await API.get("api", `/user/cognito/${socketsLog.body.verifierId}`, {});
					}
					return {
						activity: socketsLog.body,
						task,
						pack,
						team,
						teamName: team?.name,
						userName: user.given_name + " " + user.family_name,
						verifierName: verifier?.given_name + " " + verifier?.family_name,
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

			const firstDeviceId = videoInputDevices[0].deviceId;

			// Decode from the camera
			const result = await codeReader.decodeOnceFromVideoDevice(firstDeviceId, videoRef.current!);

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

	if (!competition || !packs || webhookStatus != "Open") {
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
		webhookStatus == "Open" && (
			<div className="Home">
				<Helmet>
					<title>{competition.name}</title>
				</Helmet>

				<NavbarMain />

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						padding: "2%",
					}}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							width: "48%",
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

					<Box
						sx={{
							display: "flex",
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
							sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "100%", marginTop: "2%", height: "35vh", overflow: "scroll" }}>
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
										.map(({ activity, task, pack, teamName, userName, verifier, verifierName, type }) => (
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
															{userName} from {teamName} answered {task.title} | {pack.name} {activity.correct ? "correctly" : "incorrectly"} and was verified by {verifierName}
														</Typography>
													)}
													{type == "TASK:ANSWERED" && !verifier && (
														<Typography
															level="body-md"
															component="h3"
															textColor="common.white">
															{userName} from {teamName} answered {task.title} | {pack.name} {activity.correct ? "correctly" : "incorrectly"}
														</Typography>
													)}
													{type == "TASK:MANUAL" && (
														<Typography
															level="body-md"
															component="h3"
															textColor="common.white">
															{userName} from {teamName} is waiting for manual verification on {pack.name} | {task.title}
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
