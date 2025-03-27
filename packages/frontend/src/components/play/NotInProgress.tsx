import { Box, Card, CardContent, Typography } from "@mui/joy";
import { Competition } from "../../../../functions/src/types/competition";

interface NotInProgressProps {
	competition: Competition;
}

export default function NotInProgress({ competition }: NotInProgressProps) {
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
					<l-cardio
						size="50"
						stroke="4"
						speed="2"
						color="white"></l-cardio>

					{competition.status == "NOT_STARTED" && (
						<>
							<Typography
								level="title-lg"
								textColor="common.white"
								sx={{ mt: 2 }}>
								{competition.name} hasn't started yet
							</Typography>
							<Typography
								level="body-sm"
								textColor="common.white">
								This screen will automatically refresh when we're ready to start
							</Typography>
						</>
					)}

					{competition.status == "PAUSED" && (
						<>
							<Typography
								level="title-lg"
								textColor="common.white"
								sx={{ mt: 2 }}>
								{competition.name} is paused
							</Typography>
							<Typography
								level="body-sm"
								textColor="common.white">
								This screen will automatically refresh when we're ready to go again
							</Typography>
						</>
					)}

					{competition.status == "ENDED" && (
						<>
							<Typography
								level="title-lg"
								textColor="common.white"
								sx={{ mt: 2 }}>
								{competition.name} has ended
							</Typography>
							<Typography
								level="body-sm"
								textColor="common.white">
								Thanks for playing!
							</Typography>
						</>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
