import Button from "@mui/joy/Button";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Stack from "@mui/joy/Stack";
import { API } from "aws-amplify";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function NewCompetitionModal({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
	const nav = useNavigate();
	const { orgId } = useParams();

	return (
		<React.Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new competition</DialogTitle>
					<DialogContent>Fill in the information of the competition.</DialogContent>
					<form
						onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();

							const competition = await API.post("api", `/competition`, {
								body: {
									name: event.currentTarget.elements[0].value,
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
		</React.Fragment>
	);
}
