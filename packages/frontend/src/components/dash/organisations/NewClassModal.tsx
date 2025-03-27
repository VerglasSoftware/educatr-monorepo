import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Class } from "../../../../../functions/src/types/class";

interface NewClassModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NewClassModal({ open, setOpen }: NewClassModalProps) {
	const nav = useNavigate();
	const { orgId } = useParams();

	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new class</DialogTitle>
					<DialogContent>Fill in the information of the class.</DialogContent>
					<form
						onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							const clazz: Class = await API.post("api", `/organisation/${orgId}/class`, {
								body: {
									name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
								},
							});
							nav(`/dash/${orgId}/classes/${clazz.id}`);
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
