import { html } from "@codemirror/lang-html";
import { python } from "@codemirror/lang-python";
import { Divider, Radio, RadioGroup, Textarea } from "@mui/joy";
import Button from "@mui/joy/Button";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Stack from "@mui/joy/Stack";
import { csharp } from "@replit/codemirror-lang-csharp";
import CodeMirror from "@uiw/react-codemirror";
import { API } from "aws-amplify";
import { Fragment, useEffect, useState } from "react";
import NewWindow from "react-new-window";
import { toast } from "react-toastify";

export default function TaskModal({ open, setOpen, competition, task, packId }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; competition: any; task: any; packId: string }) {
	const [answer, setAnswer] = useState<string>("");
	const [submitTaskLoading, setSubmitTaskLoading] = useState<boolean>(false);
	const [stdin, setStdin] = useState<string>("");
	const [stdout, setStdout] = useState<string>("");
	const [runLoading, setRunLoading] = useState<boolean>(false);

	async function submitTask() {
		setSubmitTaskLoading(true);
		try {
			const result = await API.post("api", `/competition/${competition.PK}/check`, {
				body: {
					packId: packId,
					taskId: task.SK.S.split("#")[1],
					answer: answer,
					stdin
				},
			});
			setSubmitTaskLoading(false);

			if (result.manual === true) {
				refreshManual();
				return toast.info(`${task.title.S} has been submitted for manual verification.`);
			}

			if (result.result === true) {
				toast.success(`You answered ${task.title.S} correctly, and ${task.points.N} point${task.points.N != 1 && "s"} have been added to your team.`);
				setOpen(false);
			} else {
				toast.error(`You answered ${task.title.S} incorrectly, but no points have been taken from your team.`);
			}
		} catch (e) {
			setSubmitTaskLoading(false);
			toast.warn(`Something went wrong when checking your task.`);
		}
	}
	useEffect(() => {
		if (task) {
			setAnswer(task.placeholder.S);
		}
	}, [task]);
	return (
		task && (
			<Fragment>
				<Modal
					open={open}
					onClose={() => setOpen(false)}>
					<ModalDialog minWidth="50%">
						<DialogTitle>{task.title.S}</DialogTitle>
						<DialogContent>
							{task.subtitle.S}
							{task.points.N} point{task.points.N != 1 && "s"}
						</DialogContent>
						<Divider />
						<DialogContent>{task.content.S}</DialogContent>
						<Divider />
						<DialogContent>
							{task.answerType.S == "TEXT" && (
								<Stack spacing={2}>
									<FormControl>
										<FormLabel>Answer</FormLabel>
										<Input
											value={answer}
											onChange={(e) => setAnswer(e.currentTarget.value)}
										/>
									</FormControl>
								</Stack>
							)}
							{task.answerType.S == "MULTIPLE" && (
								<Stack spacing={2}>
									<FormControl>
										<FormLabel>Answer</FormLabel>
										<RadioGroup
											defaultValue="medium"
											name="radio-buttons-group"
											value={answer}
											onChange={(e) => setAnswer(e.currentTarget.value)}>
											{JSON.parse(task.answer.S).map((answer: any) => (
												<Radio
													value={answer.text}
													label={answer.text}
												/>
											))}
										</RadioGroup>
									</FormControl>
								</Stack>
							)}
							{(task.answerType.S == "CSHARP" || task.answerType.S == "PYTHON") && (
								<Stack spacing={2}>
									<FormControl>
										<FormLabel>Answer</FormLabel>
										<CodeMirror
											height="40vh"
											extensions={task.answerType.S == "CSHARP" ? [csharp()] : [python()]}
											value={answer}
											onChange={(e) => setAnswer(e)}
											className="mb-4"
										/>
										<Textarea
											value={stdin}
											onChange={(e) => setStdin(e.currentTarget.value)}
											placeholder="stdin"
										/>
										<Button
											disabled={answer.length == 0}
											onClick={async () => {
												setRunLoading(true);
												try {
													const result = await API.post("api", `/competition/${competition.PK}/run`, {
														body: {
															language: task.answerType.S,
															code: answer,
															stdin: stdin,
														},
													});
													setRunLoading(false);
													setStdout(result.output);
												} catch (e) {
													setRunLoading(false);
													setStdout("An error occurred when running your code.");
												}
											}}
											loading={runLoading}
											className="my-2">
											Run
										</Button>
										<Textarea
											readOnly
											value={stdout}
											placeholder="stdout"
											textArea
										/>
									</FormControl>
								</Stack>
							)}
							{task.answerType.S == "WEB" && (
								<Stack spacing={2}>
									<FormControl>
										<FormLabel>Answer</FormLabel>
										<CodeMirror
											height="50vh"
											extensions={[html()]}
											value={answer}
											onChange={(e) => setAnswer(e)}
										/>
									</FormControl>
									<NewWindow>
										<iframe
											srcDoc={answer}
											className="bg-white w-full h-full"
										/>
									</NewWindow>
								</Stack>
							)}
						</DialogContent>
						<Divider />
						<DialogContent>
							<Button
								onClick={submitTask}
								loading={submitTaskLoading}>
								Submit
							</Button>
						</DialogContent>
					</ModalDialog>
				</Modal>
			</Fragment>
		)
	);
}
