import { Box, Card, CardContent, Typography } from "@mui/joy";
import { DotWave } from "@uiball/loaders";

export default function Loading({ competition, packs, activity, webhookStatus }) {
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
					{!activity && (
						<Typography
							level="body-sm"
							textColor="common.white">
							Downloading task completion data
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
