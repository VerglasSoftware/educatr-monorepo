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
import { API, Auth } from "aws-amplify";

export default function NewUserModal({ open, setOpen, organisation }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; organisation: any }) {
	const nav = useNavigate();
	const { orgId } = useParams();

	console.log(organisation);

	return (
		<React.Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new student</DialogTitle>
					<DialogContent>Fill in the information of the student.</DialogContent>
					<form
						onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();

							const user = await Auth.signUp({
								username: (event.currentTarget.elements[2] as any).value,
								password: (event.currentTarget.elements[3] as any).value,
								attributes: {
									given_name: (event.currentTarget.elements[0] as any).value,
									family_name: (event.currentTarget.elements[1] as any).value,
									"custom:initial": organisation.PK.split("#")[1],
								},
							});
							console.log(user);

							nav(0);
						}}>
						<Stack spacing={2}>
							<FormControl>
								<FormLabel>Given name</FormLabel>
								<Input
									autoFocus
									required
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Family name</FormLabel>
								<Input
									autoFocus
									required
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Username</FormLabel>
								<Input
									autoFocus
									required
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Password</FormLabel>
								<Input
									autoFocus
									required
									type="password"
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
