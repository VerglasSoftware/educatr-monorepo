import { Autocomplete, Box, Button, ButtonGroup, Card, CardActions, CardOverflow, Divider, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/dash/breadcrumb";
import CompetitionPackTable from "../../components/dash/organisations/CompetitionPackTable";

export default function CompetitionDetail() {
	const [competition, setCompetition] = useState<any>();
	const [teams, setTeams] = useState<any>([]);
	const [students, setStudents] = useState<any>([]);

	const [name, setName] = useState<any>("");

	const { compId, orgId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const competition = await API.get("api", `/competition/${compId}`, {});
				setCompetition(competition);
				setName(competition.name);

				const teams = await API.get("api", `/competition/${compId}/team`, {});
				setTeams(teams);

				const students = await API.get("api", `/organisation/${orgId}/students`, {});
				setStudents(students);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	console.log("teams is: " + JSON.stringify(teams));

	return (
		competition && (
			<div className="Home">
				<Helmet>
					<title>{competition.name} - Competitions</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Competitions", href: "/dash/competitions" },
								{ label: competition.name, href: `/dash/competitions/${compId}` },
							]}
						/>
					</Box>

					<Box
						sx={{
							display: "flex",
							mb: 1,
							gap: 1,
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "start", sm: "center" },
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}>
						<Typography
							level="h2"
							component="h1">
							{competition.name}
						</Typography>
					</Box>

					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
						<Box sx={{ gridColumn: "span 6" }}>
							<Card sx={{ flexGrow: "1" }}>
								<Stack
									direction="row"
									spacing={1}
									sx={{ my: 1 }}>
									<Stack
										spacing={2}
										sx={{ width: "100%" }}>
										<Stack spacing={1}>
											<FormLabel>Name</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													size="sm"
													placeholder="Name"
													value={name}
													onChange={(e) => setName(e.target.value)}
												/>
											</FormControl>
										</Stack>
									</Stack>
								</Stack>
								<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
									<CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
										<Button
											size="sm"
											variant="solid"
											onClick={async () => {
												const updatedCompetition = await API.put("api", `/competition/${compId}`, {
													body: {
														name,
														status: competition.status || "",
														packs: competition.packs || [],
													},
												});
												setCompetition(updatedCompetition);
											}}>
											Save
										</Button>
									</CardActions>
								</CardOverflow>
							</Card>
						</Box>
						<Box sx={{ gridColumn: "span 6" }}>
							<CompetitionPackTable competition={competition} />
						</Box>
					</Box>

					<Divider sx={{ my: 2 }} />

					<Box
						sx={{
							display: "flex",
							mb: 1,
							gap: 1,
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "start", sm: "center" },
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}>
						<Typography
							level="h3"
							component="h2">
							Teams
						</Typography>
						<Button
							color="primary"
							startDecorator={<FaPlus />}
							size="sm"
							onClick={async () => {
								const newTeam = await API.post("api", `/competition/${compId}/team`, {
									body: {
										name: "New team",
										students: [],
									},
								});

								setTeams([...teams, newTeam]);
							}}>
							New team
						</Button>
					</Box>

					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
						{teams.map((team: any) => (
							<Box sx={{ gridColumn: "span 3" }}>
								<Card sx={{ flexGrow: "1" }}>
									<Stack
										direction="row"
										spacing={1}
										sx={{ my: 1 }}>
										<Stack
											spacing={2}
											sx={{ width: "100%" }}>
											<Stack spacing={1}>
												<FormLabel>Name</FormLabel>
												<FormControl sx={{ gap: 2 }}>
													<Input
														size="sm"
														placeholder="Name"
														defaultValue={team.name.S}
														onChange={(e) => setTeams(teams.map((t: any) => (t.SK.S == team.SK.S ? { ...t, name: { S: e.target.value } } : t)))}
													/>
												</FormControl>
											</Stack>
											<Stack spacing={1}>
												<FormLabel>Members</FormLabel>
												<FormControl sx={{ gap: 2 }}>
													<Autocomplete
														multiple
														placeholder="Members"
														size="sm"
														options={students.map((student: any) => {
															return { label: `${student.given_name} ${student.family_name}`, value: student.PK };
														})}
														loading={students.length == 0}
														value={
															!team.students
																? []
																: team.students.SS.map((s: any) => {
																		return { label: `${students.find((student: any) => student.PK == s)?.given_name} ${students.find((student: any) => student.PK == s)?.family_name}`, value: s };
																	})
														}
														onChange={(e, v) => setTeams(teams.map((t: any) => (t.SK.S == team.SK.S ? { ...t, students: { SS: v.map((s: any) => s.value) } } : t)))}
													/>
												</FormControl>
											</Stack>
										</Stack>
									</Stack>
									<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
										<CardActions buttonFlex="1">
											<ButtonGroup
												sx={{ bgcolor: "background.surface" }}
												size="sm">
												<Button
													onClick={async () => {
														await API.del("api", `/competition/${compId}/team/${team.SK.S.split("#")[1]}`, {});
														setTeams(teams.filter((t: any) => t.SK.S != team.SK.S));
													}}>
													Delete
												</Button>
												<Button
													variant="solid"
													color="primary"
													onClick={async (e) => {
														const name = e.currentTarget.parentElement?.parentElement?.parentElement?.parentElement?.querySelectorAll("input")[0].value;

														const updatedTeam = await API.put("api", `/competition/${compId}/team/${team.SK.S.split("#")[1]}`, {
															body: {
																name: team.name.S,
																students: team.students.SS,
															},
														});

														//setTeams(teams.map((t: any) => (t.SK.S == team.SK.S ? updatedTeam : t)));
													}}>
													Save
												</Button>
											</ButtonGroup>
										</CardActions>
									</CardOverflow>
								</Card>
							</Box>
						))}
					</Box>
				</div>
			</div>
		)
	);
}
