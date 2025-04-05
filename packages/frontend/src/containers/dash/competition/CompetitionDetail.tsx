import { Box, Button, Card, CardActions, CardOverflow, Divider, FormControl, FormLabel, Input, Option, Select, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Competition } from "../../../../../functions/src/types/competition";
import { Organisation } from "../../../../../functions/src/types/organisation";
import { Team } from "../../../../../functions/src/types/team";
import { User } from "../../../../../functions/src/types/user";
import Breadcrumb from "../../../components/dash/breadcrumb";
import CompetitionPackTable from "../../../components/dash/competition/CompetitionPackTable";
import TeamCard from "../../../components/dash/competition/TeamCard";

export default function CompetitionDetail() {
	const [organisations, setOrganisations] = useState<Organisation[]>();
	const [competition, setCompetition] = useState<Competition>();
	const [teams, setTeams] = useState<Team[]>();
	const [students, setStudents] = useState<User[]>();

	const { compId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const [competition, teams, organisations] = await Promise.all([API.get("api", `/competition/${compId}`, {}), API.get("api", `/competition/${compId}/team`, {}), API.get("api", `/organisation`, {})]);
				setCompetition(competition);
				setTeams(teams);
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
				const students = await API.get("api", `/organisation/${competition.organisationId}/students`, {});
				setStudents(students);
			} catch (e) {
				console.error("Error fetching students:", e);
			}
		}

		fetchStudents();
	}, [competition?.organisationId]);

	useEffect(() => {
		if (!competition) return;
		formik.setValues({
			name: competition.name,
			organisation: competition.organisationId,
		});
	}, [competition]);

	const formik = useFormik({
		initialValues: {
			name: "",
			organisation: "",
		},
		onSubmit: async (values) => {
			const competition: Competition = await API.put("api", `/competition/${compId}`, {
				body: {
					name: values.name,
					organisationId: values.organisation,
				},
			});
			setCompetition(competition);
			toast.success("Competition updated", {
				theme: "light",
			});
			formik.resetForm();
		},
	});

	let teamMembers = [];
	for (const member in teams) {
		teamMembers = teamMembers.concat(teams[member].students);
	}
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
								<form onSubmit={formik.handleSubmit}>
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
														id="name"
														name="name"
														value={formik.values.name}
														onChange={formik.handleChange}
													/>
												</FormControl>
											</Stack>
											<Stack spacing={1}>
												<FormLabel>Organisation</FormLabel>
												<FormControl sx={{ gap: 2 }}>
													<Select
														size="sm"
														placeholder="Organisation"
														id="organisation"
														name="organisation"
														value={formik.values.organisation}
														onChange={(_, value) => formik.setFieldValue("organisation", value)}
														required>
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
												type="submit">
												Save
											</Button>
										</CardActions>
									</CardOverflow>
								</form>
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
						{teams.map((team) => {
							console.log("Team", team);
							return (
								<Box
									key={team.id}
									sx={{ gridColumn: "span 3" }}>
									<TeamCard
										team={team}
										students={students}
										competition={competition}
										onDelete={(id) => setTeams(teams.filter((t) => t.id !== id))}
										onUpdate={(updated) => {
											setTeams(teams.map((t) => (t.id === updated.id ? updated : t)));
											toast.success("Team updated", {
												theme: "light",
											});
										}}
									/>
								</Box>
							);
						})}
					</Box>
				</div>
			</div>
		)
	);
}
