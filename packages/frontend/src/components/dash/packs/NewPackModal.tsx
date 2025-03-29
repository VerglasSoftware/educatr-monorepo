import { Button, DialogContent, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog, Stack } from "@mui/joy";
import { API } from "aws-amplify";
import { Dispatch, FormEvent, Fragment, SetStateAction } from "react";

interface NewPackModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NewPackModal({ open, setOpen }: NewPackModalProps) {
	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create new pack</DialogTitle>
					<DialogContent>Fill in the information of the pack.</DialogContent>
					<form
						onSubmit={async (event: FormEvent<HTMLFormElement>) => {
							event.preventDefault();
							await API.post("api", "/pack", {
								body: {
									name: (event.currentTarget.elements[0] as HTMLInputElement).value,
									description: (event.currentTarget.elements[1] as HTMLInputElement).value,
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
		</Fragment>
	);
}
