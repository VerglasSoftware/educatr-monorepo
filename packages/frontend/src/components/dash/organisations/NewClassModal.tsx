import * as React from "react";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import Stack from "@mui/joy/Stack";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "aws-amplify";

export default function NewClassModal({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
	const nav = useNavigate();
	const { orgId } = useParams();

	return (
		<React.Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new class</DialogTitle>
					<DialogContent>Fill in the information of the class.</DialogContent>
					<form
						onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();

							const clazz = await API.post("api", `/organisation/${orgId}/class`, {
								body: {
									name: event.currentTarget.elements[0].value,
								},
							});

							console.log(clazz);

							nav(`/dash/${orgId}/classes/${clazz.SK.split("#")[1]}`);
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
