import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { Auth } from "aws-amplify";
import { Dispatch, Fragment, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { Organisation } from "../../../../../functions/src/types/organisation";

interface NewUserModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	organisation: Organisation;
}

export default function NewUserModal({ open, setOpen, organisation }: NewUserModalProps) {
	const nav = useNavigate();
	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new student</DialogTitle>
					<DialogContent>Fill in the information of the student.</DialogContent>
					<form
						onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							const form = event.currentTarget;
							const username = (form.elements.namedItem("username") as HTMLInputElement).value;
							const password = (form.elements.namedItem("password") as HTMLInputElement).value;
							const givenName = (form.elements.namedItem("givenName") as HTMLInputElement).value;
							const familyName = (form.elements.namedItem("familyName") as HTMLInputElement).value;

							await Auth.signUp({
								username,
								password,
								attributes: {
									given_name: givenName,
									family_name: familyName,
									"custom:initial": organisation.id,
								},
							});
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
		</Fragment>
	);
}
