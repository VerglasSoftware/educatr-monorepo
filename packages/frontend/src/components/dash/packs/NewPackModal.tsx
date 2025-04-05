import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { Dispatch, Fragment, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";

interface NewPackModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NewPackModal({ open, setOpen }: NewPackModalProps) {
	const nav = useNavigate();
	const formik = useFormik({
		initialValues: {
			name: "",
			description: "",
		},
		onSubmit: async (values) => {
			await API.post("api", "/pack", {
				body: {
					name: values.name,
					description: values.description,
				},
			});
			nav(`/dash/packs/${values.name}`);
		},
	});
	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new pack</DialogTitle>
					<DialogContent>Fill in the information of the pack.</DialogContent>
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
							<FormControl>
								<FormLabel>Description</FormLabel>
								<Input
									required
									id="description"
									name="description"
									value={formik.values.description}
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
