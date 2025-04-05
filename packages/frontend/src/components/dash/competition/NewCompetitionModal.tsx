import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Option, Select, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Competition } from "../../../../../functions/src/types/competition";
import { Organisation } from "../../../../../functions/src/types/organisation";

interface NewCompetitionModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NewCompetitionModal({ open, setOpen }: NewCompetitionModalProps) {
	const [organisations, setOrganisations] = useState<Organisation[]>();
	const nav = useNavigate();

	useEffect(() => {
		async function onLoad() {
			try {
				const organisations = await API.get("api", `/organisation`, {});
				setOrganisations(organisations);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	const formik = useFormik({
		initialValues: {
			name: "",
			organisation: "",
		},
		onSubmit: async (values) => {
			const competition: Competition = await API.post("api", `/competition`, {
				body: {
					name: values.name,
					organisationId: values.organisation,
				},
			});
			nav(`/dash/competitions/${competition.id}`);
		},
	});

	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new competition</DialogTitle>
					<DialogContent>Fill in the information of the competition.</DialogContent>
					<form onSubmit={formik.handleSubmit}>
						<Stack spacing={2}>
							<FormControl>
								<FormLabel>Name</FormLabel>
								<Input
									autoFocus
									required
									id="name"
									name="name"
									value={formik.values.name}
									onChange={formik.handleChange}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Organisation</FormLabel>
								<Select
									id="organisation"
									name="organisation"
									value={formik.values.organisation}
									onChange={(_, value) => formik.setFieldValue("organisation", value)}
									required
									placeholder="Organisation">
									{organisations?.map((organisation) => {
										return <Option value={organisation.id}>{organisation.name}</Option>;
									})}
								</Select>
							</FormControl>
							<Button type="submit">Create</Button>
						</Stack>
					</form>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
