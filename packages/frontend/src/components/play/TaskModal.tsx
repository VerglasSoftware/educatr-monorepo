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
import { Divider } from "@mui/joy";

export default function TaskModal({ open, setOpen, competition, task }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; competition: any; task: any }) {
	const nav = useNavigate();
	const { orgId } = useParams();

	return (
		task && (
			<React.Fragment>
				<Modal
					open={open}
					onClose={() => setOpen(false)}>
					<ModalDialog minWidth='50%'>
						<DialogTitle>{task.title.S}</DialogTitle>
						<DialogContent>
							{task.subtitle.S}
							{task.points.N} point{task.points.N != 1 && "s"}
						</DialogContent>
						<Divider />
						<DialogContent>{task.content.S}</DialogContent>
						<Divider />
                        <DialogContent>
                            {
                                task.answerType.S == "TEXT" && (
                                    <Stack spacing={2}>
                                        <FormControl>
                                            <FormLabel>Answer</FormLabel>
                                            <Input />
                                        </FormControl>
                                        <Button>Submit</Button>
                                    </Stack>
                                )
                            }
                        </DialogContent>
					</ModalDialog>
				</Modal>
			</React.Fragment>
		)
	);
}
