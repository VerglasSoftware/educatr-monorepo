import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Competition } from "../../../../functions/src/types/competition";
import "./Home.css";
import "./Play.css";

export default function PlayHome() {
	const [competitions, setCompetitions] = useState<Competition[]>([]);

	useEffect(() => {
		async function onLoad() {
			try {
				const competitions = await API.get("api", `/competition`, {});
				setCompetitions(competitions);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		<div className="Home">
			<Helmet>
				<title></title>
			</Helmet>

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
						}}>
						<Typography
							level="h2"
							component="h1"
							textColor="common.white">
							Educatr Launchpad 🚀
						</Typography>
						<Typography
							level="body-lg"
							textColor="common.white">
							Select a game to start
						</Typography>

						<Stack
							direction="column"
							spacing={1}
							sx={{ marginTop: 1, width: "100%" }}>
							{competitions.map((competition) => (
								<Card
									variant="plain"
									sx={{ display: "flex", gap: 2, backgroundColor: "rgb(0 0 0 / 0.3)" }}>
									<Link
										overlay
										href={`/play/${competition.id}`}
										underline="none"
										sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
										<Typography
											level="title-lg"
											textColor="common.white">
											{competition.name}
										</Typography>
										<Typography
											level="body-sm"
											textColor="common.white">
											{new Date(competition.createdAt).toLocaleString()}
										</Typography>
									</Link>
								</Card>
							))}
						</Stack>
					</CardContent>
				</Card>
			</Box>
		</div>
	);
}
