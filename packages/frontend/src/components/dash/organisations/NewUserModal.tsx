import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { Auth } from "aws-amplify";
import { useFormik } from "formik";
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
	const formik = useFormik({
		initialValues: {
			username: "",
			password: "",
			givenName: "",
			familyName: "",
		},
		onSubmit: async (values) => {
			await Auth.signUp({
				username: values.username,
				password: values.password,
				attributes: {
					given_name: values.givenName,
					family_name: values.familyName,
					"custom:initial": organisation.id,
				},
			});
			nav(0);
		},
	});
	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new student</DialogTitle>
					<DialogContent>Fill in the information of the student.</DialogContent>
					<form onSubmit={formik.handleSubmit}>
						<Stack spacing={2}>
							<FormControl>
								<FormLabel>Given name</FormLabel>
								<Input
									autoFocus
									required
									id="givenName"
									name="givenName"
									value={formik.values.givenName}
									onChange={formik.handleChange}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Family name</FormLabel>
								<Input
									autoFocus
									required
									id="familyName"
									name="familyName"
									value={formik.values.familyName}
									onChange={formik.handleChange}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Username</FormLabel>
								<Input
									autoFocus
									required
									id="username"
									name="username"
									value={formik.values.username}
									onChange={formik.handleChange}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Password</FormLabel>
								<Input
									autoFocus
									required
									type="password"
									id="password"
									name="password"
									value={formik.values.password}
									onChange={formik.handleChange}
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
