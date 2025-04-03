import { Box, IconButton, Stack, Tooltip } from "@mui/joy";
import { FaCaretLeft, FaMaximize, FaMinimize } from "react-icons/fa6";

export default function NavbarMain({ ...props }) {
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
							href="/dash/competitions"
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
