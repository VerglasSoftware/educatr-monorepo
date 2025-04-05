import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { useFormik } from "formik";
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
	const formik = useFormik({
		initialValues: {
			name: "",
		},
		onSubmit: async (values) => {
			const clazz: Class = await API.post("api", `/organisation/${orgId}/class`, {
				body: {
					name: values.name,
				},
			});
			nav(`/dash/${orgId}/classes/${clazz.id}`);
		},
	});

	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new class</DialogTitle>
					<DialogContent>Fill in the information of the class.</DialogContent>
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
							<Button type="submit">Create</Button>
						</Stack>
					</form>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
