import { Autocomplete, Box, Button, ButtonGroup, Card, CardActions, CardOverflow, Divider, FormControl, FormLabel, Input, Option, Select, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { Competition } from "../../../../../functions/src/types/competition";
import { Organisation } from "../../../../../functions/src/types/organisation";
import { Team } from "../../../../../functions/src/types/team";
import { User } from "../../../../../functions/src/types/user";
import Breadcrumb from "../../../components/dash/breadcrumb";
import CompetitionPackTable from "../../../components/dash/competition/CompetitionPackTable";

export default function CompetitionDetail() {
	const [organisations, setOrganisations] = useState<Organisation[]>();
	const [competition, setCompetition] = useState<Competition>();
	const [teams, setTeams] = useState<Team[]>();
	const [students, setStudents] = useState<User[]>();

	const [name, setName] = useState<string>("");

	const { compId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const competition = await API.get("api", `/competition/${compId}`, {});
				setCompetition(competition);
				setName(competition.name);

				const teams = await API.get("api", `/competition/${compId}/team`, {});
				setTeams(teams);

				const organisations = await API.get("api", `/organisation`, {});
				setOrganisations(organisations);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	useEffect(() => {
		if (!competition?.organisationId) return;

		async function fetchStudents() {
			try {
				console.log("Fetching students...");
				const students = await API.get("api", `/organisation/${competition.organisationId}/student`, {});
				setStudents(students);
			} catch (e) {
				console.error("Error fetching students:", e);
			}
		}

		fetchStudents();
	}, [competition?.organisationId]);

	let teamMembers = [];
	for (const member in teams) {
		teamMembers = teamMembers.concat(teams[member].students);
	}
	console.log(competition, teams, organisations, students);
	return (
		competition &&
		teams &&
		organisations &&
		students && (
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
										<Stack spacing={1}>
											<FormLabel>Organisation</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Select
													size="sm"
													placeholder="Organisation"
													value={competition.organisationId}
													onChange={(e) => {
														const orgId = (e.target as HTMLSelectElement).value;
														console.log(orgId);
														setCompetition({ ...competition, organisationId: orgId });
													}}>
													{organisations?.map((organisation) => {
														return <Option value={organisation.id}>{organisation.name}</Option>;
													})}
												</Select>
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
						{teams.map((team) => (
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
														defaultValue={team.name}
														onChange={(e) => setTeams(teams.map((t) => (t.id == team.id ? { ...t, name: e.target.value } : t)))}
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
														options={students
															.filter((student) => !teamMembers.includes(student.id))
															.map((student) => {
																return { label: `${student.given_name} ${student.family_name}`, value: student.id };
															})}
														loading={students.length == 0}
														value={students
															.filter((student) => team.students.includes(student.id))
															.map((student) => {
																return { label: `${student.given_name} ${student.family_name}`, value: student.id };
															})}
														onChange={(_, v: { label: string; value: string }[]) => {
															const newStudents = v.map((s) => s.value);
															setTeams(teams.map((t) => (t.id == team.id ? { ...t, students: newStudents } : t)));
														}}
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
														await API.del("api", `/competition/${compId}/team/${team.id}`, {});
														setTeams(teams.filter((t) => t.id != team.id));
													}}>
													Delete
												</Button>
												<Button
													variant="solid"
													color="primary"
													onClick={async () => {
														try {
															const updatedTeam = await API.put("api", `/competition/${compId}/team/${team.id}`, {
																body: {
																	name: team.name,
																	students: team.students,
																},
															});
															setTeams(teams.map((t) => (t.id === team.id ? updatedTeam : t)));
														} catch (error) {
															console.error("Error updating team:", error);
														}
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
