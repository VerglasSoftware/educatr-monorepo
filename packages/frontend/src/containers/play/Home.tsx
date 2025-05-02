import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Competition } from "../../../../functions/src/types/competition";
import { Team } from "../../../../functions/src/types/team";
import { User } from "../../../../functions/src/types/user";
import "./Home.css";

export default function PlayHome() {
	const [competitions, setCompetitions] = useState<Competition[]>([]);
	const [teams, setTeams] = useState<Map<string, Team[]>>(new Map());
	const [me, setMe] = useState<User | null>(null);

	useEffect(() => {
		async function onLoad() {
			try {
				const competitions: Competition[] = await API.get("api", `/competition`, {});
				setCompetitions(competitions);
				competitions.forEach(async (competition) => {
					const teams: Team[] = await API.get("api", `/competition/${competition.id}/team`, {});
					setTeams((prev) => new Map(prev).set(competition.id, teams));
				});
				const me: User = await API.get("api", `/user/me`, {});
				setMe(me);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		me && (
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
								sx={{ marginTop: 1, width: "100%", maxHeight: "50vh", overflowY: "auto" }}>
								{competitions
									.filter((competition) => {
										const teamsInCompetition = teams.get(competition.id) || [];
										return me && teamsInCompetition.some((team) => team.students.includes(me.id));
									})
									.map((competition) => (
										<Card
											key={competition.id}
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
		)
	);
}
