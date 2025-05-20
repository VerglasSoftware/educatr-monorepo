import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Competition } from "../../../../../functions/src/types/competition";
import { Team } from "../../../../../functions/src/types/team";
import { User } from "../../../../../functions/src/types/user";
import Page from "../../../_design/components/layout/Page";
import { useAppContext } from "../../../lib/contextLib";
import SidebarDash from "../../../components/SidebarDash";
import Container from "../../../_design/components/layout/Container";
import Breadcrumbs from "../../../_design/components/navigation/Breadcrumbs";
import Text from "../../../_design/components/core/Text";
import Loader from "../../../_design/components/core/Loader";
import { Tab, Tabs } from "../../../_design/components/layout/Tabs";
import Select from "../../../_design/components/form/Select";
import { Pack } from "../../../../../functions/src/types/pack";
import Card from "../../../_design/components/layout/Card";
import { IoAddCircleOutline, IoPencil } from "react-icons/io5";
import Input from "../../../_design/components/form/Input";
import Button from "../../../_design/components/core/Button";
import EditCompetitionModal from "../../../modals/dash/EditCompetitionModal";

export default function CompetitionDetail() {
	const [competition, setCompetition] = useState<Competition>();
	const [teams, setTeams] = useState<Team[]>();
	const [students, setStudents] = useState<User[]>();
	const [packs, setPacks] = useState<Pack[]>();
	const [selectedPacks, setSelectedPacks] = useState<string[]>([]);

	const [newTeamLoading, setNewTeamLoading] = useState(false);

	const [editCompetitionModalOpen, setEditCompetitionModalOpen] = useState(false);

	const { compId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const [competition, teams, packs] = await Promise.all([API.get("api", `/competition/${compId}`, {}), API.get("api", `/competition/${compId}/team`, {}), API.get("api", `/pack`, {})]);
				setCompetition(competition);
				setTeams(teams);
				setPacks(packs);
				setSelectedPacks(competition.packs);
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
			<Page title={competition && competition.name + " | Competitions"} useAuthContext={useAppContext} sidebar={<SidebarDash />}>
				<Container>
					<Breadcrumbs
						items={[
							{ label: "Dashboard", href: "/dash" },
							{ label: "Competitions", href: "/dash/competitions" },
							{ label: competition && competition.name , href: `/dash/competition/${compId}/edit` }
						]}
					/>
					<div className="flex items-center">
						<Text variant="title" as="h1">{competition && competition.name}</Text>
						<Button variant="text" size="large" onClick={() => { setEditCompetitionModalOpen(true) }}>
							<IoPencil className="text-primary" />
						</Button>
					</div>
					
					{
						(!competition) ? (
							<Loader />
						) : (
							<>
							<Tabs>
							<Tab id="packs" label="Packs">
								<Select
									searchable
									multiple
									options={packs && packs.map((pack) => ({
										label: pack.name,
										value: pack.id,
									}))}
									name="packs"
									label="Packs"
									value={selectedPacks}
									onChange={async (selectedValues) => {
										const values = typeof selectedValues === "string" ? [selectedValues] : selectedValues;
										setSelectedPacks(values);
										try {
											await API.put("api", `/competition/${compId}`, {
												body: {
													...competition,
													packs: values,
												},
											});
											toast.success("Packs updated successfully", {
												theme: "light",
											});
										} catch (error) {
											console.error("Error updating packs:", error);
											toast.error("Failed to update packs", {
												theme: "light",
											});
										}
									}}
								/>
							</Tab>
							<Tab id="teams" label="Teams">
								<div className="grid grid-cols-3 gap-4">
									{
										teams && teams.map((team) => {
											return (
												<Card>
													<Input
														name="name"
														label="Name"
														defaultValue={team.name}
														onBlur={(e) => {
															const updateTeamName = async () => {
																try {
																	await API.put("api", `/competition/${compId}/team/${team.id}`, {
																		body: {
																			...team,
																			name: e.currentTarget.value,
																		},
																	});
																	toast.success("Team name updated successfully", {
																		theme: "light",
																	});
																} catch (error) {
																	console.error("Error updating team name:", error);
																	toast.error("Failed to update team name", {
																		theme: "light",
																	});
																}
															};

															updateTeamName();
														}}
													/>
													<Select
														searchable
														multiple
														options={students ? students
															.filter((student) => !(teamMembers.includes(student.id) && !team.students.includes(student.id)))
															.map((student) => ({
																label: `${student.given_name} ${student.family_name}`,
																value: student.id,
															})) : []}
														name="members"
														label={`Members (${team.students.length})`}
														value={team.students}
														onChange={async (selectedValues) => {
															const values = typeof selectedValues === "string" ? [selectedValues] : selectedValues;
															try {
																await API.put("api", `/competition/${compId}/team/${team.id}`, {
																	body: {
																		...team,
																		students: values,
																	},
																});
																toast.success("Team members updated successfully", {
																	theme: "light",
																});
																setTeams(teams.map((t) => (t.id === team.id ? { ...t, students: values } : t)));
															} catch (error) {
																console.error("Error updating team members:", error);
																toast.error("Failed to update team members", {
																	theme: "light",
																});
															}
														}}
													/>
												</Card>
											);
										})
									}
									<Card className="justify-center items-center cursor-pointer hover:bg-primary-hover/10" onClick={async () => {
										setNewTeamLoading(true);
										try {
											const newTeam = await API.post("api", `/competition/${compId}/team`, {
												body: {
													name: "New team",
													students: [],
												},
											});
											setTeams([...teams, newTeam]);
										} catch (error) {
											console.error("Error creating new team:", error);
											toast.error("Failed to create new team", {
												theme: "light",
											});
										} finally {
											setNewTeamLoading(false);
										}
									}}>
										{
											newTeamLoading ?
											<Loader />
											:
											<IoAddCircleOutline size={25} />
										}
									</Card>
								</div>
							</Tab>
							</Tabs>
							</>
						)
					}
					<EditCompetitionModal isOpen={editCompetitionModalOpen} onClose={() => setEditCompetitionModalOpen(false)} competitionId={compId} />
				</Container>
			</Page>
	);
}
