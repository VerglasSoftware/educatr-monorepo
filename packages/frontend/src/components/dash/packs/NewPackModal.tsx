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
import { useNavigate } from "react-router-dom";
import { API } from "aws-amplify";

export default function NewPackModal({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
	const nav = useNavigate();

	return (
		<React.Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new pack</DialogTitle>
					<DialogContent>Fill in the information of the pack.</DialogContent>
					<form
						onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();

							const pack = await API.post("api", "/pack", {
								body: {
									name: (event.currentTarget.elements[0] as any).value,
									description: (event.currentTarget.elements[1] as any).value,
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
							<FormControl>
								<FormLabel>Description</FormLabel>
								<Input required />
							</FormControl>
							<Button type="submit">Create</Button>
						</Stack>
					</form>
				</ModalDialog>
			</Modal>
		</React.Fragment>
	);
}
