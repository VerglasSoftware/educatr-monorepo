import { Box, Card, CardContent, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { Competition } from "../../../../functions/src/types/competition";

interface NotInProgressProps {
	competition: Competition;
}

export default function NotInProgress({ competition }: NotInProgressProps) {
	const [loaded, setLoaded] = useState(false);

	// Load the Tally embed script only once.
	useEffect(() => {
		if (!window.Tally) {
			const scriptTag = document.createElement("script");
			scriptTag.src = "https://tally.so/widgets/embed.js";
			scriptTag.onload = () => {
				setLoaded(true);
			};
			document.body.appendChild(scriptTag);
			return () => {
				document.body.removeChild(scriptTag);
			};
		} else {
			setLoaded(true);
		}
	}, []);

	// When the competition status changes to ENDED, force Tally to reinitialize the embeds.
	useEffect(() => {
		if (competition.status === "ENDED" && loaded && window.Tally && typeof window.Tally.loadEmbeds === "function") {
			window.Tally.loadEmbeds();
		}
	}, [competition.status, loaded]);

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

					{competition.status === "NOT_STARTED" && (
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

					{competition.status === "PAUSED" && (
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

					{competition.status === "ENDED" && (
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
							{loaded && (
								<>
									<Typography
										level="body-sm"
										textColor="common.white">
										Please fill out the feedback form below
									</Typography>
									{/* Using key={competition.status} forces React to remount the iframe when status changes */}
									<iframe
										key={competition.status}
										data-tally-src="https://tally.so/embed/nGbP0o"
										loading="lazy"
										width="100%"
										height="500"
										frameBorder="0"
										marginHeight={0}
										marginWidth={0}
										title="(2025) IglooCode Student Feedback"></iframe>
								</>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
