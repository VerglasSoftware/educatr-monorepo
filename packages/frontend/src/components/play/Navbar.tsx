import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/joy";
import { useState } from "react";
import { FaCaretLeft, FaCoins, FaMaximize, FaMinimize, FaTrophy } from "react-icons/fa6";
import LeaderboardChart from "./LeaderboardChart";
import { useParams } from "react-router-dom";
import LeaderboardModal from "./LeaderboardModal";

export default function NavbarMain({ competition, points, ...props }) {
	const [open, setOpen] = useState(false);
	const [openLeaderboard, setOpenLeaderboard] = useState(false);

	const { compId } = useParams();

	const isFullscreen = () => !!document.fullscreenElement;

	return (
		<Box
			component="header"
			className="Header"
			{...props}
			sx={[
				{
					p: 1.5,
					gap: 2,
					bgcolor: "common.black",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					gridColumn: "1 / -1",
					position: "sticky",
					top: 0,
					zIndex: 900,
				},
			]}>
			<Box sx={{ display: "grid", flexGrow: 1, gridTemplateColumns: "repeat(3, 1fr)", justifyContent: "center" }}>
				<Stack
					direction="row"
					spacing={1}
					sx={{
						justifyContent: "left",
						alignItems: "center",
						float: "left",
					}}>
					<Tooltip
						title="Back"
						variant="outlined">
						<IconButton
							size="sm"
							variant="plain"
							color="neutral"
							component="a"
							href="/play"
							sx={{ alignSelf: "center", backgroundColor: "rgb(255 255 255 / 0.2)", color: "white" }}>
							{<FaCaretLeft />}
						</IconButton>
					</Tooltip>
				</Stack>

				<Stack
					direction="row"
					sx={{
						justifyContent: "center",
						alignItems: "center",
					}}>
					<img
						src="/logo.png"
						alt="Educatr logo"
						style={{ height: 25 }}
					/>
				</Stack>

				<Box
					sx={{
						display: "flex",
						flexDirection: "row",
						gap: 1.5,
						alignItems: "center",
						justifyContent: "right",
					}}>
					<Tooltip
						title="Ranking"
						variant="outlined">
						<IconButton
							onClick={() => setOpenLeaderboard(true)}
							size="sm"
							variant="plain"
							color="neutral"
							sx={{ alignSelf: "center", backgroundColor: "rgb(255 255 255 / 0.2)", color: "white", ":hover": { color: "black" }, px: 1 }}>
							<FaTrophy color="gold" />
							<Typography sx={{ color: "inherit" }}></Typography>
						</IconButton>
					</Tooltip>

					{competition && competition.showLeaderboard && (
						<LeaderboardModal
							open={openLeaderboard}
							setOpen={setOpenLeaderboard}
							competitionId={compId}
						/>
					)}

					<Tooltip
						title="Points"
						variant="outlined">
						<IconButton
							size="sm"
							variant="plain"
							color="neutral"
							sx={{ alignSelf: "center", backgroundColor: "rgb(255 255 255 / 0.2)", color: "white", ":hover": { color: "black" }, px: 1 }}>
							<FaCoins color="SkyBlue" />
							<Typography sx={{ color: "inherit", ml: 1 }}>{points || 0}</Typography>
						</IconButton>
					</Tooltip>

					<Tooltip
						title={isFullscreen() ? "Minimise" : "Maximise"}
						variant="outlined">
						<IconButton
							size="sm"
							variant="plain"
							color="neutral"
							onClick={async () => {
								if (isFullscreen()) {
									await document.exitFullscreen();
								} else {
									await document.documentElement.requestFullscreen();
								}
							}}
							sx={{ alignSelf: "center", backgroundColor: "rgb(255 255 255 / 0.2)", color: "white" }}>
							{isFullscreen() ? <FaMinimize /> : <FaMaximize />}
						</IconButton>
					</Tooltip>
				</Box>
			</Box>
		</Box>
	);
}
