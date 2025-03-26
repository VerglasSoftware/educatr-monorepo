import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { Dispatch, FormEvent, Fragment, SetStateAction } from "react";
import { useParams } from "react-router-dom";

interface NewCompetitionModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NewCompetitionModal({ open, setOpen }: NewCompetitionModalProps) {
	const { orgId } = useParams();

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
							const form = event.currentTarget as HTMLFormElement;
							const nameInput = form.elements.namedItem("name") as HTMLInputElement;
							await API.post("api", `/competition`, {
								body: {
									name: nameInput.value,
									organisationId: orgId,
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
								/>
							</FormControl>
							<Button type="submit">Create</Button>
						</Stack>
					</form>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
