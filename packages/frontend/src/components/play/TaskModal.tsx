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

export default function TaskModal({ open, setOpen, competition, task, packId, refreshManual }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; competition: any; task: any; packId: string; refreshManual: any }) {
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
					taskId: task.SK.split("#")[1],
					answer: answer,
					stdin: task.stdin,
				},
			});
			setSubmitTaskLoading(false);

			if (result.manual === true) {
				return toast.info(`${task.title} has been submitted for manual verification.`);
			}

			if (result.result === true) {
				toast.success(`You answered ${task.title} correctly, and ${task.points} point${task.points != 1 && "s"} have been added to your team.`);
				setOpen(false);
			} else {
				toast.error(`You answered ${task.title} incorrectly, but no points have been taken from your team.`);
			}
		} catch (e) {
			setSubmitTaskLoading(false);
			console.log(e);
			toast.warn(`Something went wrong when checking your task.`);
		}
	}
	useEffect(() => {
		if (task) {
			setAnswer(task.placeholder);
		}
	}, [task]);
	return (
		task && (
			<Fragment>
				<Modal
					open={open}
					onClose={() => setOpen(false)}>
					<ModalDialog minWidth="50%">
						<DialogTitle>{task.title}</DialogTitle>
						<DialogContent>
							{task.subtitle}
							{task.points} point{task.points != 1 && "s"}
						</DialogContent>
						<Divider />
						<DialogContent>{task.content}</DialogContent>
						<Divider />
						<DialogContent>
							{task.answerType == "TEXT" && (
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
							{task.answerType == "MULTIPLE" && (
								<Stack spacing={2}>
									<FormControl>
										<FormLabel>Answer</FormLabel>
										<RadioGroup
											defaultValue="medium"
											name="radio-buttons-group"
											value={answer}
											onChange={(e) => setAnswer(e.currentTarget.value)}>
											{JSON.parse(task.answer).map((answer: any) => (
												<Radio
													value={answer.text}
													label={answer.text}
												/>
											))}
										</RadioGroup>
									</FormControl>
								</Stack>
							)}
							{(task.answerType == "CSHARP" || task.answerType == "PYTHON") && (
								<Stack spacing={2}>
									<FormControl>
										<FormLabel>Answer</FormLabel>
										<CodeMirror
											height="40vh"
											extensions={task.answerType == "CSHARP" ? [csharp()] : [python()]}
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
															language: task.answerType,
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
										/>
									</FormControl>
								</Stack>
							)}
							{task.answerType == "WEB" && (
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
