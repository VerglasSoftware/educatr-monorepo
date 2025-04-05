import { Autocomplete, Button, ButtonGroup, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Competition } from "../../../../../functions/src/types/competition";
import { Team } from "../../../../../functions/src/types/team";
import { User } from "../../../../../functions/src/types/user";

interface TeamCardProps {
	team: Team;
	students: User[];
	competition: Competition;
	onDelete: (id: string) => void;
	onUpdate: (team: Team) => void;
}

export default function TeamCard({ team, students, competition, onDelete, onUpdate }: TeamCardProps) {
	const { compId } = useParams();

	const formik = useFormik({
		initialValues: {
			id: team.id,
			name: team.name,
			students: [] as string[],
		},
		enableReinitialize: true,
		onSubmit: async (values) => {
			const updated: Team = await API.put("api", `/competition/${compId}/team/${values.id}`, {
				body: {
					name: values.name,
					students: values.students,
				},
			});
			onUpdate(updated);
		},
	});

	useEffect(() => {
		formik.setFieldValue(
			"students",
			team.students.map((s) => s)
		);
	}, []);

	const teamRef = useRef(team);

	useEffect(() => {
		async function fetchTeams() {
			try {
				const updatedTeam = await API.get("api", `/competition/${compId}/team/${teamRef.current.id}`, {});
				teamRef.current = updatedTeam;
				formik.setFieldValue(
					"students",
					updatedTeam.students.map((s) => s)
				);
			} catch (e) {
				console.error("Error fetching teams:", e);
			}
		}

		fetchTeams();
	}, [competition]);

	return (
		<Card>
			<form onSubmit={formik.handleSubmit}>
				<Stack
					spacing={2}
					sx={{ my: 1 }}>
					<FormControl>
						<FormLabel>Name</FormLabel>
						<Input
							size="sm"
							name="name"
							value={formik.values.name}
							onChange={formik.handleChange}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Members</FormLabel>
						<Autocomplete
							multiple
							placeholder="Members"
							size="sm"
							options={students.map((s) => ({
								label: `${s.given_name} ${s.family_name}`,
								value: s.id,
							}))}
							value={formik.values.students.map((s) => ({
								label: `${students.find((u) => u.id === s)?.given_name} ${students.find((u) => u.id === s)?.family_name}`,
								value: s,
							}))}
							isOptionEqualToValue={(o, v) => o.value === v.value}
							onChange={(_, value: { label: string; value: string }[]) => {
								formik.setFieldValue(
									"students",
									value.map((v) => v.value)
								);
							}}
						/>
					</FormControl>
				</Stack>
				<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
					<CardActions>
						<ButtonGroup size="sm">
							<Button
								onClick={async () => {
									await API.del("api", `/competition/${compId}/team/${team.id}`, {});
									onDelete(team.id);
								}}>
								Delete
							</Button>
							<Button
								type="submit"
								variant="solid"
								color="primary">
								Save
							</Button>
						</ButtonGroup>
					</CardActions>
				</CardOverflow>
			</form>
		</Card>
	);
}
