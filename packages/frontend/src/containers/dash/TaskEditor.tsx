import { html } from "@codemirror/lang-html";
import { python } from "@codemirror/lang-python";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckIcon from "@mui/icons-material/Check";
import CodeIcon from "@mui/icons-material/Code";
import DataObjectIcon from "@mui/icons-material/DataObject";
import EditIcon from "@mui/icons-material/Edit";
import HelpIcon from "@mui/icons-material/Help";
import InputIcon from "@mui/icons-material/Input";
import { Box, Button, Checkbox, FormControl, FormLabel, Input, Option, Select, Textarea, Typography } from "@mui/joy";
import { csharp } from "@replit/codemirror-lang-csharp";
import CodeMirror from "@uiw/react-codemirror";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/dash/breadcrumb";
import "./TaskEditor.css";

interface AnswerChoice {
	id: string;
	name: string;
	correct?: boolean;
}

export default function TaskEditor() {
	const [pack, setPack] = useState<any>();
	const [tasks, setTasks] = useState<any[]>([]);
	const [task, setTask] = useState<any>();
	const [possibleVerificationTypes, setPossibleVerificationTypes] = useState<string[]>([]);

	const placeholderOnChange = useCallback((val, viewUpdate) => {
		formik.setFieldValue("placeholder", val);
	}, []);

	const { id } = useParams();
	const formik = useFormik({
		initialValues: {
			title: "",
			subtitle: "",
			content: "",
			placeholder: "",
			answer: "",
			answerChoices: [] as AnswerChoice[],
			answerType: "",
			verificationType: "",
			prerequisites: [] as string[],
			points: 0,
			stdin: "",
		},
		onSubmit: async (values) => {
			const newTask = await API.put("api", `/pack/${id}/task/${task.id}`, {
				body: {
					title: values.title,
					subtitle: values.subtitle,
					content: values.content,
					placeholder: values.placeholder,
					answer: values.answer,
					answerChoices: values.answerChoices,
					answerType: values.answerType,
					verificationType: values.verificationType,
					prerequisites: values.prerequisites,
					points: values.points,
					stdin: values.stdin,
				},
			});
			// doing this becuase the repsonse of the put request doesnt have the S's and N's dynamodb types.
			const updatedTasks = tasks.map((t) => {
				if (t.id == newTask.SK.split("#")[1]) {
					return {
						...t,
						title: newTask.title,
						subtitle: newTask.subtitle,
						content: newTask.content,
						placeholder: newTask.placeholder,
						answer: newTask.answer,
						answerChoices: newTask.answerChoices.map((item) => ({ id: item.id, name: item.name, correct: item.correct })),
						answerType: newTask.answerType,
						verificationType: newTask.verificationType,
						prerequisites: newTask.prerequisites,
						points: newTask.points,
						stdin: newTask.stdin,
					};
				}
				return t;
			});
			setTasks(updatedTasks);
			setTask(updatedTasks.find((t) => t.id === task.id));
			formik.resetForm({ values });
		},
	});

	const pythonPlaceholder = "#\n# Type your code beneath this line\n#";
	const csharpPlaceholder = "using System;\n\nnamespace Educatr {\n\tclass Program {\n\t\tstatic void Main(string[] args) {\n\t\t\t// Type your code beneath this line\n\t\t}\n\t}\n}";
	const htmlPlaceholder = "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<title>Page Title</title>\n\t</head>\n\t<body>\n\t\t<h1>This is a Heading</h1>\n\t\t<p>This is a paragraph.</p>\n\t</body>\n</html>";

	useEffect(() => {
		async function onLoad() {
			try {
				const pack = await API.get("api", `/pack/${id}`, {});
				const tasks = await API.get("api", `/pack/${id}/task`, {});
				setPack(pack);
				setTasks(tasks);
				setTask(tasks[0]);
			} catch (e) {
				console.log(e);
			}
		}
		onLoad();
	}, [id]);

	useEffect(() => {
		if (tasks.length > 0) {
			switch (formik.getFieldProps("answerType").value) {
				case "PYTHON":
					setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
					break;
				case "CSHARP":
					setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
					break;
				case "WEB":
					setPossibleVerificationTypes(["MANUAL"]);
					break;
				case "MULTIPLE":
					setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
					break;
				case "TEXT":
					setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
					break;
			}
			formik.setValues({
				title: task.title,
				subtitle: task.subtitle,
				content: task.content,
				placeholder: task.placeholder,
				answer: task.answer,
				answerChoices: task.answerChoices ? task.answerChoices.map((item) => ({
					id: item.id,
					name: item.name,
					correct: item.correct,
				})) : [],
				answerType: task.answerType,
				verificationType: task.verificationType,
				prerequisites: task.prerequisites ? task.prerequisites.map((item) => item) : [],
				points: parseInt(task.points),
				stdin: task.stdin ? task.stdin : "",
			});
		}
	}, [tasks]);

	return (
		pack &&
		tasks && (
			<div className="Home">
				<Helmet>
					<title>{pack.name} - Task Editor</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Packs", href: "/dash/packs" },
								{ label: pack.name, href: `/dash/packs/${id}` },
								{ label: "Editor", href: `/dash/packs/${id}/edit` },
							]}
						/>
					</Box>
					<Box
						sx={{
							display: "flex",
							mb: 1,
							gap: 1,
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "start", sm: "center" },
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}>
						<Typography
							level="h2"
							component="h1">
							{pack.name}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "center" }}>
						<Button
							variant="plain"
							disabled={tasks[0].id == task.id}
							onClick={() => {
								const index = tasks.findIndex((t) => t.id == task.id);
								setTask(tasks[index - 1]);
								switch (tasks[index - 1].answerType) {
									case "PYTHON":
										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
										break;
									case "CSHARP":
										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
										break;
									case "WEB":
										setPossibleVerificationTypes(["MANUAL"]);
										break;
									case "MULTIPLE":
										setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
										break;
									case "TEXT":
										setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
										break;
								}
								formik.setValues({
									title: tasks[index - 1].title,
									subtitle: tasks[index - 1].subtitle,
									content: tasks[index - 1].content,
									placeholder: tasks[index - 1].placeholder,
									answer: tasks[index - 1].answer,
									answerChoices: tasks[index - 1].answerChoices ? tasks[index - 1].answerChoices.map((item) => ({
										id: item.id,
										name: item.name,
										correct: item.correct,
									})) : [],
									answerType: tasks[index - 1].answerType,
									verificationType: tasks[index - 1].verificationType,
									prerequisites: tasks[index - 1].prerequisites ? tasks[index - 1].prerequisites.L.map((item) => item) : [],
									points: parseInt(tasks[index - 1].points),
									stdin: tasks[index - 1].stdin ? tasks[index - 1].stdin : "",
								});
							}}>
							<ArrowBackIcon />
						</Button>
						<Typography
							level="h3"
							component="h2"
							sx={{ my: 0 }}>
							{task.title}
						</Typography>
						<Button
							variant="plain"
							disabled={tasks[tasks.length - 1].id == task.id}
							onClick={() => {
								const index = tasks.findIndex((t) => t.id == task.id);
								setTask(tasks[index + 1]);
								switch (tasks[index + 1].answerType) {
									case "PYTHON":
										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
										break;
									case "CSHARP":
										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
										break;
									case "WEB":
										setPossibleVerificationTypes(["MANUAL"]);
										break;
									case "MULTIPLE":
										setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
										break;
									case "TEXT":
										setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
										break;
								}
								formik.setValues({
									title: tasks[index + 1].title,
									subtitle: tasks[index + 1].subtitle,
									content: tasks[index + 1].content,
									placeholder: tasks[index + 1].placeholder,
									answer: tasks[index + 1].answer,
									answerChoices: tasks[index + 1].answerChoices ? tasks[index + 1].answerChoices.map((item) => ({
										id: item.id,
										name: item.name,
										correct: item.correct,
									})) : [],
									answerType: tasks[index + 1].answerType,
									verificationType: tasks[index + 1].verificationType,
									prerequisites: tasks[index + 1].prerequisites ? tasks[index + 1].prerequisites.map((item) => item) : [],
									points: parseInt(tasks[index + 1].points),
									stdin: tasks[index + 1].stdin ? tasks[index + 1].stdin : "",
								});
							}}>
							<ArrowForwardIcon />
						</Button>
					</Box>
					<form onSubmit={formik.handleSubmit}>
						<Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
							<Box sx={{ gridColumn: "span 3" }}>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2, overflow: "auto", height: "calc(100vh - 14rem)" }}>
									<FormLabel className="flex items-center">
										<AssignmentTurnedInIcon className="mr-1" />
										Title
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Input
											id="title"
											name="title"
											type="text"
											onChange={formik.handleChange}
											value={formik.values.title}
										/>
									</FormControl>
									<FormLabel className="flex items-center">
										<HelpIcon className="mr-1" />
										Description
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Textarea
											id="subtitle"
											name="subtitle"
											minRows={2}
											onChange={formik.handleChange}
											value={formik.values.subtitle}
										/>
									</FormControl>
									<FormLabel className="flex items-center">
										<EditIcon className="mr-1" />
										Content
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Textarea
											id="content"
											name="content"
											minRows={2}
											onChange={formik.handleChange}
											value={formik.values.content}
										/>
									</FormControl>
									{formik.getFieldProps("verificationType").value == "MULTIPLE" && formik.getFieldProps("answerType").value == "MULTIPLE" && (
										<>
											<FormLabel className="flex items-center">
												<AssignmentTurnedInIcon className="mr-1" />
												Answer choices
											</FormLabel>
											{formik.values.answerChoices.map((item, index) => (
												<div
													className="mt-2 flex w-full space-x-4"
													key={item.id}>
													<FormControl sx={{ flex: 1 }}>
														<FormLabel>Option {index + 1}</FormLabel>
														<Input
															id={`answerChoices.${index}.name`}
															name={`answerChoices.${index}.name`}
															type="text"
															onChange={formik.handleChange}
															value={item.name} 
														/>
													</FormControl>
													<FormControl>
														<FormLabel>Correct</FormLabel>
														<Checkbox
															id={`answerChoices.${index}.correct`}
															name={`answerChoices.${index}.correct`}
															onChange={formik.handleChange}
															checked={item.correct}
														/>
													</FormControl>
													<Button
														type="button"
														variant="plain"
														onClick={() => {
															const newAnswerChoices = formik.values.answerChoices.filter((_, i) => i !== index);
															formik.setFieldValue("answerChoices", newAnswerChoices);
														}}>
														Remove
													</Button>
												</div>
											))}
											<Button
												type="button"
												onClick={() => {
													const newAnswerChoices = [...formik.values.answerChoices, { id: crypto.randomUUID(), name: "", correct: false }];
													formik.setFieldValue("answerChoices", newAnswerChoices);
												}}>
												Add
											</Button>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "MULTIPLE" && (
										<>
											<FormLabel className="flex items-center">
												<AssignmentTurnedInIcon className="mr-1" />
												Answer choices
											</FormLabel>
											{formik.values.answerChoices.map((item, index) => (
												<div
													className="mt-2 flex w-full space-x-4"
													key={item.id}>
													<FormControl sx={{ flex: 1 }}>
														<FormLabel>Option {index + 1}</FormLabel>
														<Input
															id={`answerChoices.${index}.name`}
															name={`answerChoices.${index}.name`}
															type="text"
															onChange={formik.handleChange}
															value={item.name}
														/>
													</FormControl>
													<Button
														type="button"
														variant="plain"
														onClick={() => {
															const newAnswerChoices = formik.values.answerChoices.filter((_, i) => i !== index);
															formik.setFieldValue("answerChoices", newAnswerChoices);
														}}>
														Remove
													</Button>
												</div>
											))}
											<Button
												type="button"
												onClick={() => {
													const newAnswerChoices = [...formik.values.answerChoices, { id: crypto.randomUUID(), name: "" }];
													formik.setFieldValue("answerChoices", newAnswerChoices);
												}}>
												Add
											</Button>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "COMPARE" && formik.getFieldProps("answerType").value == "TEXT" && (
										<>
											<FormLabel className="flex items-center">
												<CheckIcon className="mr-1" />
												Answer
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													id="answer"
													name="answer"
													type="text"
													onChange={formik.handleChange}
													value={formik.values.answer}
												/>
											</FormControl>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "ALGORITHM" && formik.getFieldProps("answerType").value == "PYTHON" && (
										<>
											<FormLabel className="flex items-center">
												<CodeIcon className="mr-1" />
												Placeholder
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<CodeMirror
													id="placeholder"
													height="50vh"
													extensions={[python()]}
													value={formik.values.placeholder}
													onChange={placeholderOnChange}
												/>
											</FormControl>
											<FormLabel className="flex items-center">
												<CheckIcon className="mr-1" />
												Stdout value
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													id="answer"
													name="answer"
													type="text"
													onChange={formik.handleChange}
													value={formik.values.answer}
												/>
											</FormControl>
											<FormLabel className="flex items-center">
												<InputIcon className="mr-1" />
												Stdin value
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													id="stdin"
													name="stdin"
													type="text"
													onChange={formik.handleChange}
													value={formik.values.stdin}
												/>
											</FormControl>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "PYTHON" && (
										<>
											<FormLabel className="flex items-center">
												<CodeIcon className="mr-1" />
												Placeholder
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<CodeMirror
													id="placeholder"
													height="50vh"
													extensions={[python()]}
													value={formik.values.placeholder}
													onChange={placeholderOnChange}
												/>
											</FormControl>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "ALGORITHM" && formik.getFieldProps("answerType").value == "CSHARP" && (
										<>
											<FormLabel className="flex items-center">
												<CodeIcon className="mr-1" />
												Placeholder
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<CodeMirror
													id="placeholder"
													height="50vh"
													extensions={[csharp()]}
													value={formik.values.placeholder}
													onChange={(newValue) => {
														console.log(newValue);
														formik.setFieldValue("placeholder", newValue);
													}}
												/>
											</FormControl>
											<FormLabel className="flex items-center">
												<CheckIcon className="mr-1" />
												Stdout value
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													id="answer"
													name="answer"
													type="text"
													onChange={formik.handleChange}
													value={formik.values.answer}
												/>
											</FormControl>
											<FormLabel className="flex items-center">
												<InputIcon className="mr-1" />
												Stdin value
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													id="stdin"
													name="stdin"
													type="text"
													onChange={formik.handleChange}
													value={formik.values.stdin}
												/>
											</FormControl>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "CSHARP" && (
										<>
											<FormLabel className="flex items-center">
												<CodeIcon className="mr-1" />
												Placeholder
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<CodeMirror
													id="placeholder"
													height="50vh"
													extensions={[csharp()]}
													value={formik.values.placeholder}
													onChange={formik.handleChange}
												/>
											</FormControl>
										</>
									)}
									{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "WEB" && (
										<>
											<FormLabel className="flex items-center">
												<CodeIcon className="mr-1" />
												Placeholder
											</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<CodeMirror
													id="placeholder"
													height="50vh"
													extensions={[html()]}
													value={formik.values.placeholder}
													onChange={formik.handleChange}
												/>
											</FormControl>
										</>
									)}
								</Box>
							</Box>
							<Box sx={{ gridColumn: "span 1" }}>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
									<FormLabel className="flex items-center">
										<DataObjectIcon className="mr-1" />
										Answer Type
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Select
											id="answerType"
											name="answerType"
											onChange={(event, newValue) => {
												formik.setFieldValue("answer", "");
												formik.setFieldValue("answerChoices", []);
												switch (newValue) {
													case "PYTHON":
														formik.setFieldValue("placeholder", pythonPlaceholder);
														setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
														break;
													case "CSHARP":
														formik.setFieldValue("placeholder", csharpPlaceholder);
														setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
														break;
													case "WEB":
														formik.setFieldValue("placeholder", htmlPlaceholder);
														setPossibleVerificationTypes(["MANUAL"]);
														break;
													case "MULTIPLE":
														formik.setFieldValue("placeholder", "");
														setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
														break;
													case "TEXT":
														formik.setFieldValue("placeholder", "");
														setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
														break;
												}
												formik.setFieldValue("answerType", newValue);
											}}
											value={formik.values.answerType}>
											<Option value="TEXT">Text</Option>
											<Option value="MULTIPLE">Multiple Choice</Option>
											<Option value="PYTHON">Python</Option>
											<Option value="CSHARP">C#</Option>
											<Option value="WEB">Web</Option>
										</Select>
									</FormControl>
									<FormLabel className="flex items-center">
										<CheckIcon className="mr-1" />
										Verification Type
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Select
											id="verificationType"
											name="verificationType"
											onChange={(event, newValue) => {
												if (newValue == "MULTIPLE" && formik.getFieldProps("answerType").value == "MULTIPLE") {
													const newAnswerChoices = formik.values.answerChoices.map((item) => ({ ...item, correct: false }));
													formik.setFieldValue("answerChoices", newAnswerChoices);
												}
												if (newValue == "MANUAL" && formik.getFieldProps("answerType").value == "MULTIPLE") {
													const newAnswerChoices = formik.values.answerChoices.map((item) => ({ id: item.id, name: item.name }));
													formik.setFieldValue("answerChoices", newAnswerChoices);
												}
												formik.setFieldValue("verificationType", newValue);
											}}
											value={formik.values.verificationType}>
											{possibleVerificationTypes.map((item) => (
												<Option value={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</Option>
											))}
										</Select>
									</FormControl>
									<FormLabel className="flex items-center">
										<CheckIcon className="mr-1" />
										Points
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Input
											id="points"
											name="points"
											type="number"
											onChange={(event) => {
												formik.setFieldValue("points", parseInt(event.target.value));
											}}
											value={formik.values.points}
										/>
									</FormControl>
									<FormLabel className="flex items-center">
										<AssignmentTurnedInIcon className="mr-1" />
										Prerequisites
									</FormLabel>
									<FormControl sx={{ gap: 2 }}>
										<Select
											id="prerequisites"
											name="prerequisites"
											onChange={(event, newValue) => {
												const isRecursive = newValue.some((id) => {
													return tasks
														.find((t) => t.id === id)
														.prerequisites.map((item) => item)
														.includes(task.id);
												});
												if (!isRecursive) {
													formik.setFieldValue("prerequisites", newValue);
												} else {
													alert("Cannot add recursive prerequisites.");
												}
											}}
											value={formik.values.prerequisites}
											multiple>
											{tasks
												.filter((item) => item.id != task.id)
												.map((item) => (
													<Option value={item.id}>{item.title}</Option>
												))}
										</Select>
									</FormControl>
									<Button
										className="mt-2"
										disabled={!formik.isValid}
										onClick={formik.submitForm}>
										Submit
									</Button>
								</Box>
							</Box>
						</Box>
					</form>
				</div>
			</div>
		)
	);
}
