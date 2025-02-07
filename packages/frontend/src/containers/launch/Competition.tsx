import { Box, Button, ButtonGroup, Card, CardContent, Divider, Typography } from "@mui/joy";
import "../play/Play.css";
import { Helmet } from "react-helmet";
import { useEffect, useRef, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import NavbarMain from "../../components/launch/Navbar";
import { DotWave } from "@uiball/loaders";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from "@zxing/library";
import LeaderboardModal from "../../components/play/LeaderboardModal";
import LeaderboardChart from "../../components/play/LeaderboardChart";

export default function LaunchCompetition() {
	const [competition, setCompetition] = useState<any>();
	const [packs, setPacks] = useState<any[]>();

	const [startButtonLoading, setStartButtonLoading] = useState(false);
	const [pauseButtonLoading, setPauseButtonLoading] = useState(false);
	const [resumeButtonLoading, setResumeButtonLoading] = useState(false);
	const [endButtonLoading, setEndButtonLoading] = useState(false);
	const [webhookStatus, setWebhookStatus] = useState<any>("Default");

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [scanButtonLoading, setScanButtonLoading] = useState(false);
	const [approveButtonLoading, setApproveButtonLoading] = useState(false);
	const [rejectButtonLoading, setRejectButtonLoading] = useState(false);

	const [openLeaderboard, setOpenLeaderboard] = useState(false);

	const [selectedTask, setSelectedTask] = useState<any>();

	const { compId } = useParams();

	const { sendMessage, lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI, {
		shouldReconnect: () => true,
		onReconnectStop: () => {
			window.location.reload();
		},
	});

	useEffect(() => {
		if (lastMessage !== null) {
			console.log(lastMessage);
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

	async function approveTask() {
		setApproveButtonLoading(true);
		await API.post("api", `/competition/${compId}/activity/${selectedTask.SK.split("#")[1]}/approve`, {});
		setApproveButtonLoading(false);
		setSelectedTask(null);
	}

	async function rejectTask() {
		setRejectButtonLoading(true);
		await API.post("api", `/competition/${compId}/activity/${selectedTask.SK.split("#")[1]}/reject`, {});
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
			const pack = { tasks: undefined, ...packs!.find((p) => p.tasks.find((t: any) => t.SK.S.split("#")[1] == activity.taskId)) };
			console.log(pack);
			setSelectedTask({
				task: packs!.find((p) => p.tasks.find((t: any) => t.SK.S.split("#")[1] == activity.taskId)).tasks.find((t: any) => t.SK.S.split("#")[1] == activity.taskId),
				pack,
				...activity,
			});
		} catch (error) {
			setScanButtonLoading(false);
			videoRef.current!.hidden = true;
			console.error("Error during scanning:", error);
		}
	}

	async function startCompetition() {
		setStartButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "IN_PROGRESS" },
		});

		sendMessage(
			JSON.stringify({
				action: "sendmessage",
				data: JSON.stringify({
					filter: {
						competitionId: compId,
					},
					type: "COMPETITION:STATUS_UPDATE",
					body: {
						status: "IN_PROGRESS",
					},
				}),
			})
		);

		setCompetition(newCompetition);
		setStartButtonLoading(false);
	}

	async function pauseCompetition() {
		setPauseButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "PAUSED" },
		});

		sendMessage(
			JSON.stringify({
				action: "sendmessage",
				data: JSON.stringify({
					filter: {
						competitionId: compId,
					},
					type: "COMPETITION:STATUS_UPDATE",
					body: {
						status: "PAUSED",
					},
				}),
			})
		);

		setCompetition(newCompetition);
		setPauseButtonLoading(false);
	}

	async function resumeCompetition() {
		setResumeButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "IN_PROGRESS" },
		});

		sendMessage(
			JSON.stringify({
				action: "sendmessage",
				data: JSON.stringify({
					filter: {
						competitionId: compId,
					},
					type: "COMPETITION:STATUS_UPDATE",
					body: {
						status: "IN_PROGRESS",
					},
				}),
			})
		);

		setCompetition(newCompetition);
		setResumeButtonLoading(false);
	}

	async function endCompetition() {
		setEndButtonLoading(true);
		const newCompetition = await API.put("api", `/competition/${compId}`, {
			body: { ...competition, status: "ENDED" },
		});

		sendMessage(
			JSON.stringify({
				action: "sendmessage",
				data: JSON.stringify({
					filter: {
						competitionId: compId,
					},
					type: "COMPETITION:STATUS_UPDATE",
					body: {
						status: "ENDED",
					},
				}),
			})
		);

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
		<div className="Home">
			<Helmet>
				<title>{competition.name}</title>
			</Helmet>

			<NavbarMain />

			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "left",
					flexDirection: "column",
					padding: "2%",
					gap: 2,
				}}>
				<Card
					variant="plain"
					sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "50%" }}>
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
							{competition.name} launchpad
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
					sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "50%" }}>
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
							Manual verification
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
									{selectedTask.pack.name && selectedTask.pack.name.S} | {selectedTask.task.title && selectedTask.task.title.S}
								</Typography>

								<Typography
									level="body-md"
									textColor="common.white">
									{selectedTask.task.content && selectedTask.task.content.S}
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
					sx={{ backgroundColor: "rgb(0 0 0 / 0.3)", width: "50%" }}>
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
						{
							!openLeaderboard &&
							<Box sx={{
								height: '30vh',
								width: undefined,
								backgroundColor: "white",
								}}>
								<LeaderboardChart competitionId={competition.PK} />
							</Box>
						}
						<Button
							color="primary"
							onClick={() => setOpenLeaderboard(true)}>
							Open
						</Button>
					</CardContent>
				</Card>
			</Box>
			{
				openLeaderboard &&
				<Box sx={{
					height: '100vh',
					width: '100vw',
					backgroundColor: "white",
					position: "absolute",
					left: 0,
					top: 0,
					zIndex: 999,
					}}>
					<LeaderboardChart competitionId={competition.PK} />
				</Box>
			}
		</div>
	);
}
