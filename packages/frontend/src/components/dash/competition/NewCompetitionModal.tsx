import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Option, Select, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { Dispatch, FormEvent, Fragment, SetStateAction, useEffect, useState } from "react";
import { Organisation } from "../../../../../functions/src/types/organisation";

interface NewCompetitionModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NewCompetitionModal({ open, setOpen }: NewCompetitionModalProps) {
	const [organisations, setOrganisations] = useState<Organisation[]>();

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
	});

	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new competition</DialogTitle>
					<DialogContent>Fill in the information of the competition.</DialogContent>
					<form
						onSubmit={async (event: FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							const formData = new FormData(event.currentTarget);
							const formJson = Object.fromEntries(formData.entries());
							await API.post("api", `/competition`, {
								body: {
									name: formJson.name,
									organisationId: formJson.organisation,
								},
							});

							setOpen(false);
						}}>
						<Stack spacing={2}>
							<FormControl>
								<FormLabel>Name</FormLabel>
								<Input
									autoFocus
									required
									name="name"
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Organisation</FormLabel>
								<Select
									name="organisation"
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
