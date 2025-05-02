import { html } from "@codemirror/lang-html";
import { python } from "@codemirror/lang-python";
import { Checkbox } from "@mui/joy";
import { csharp } from "@replit/codemirror-lang-csharp";
import CodeMirror from "@uiw/react-codemirror";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Pack } from "../../../../../functions/src/types/pack";
import { Task } from "../../../../../functions/src/types/task";
import Page from "../../../_design/components/layout/Page";
import { useAppContext } from "../../../lib/contextLib";
import SidebarDash from "../../../components/SidebarDash";
import Container from "../../../_design/components/layout/Container";
import Breadcrumbs from "../../../_design/components/navigation/Breadcrumbs";
import Text from "../../../_design/components/core/Text";
import Loader from "../../../_design/components/core/Loader";
import TableOfContents from "../../../_design/components/navigation/TableOfContents";
import Button from "../../../_design/components/core/Button";
import { IoAdd, IoCheckmarkCircleOutline, IoChevronBack, IoChevronForward, IoSearch, IoTrashBin } from "react-icons/io5";
import Input from "../../../_design/components/form/Input";
import Select from "../../../_design/components/form/Select";
import { vscodeLightInit } from '@uiw/codemirror-theme-vscode';

interface AnswerChoice {
	id: string;
	name: string;
	correct?: boolean;
}

export default function TaskEditor() {
	const [pack, setPack] = useState<Pack>();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [task, setTask] = useState<Task>();
	const [possibleVerificationTypes, setPossibleVerificationTypes] = useState<string[]>([]);

	const [saveLoading, setSaveLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [createTaskLoading, setCreateTaskLoading] = useState(false);

	async function createTask() {
		setCreateTaskLoading(true);
		const newtask: Task = await API.post("api", `/pack/${id}/task`, {
			body: {
				title: "New Task",
				subtitle: "",
				content: "",
				placeholder: "",
				answer: "",
				answerChoices: [],
				answerType: "TEXT",
				verificationType: "MANUAL",
				prerequisites: [],
				points: 0,
				stdin: "",
			},
		});

		setTasks([...tasks, newtask]);
		setTask(newtask);
		setCreateTaskLoading(false);
	}

	async function selectTask(id: string) {
		const selectedTask = tasks.find((task) => task.id === id);
		if (selectedTask) {
			setTask(selectedTask);
			formik.setValues({
				title: selectedTask.title,
				subtitle: selectedTask.subtitle,
				content: selectedTask.content,
				placeholder: selectedTask.placeholder,
				answer: selectedTask.answer,
				answerChoices: selectedTask.answerChoices.map((item) => ({
					id: item.id,
					name: item.name,
					correct: item.correct,
				})),
				answerType: selectedTask.answerType,
				verificationType: selectedTask.verificationType,
				prerequisites: selectedTask.prerequisites.map((item) => item),
				points: selectedTask.points,
				stdin: selectedTask.stdin,
			});
			updatePossibleVerificationTypes(selectedTask.answerType);
		}
	}

	async function deleteTask() {
		const confirmed = window.confirm("Are you sure you want to delete this task?");
		if (!confirmed) return;
		setDeleteLoading(true);
		await API.del("api", `/pack/${id}/task/${task.id}`, {});
		const index = tasks.findIndex((t) => t.id == task.id);
		const newTasks = tasks.filter((t) => t.id !== task.id);
		setTasks(newTasks);
		setTask(newTasks[index - 1]);
		updatePossibleVerificationTypes(newTasks[index - 1].answerType);
		setDeleteLoading(false);
	}

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
			setSaveLoading(true);
			const newTask: Task = await API.put("api", `/pack/${id}/task/${task.id}`, {
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
			setTasks(tasks.map((t) => (t.id === task.id ? newTask : t)));
			setTask(newTask);
			toast.success("Task saved successfully!", {
				theme: "light",
			});
			setSaveLoading(false);
			formik.resetForm({ values });
		},
	});

	const pythonPlaceholder = "#\n# Type your code beneath this line\n#";
	const csharpPlaceholder = "using System;\n\nnamespace Educatr {\n\tclass Program {\n\t\tstatic void Main(string[] args) {\n\t\t\t// Type your code beneath this line\n\t\t}\n\t}\n}";
	const htmlPlaceholder = "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<title>Page Title</title>\n\t</head>\n\t<body>\n\t\t<h1>This is a Heading</h1>\n\t\t<p>This is a paragraph.</p>\n\t</body>\n</html>";

	useEffect(() => {
		async function onLoad() {
			try {
				const pack: Pack = await API.get("api", `/pack/${id}`, {});
				const tasks: Task[] = (await API.get("api", `/pack/${id}/task`, {})).sort((a, b) => {
					// Sort numerically if titles are numbers, otherwise lexicographically
					const numA = parseFloat(a.title);
					const numB = parseFloat(b.title);
					if (!isNaN(numA) && !isNaN(numB)) {
						return numA - numB;
					}
					if (!isNaN(numA) || !isNaN(numB)) {
						return isNaN(numA) ? 1 : -1;
					}
					return a.title.localeCompare(b.title, undefined, { numeric: true });
				});
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
			formik.setValues({
				title: task.title,
				subtitle: task.subtitle,
				content: task.content,
				placeholder: task.placeholder,
				answer: task.answer,
				answerChoices: task.answerChoices.map((item) => ({
					id: item.id,
					name: item.name,
					correct: item.correct,
				})),
				answerType: task.answerType,
				verificationType: task.verificationType,
				prerequisites: task.prerequisites.map((item) => item),
				points: task.points,
				stdin: task.stdin,
			});
			updatePossibleVerificationTypes();
		}
	}, [tasks]);

	async function updatePossibleVerificationTypes(answerType = formik.values.answerType) {
		switch (answerType) {
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
				setPossibleVerificationTypes(["MULTIPLE", "MANUAL"]);
				break;
			case "TEXT":
				setPossibleVerificationTypes(["COMPARE", "MANUAL"]);
				break;
			case "MANUAL":
				setPossibleVerificationTypes(["MANUAL"]);
				break;
		}
	}

	useEffect(() => {
		if (task) {
			if (!["", pythonPlaceholder, csharpPlaceholder, htmlPlaceholder].includes(formik.getFieldProps("placeholder").value)) return;
			switch (task.answerType) {
				case "PYTHON":
					formik.setFieldValue("placeholder", pythonPlaceholder);
					break;
				case "CSHARP":
					formik.setFieldValue("placeholder", csharpPlaceholder);
					break;
				case "WEB":
					formik.setFieldValue("placeholder", htmlPlaceholder);
					break;
				default:
					formik.setFieldValue("placeholder", "");
			}
			updatePossibleVerificationTypes(task.answerType);
		}
	}, [task]);

		return (
				<Page title={`${pack && pack.name} | Task Editor`} useAuthContext={useAppContext} sidebar={<SidebarDash />}>
					<Container>
						<Breadcrumbs
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Packs", href: "/dash/packs" },
								{ label: pack && pack.name , href: `/dash/packs/${id}/edit` },
								{ label: "Editor" },
							]}
						/>
						<Text variant="title" as="h1">{pack && pack.name}</Text>
						
						{
							(!pack || !tasks) ? (
								<Loader />
							) : (
								<>
								<div className="flex flex-row mb-4 gap-2">
									<Input name="search" label="Search" icon={<IoSearch />} />
									<Button preIcon={<IoAdd />} onClick={createTask} loading={createTaskLoading}>Create task</Button>
									<Button colorScheme={"destructive"} disabled={!task} onClick={deleteTask} loading={deleteLoading}><IoTrashBin /></Button>
								</div>
								<div className="grid grid-cols-12 gap-4">
									<div className="col-span-2 flex flex-col gap-2">
										<TableOfContents
											title="Tasks"
											items={tasks.map((task) => ({
												id: task.id,
												label: task.title,
											}))}
											onItemClick={selectTask}
										/>
									</div>
									<div className="col-span-7">
										{
											task ? (
												<div>
													<div className="flex flex-row items-center justify-center">
														<Button variant="text"><IoChevronBack /></Button>
														<Text variant="h3" as="h2" noMargin className="mx-5">{task.title}</Text>
														<Button variant="text"><IoChevronForward /></Button>
													</div>
													<div className="flex flex-col gap-2 mt-4">
														<Input
															name="content"
															label="Description"
															placeholder="Write an extended description of the task here - you could explain what to do, give a link to a required program, or something else. You can use **markdown**."
															value={formik.values.content}
															onChange={formik.handleChange}
															textarea
															rows={8}
														/>
														{
															formik.getFieldProps("answerType").value == "MULTIPLE" && (
																<>
																	{
																		formik.values.answerChoices.map((item, index) => (
																			<div
																				className="flex w-full space-x-4"
																				key={item.id}>
																				<Input
																					name={`answerChoices.${index}.name`}
																					label={`Answer choice ${index + 1}`}
																					type="text"
																					onChange={formik.handleChange}
																					value={item.name}
																				/>
																				{
																					formik.getFieldProps("verificationType").value == "MULTIPLE" && (
																						<Checkbox
																							name={`answerChoices.${index}.correct`}
																							label="Correct"
																							onChange={formik.handleChange}
																							checked={item.correct}
																						/>
																					)
																				}
																			</div>
																		))
																	}
																	<Button
																		preIcon={<IoCheckmarkCircleOutline />}
																		onClick={() => {
																			const newAnswerChoices = [...formik.values.answerChoices, { id: crypto.randomUUID(), name: "", correct: false }];
																			formik.setFieldValue("answerChoices", newAnswerChoices);
																		}}>
																		Add answer choice
																	</Button>
																</>
															)
														}
														{
															formik.getFieldProps("answerType").value == "TEXT" && formik.getFieldProps("verificationType").value == "COMPARE" && (
																<>
																	<Input
																		name="answer"
																		label="Answer"
																		placeholder="Write the answer here"
																		value={formik.values.answer}
																		onChange={formik.handleChange}
																	/>
																</>
															)
														}
														{
															["PYTHON", "CSHARP"].includes(formik.getFieldProps("answerType").value) && (
																<>
																	<Text variant="h5" as="p" noMargin>Placeholder</Text>
																	<CodeMirror
																		value={formik.values.placeholder}
																		height="250px"
																		extensions={formik.getFieldProps("answerType").value == "PYTHON" ? [vscodeLightInit(), python()] : [vscodeLightInit(), csharp()]}
																		onChange={(value) => formik.setFieldValue("placeholder", value)}
																	/>
																	{
																		formik.getFieldProps("verificationType").value == "ALGORITHM" && (
																			<>
																				<Text variant="h5" as="p" noMargin>Answer <code>stdin</code> / <code>stdout</code></Text>
																				<CodeMirror
																					value={formik.values.stdin}
																					height="50px"
																					extensions={[vscodeLightInit()]}
																					onChange={(value) => formik.setFieldValue("stdin", value)}
																					placeholder="stdin (to test)"
																				/>
																				<CodeMirror
																					value={formik.values.answer}
																					height="50px"
																					extensions={[vscodeLightInit()]}
																					onChange={(value) => formik.setFieldValue("answer", value)}
																					placeholder="expected stdout, given the above stdin"
																				/>
																			</>
																		)
																	}
																</>
															)
														}
														{
															formik.getFieldProps("answerType").value == "WEB" && (
																<>
																	<Text variant="h5" as="p" noMargin>Placeholder</Text>
																	<CodeMirror
																		value={formik.values.placeholder}
																		height="250px"
																		extensions={[vscodeLightInit(), html()]}
																		onChange={(value) => formik.setFieldValue("placeholder", value)}
																	/>
																</>
															)
														}
													</div>
												</div>
											) : (
												<div className="flex-1 flex flex-col items-center justify-center">
													<Text variant="h3" as="p" noMarginBottom>No task selected</Text>
													<Text variant="intro" noMargin>Select a task from the sidebar to get started.</Text>
												</div>
											)
										}
									</div>
									<div className="col-span-3">
										<aside
											  className={'min-w-max px-4 py-4 border-r border-primary/80 h-full sticky top-0'}
											>
												<Text variant="h4" noMargin className="text-end">Settings</Text>
												<form className="flex flex-col gap-4 mt-1" onSubmit={formik.handleSubmit}>
													<Input name="title" label="Title" placeholder="" value={formik.values.title} onChange={formik.handleChange} disabled={!task} />
													<Input name="points" label="Points" placeholder="" value={formik.values.points.toString()} onChange={formik.handleChange} type="number" disabled={!task} />
													<Select name="answerType" label="Answer Type" placeholder="" value={formik.values.answerType} onChange={async (e) => {
														await formik.setFieldValue("answerType", e);
														updatePossibleVerificationTypes(e);
													}}
														options={[
															{ value: "TEXT", label: "Text" },
															{ value: "PYTHON", label: "Python" },
															{ value: "CSHARP", label: "C#" },
															{ value: "WEB", label: "Web" },
															{ value: "MULTIPLE", label: "Multiple Choice" },
															{ value: "MANUAL", label: "None" },
														]}
														disabled={!task}
													/>
													<Select name="verificationType" label="Verification Type" placeholder="" value={formik.values.verificationType} onChange={(e) => formik.setFieldValue("verificationType", e)}
														options={possibleVerificationTypes.map((item) => ({
															value: item,
															label: item.charAt(0) + item.slice(1).toLowerCase(),
														}))}
														disabled={!task}
													/>
													<Button fluid colorScheme="success" onClick={formik.submitForm} loading={saveLoading} disabled={!task}>Save</Button>
												</form>
											</aside>
									</div>
								</div>
								</>
							)
						}
					</Container>
				</Page>
		);

	// 				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
	// 					{/* Left Spacer to keep arrows in the center */}
	// 					<Box sx={{ width: "100px" }} />

	// 					{/* Centered Navigation */}
	// 					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
	// 						<Button
	// 							variant="plain"
	// 							disabled={tasks[0].id == task.id}
	// 							onClick={() => {
	// 								const index = tasks.findIndex((t) => t.id == task.id);
	// 								setTask(tasks[index - 1]);
	// 								switch (tasks[index - 1].answerType) {
	// 									case "PYTHON":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "CSHARP":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "WEB":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 									case "MULTIPLE":
	// 										setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
	// 										break;
	// 									case "TEXT":
	// 										setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
	// 										break;
	// 									case "MANUAL":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 								}
	// 								formik.setValues({
	// 									title: tasks[index - 1].title,
	// 									subtitle: tasks[index - 1].subtitle,
	// 									content: tasks[index - 1].content,
	// 									placeholder: tasks[index - 1].placeholder,
	// 									answer: tasks[index - 1].answer,
	// 									answerChoices: tasks[index - 1].answerChoices.map((item) => ({
	// 										id: item.id,
	// 										name: item.name,
	// 										correct: item.correct,
	// 									})),
	// 									answerType: tasks[index - 1].answerType,
	// 									verificationType: tasks[index - 1].verificationType,
	// 									prerequisites: tasks[index - 1].prerequisites.map((item) => item),
	// 									points: tasks[index - 1].points,
	// 									stdin: tasks[index - 1].stdin,
	// 								});
	// 							}}>
	// 							<ArrowBack />
	// 						</Button>

	// 						<Typography
	// 							level="h3"
	// 							component="h2"
	// 							sx={{ my: 0 }}>
	// 							{task.title}
	// 						</Typography>

	// 						<Button
	// 							variant="plain"
	// 							disabled={tasks[tasks.length - 1].id == task.id}
	// 							onClick={() => {
	// 								const index = tasks.findIndex((t) => t.id == task.id);
	// 								setTask(tasks[index + 1]);
	// 								switch (tasks[index + 1].answerType) {
	// 									case "PYTHON":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "CSHARP":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "WEB":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 									case "MULTIPLE":
	// 										setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
	// 										break;
	// 									case "TEXT":
	// 										setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
	// 										break;
	// 									case "MANUAL":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 								}
	// 								formik.setValues({
	// 									title: tasks[index + 1].title,
	// 									subtitle: tasks[index + 1].subtitle,
	// 									content: tasks[index + 1].content,
	// 									placeholder: tasks[index + 1].placeholder,
	// 									answer: tasks[index + 1].answer,
	// 									answerChoices: tasks[index + 1].answerChoices.map((item) => ({
	// 										id: item.id,
	// 										name: item.name,
	// 										correct: item.correct,
	// 									})),
	// 									answerType: tasks[index + 1].answerType,
	// 									verificationType: tasks[index + 1].verificationType,
	// 									prerequisites: tasks[index + 1].prerequisites.map((item) => item),
	// 									points: tasks[index + 1].points,
	// 									stdin: tasks[index + 1].stdin,
	// 								});
	// 							}}>
	// 							<ArrowForward />
	// 						</Button>
	// 					</Box>

	// 					{/* Right-aligned Buttons */}
	// 					<Box sx={{ display: "flex", gap: 1 }}>
	// 						<Button
	// 							variant="plain"
	// 							color="danger"
	// 							onClick={() => {
	// 								const confirmed = window.confirm("Are you sure you want to delete this task?");
	// 								if (!confirmed) return;
	// 								API.del("api", `/pack/${id}/task/${task.id}`, {});
	// 								const index = tasks.findIndex((t) => t.id == task.id);
	// 								const newTasks = tasks.filter((t) => t.id !== task.id);
	// 								setTasks(newTasks);
	// 								setTask(newTasks[index - 1]);
	// 								switch (tasks[index - 1].answerType) {
	// 									case "PYTHON":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "CSHARP":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "WEB":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 									case "MULTIPLE":
	// 										setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
	// 										break;
	// 									case "TEXT":
	// 										setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
	// 										break;
	// 									case "MANUAL":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 								}
	// 								formik.setValues({
	// 									title: tasks[index - 1].title,
	// 									subtitle: tasks[index - 1].subtitle,
	// 									content: tasks[index - 1].content,
	// 									placeholder: tasks[index - 1].placeholder,
	// 									answer: tasks[index - 1].answer,
	// 									answerChoices: tasks[index - 1].answerChoices.map((item) => ({
	// 										id: item.id,
	// 										name: item.name,
	// 										correct: item.correct,
	// 									})),
	// 									answerType: tasks[index - 1].answerType,
	// 									verificationType: tasks[index - 1].verificationType,
	// 									prerequisites: tasks[index - 1].prerequisites.map((item) => item),
	// 									points: tasks[index - 1].points,
	// 									stdin: tasks[index - 1].stdin,
	// 								});
	// 							}}>
	// 							<Delete />
	// 						</Button>
	// 						<Button
	// 							variant="plain"
	// 							color="success"
	// 							onClick={async () => {
	// 								const newtask: Task = await API.post("api", `/pack/${id}/task`, {
	// 									body: {
	// 										title: "New Task",
	// 										subtitle: "",
	// 										content: "",
	// 										placeholder: "",
	// 										answer: "",
	// 										answerChoices: [],
	// 										answerType: "TEXT",
	// 										verificationType: "MANUAL",
	// 										prerequisites: [],
	// 										points: 0,
	// 										stdin: "",
	// 									},
	// 								});

	// 								setTasks([...tasks, newtask]);
	// 								setTask(newtask);
	// 								switch (newtask.answerType) {
	// 									case "PYTHON":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "CSHARP":
	// 										setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 										break;
	// 									case "WEB":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 									case "MULTIPLE":
	// 										setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
	// 										break;
	// 									case "TEXT":
	// 										setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
	// 										break;
	// 									case "MANUAL":
	// 										setPossibleVerificationTypes(["MANUAL"]);
	// 										break;
	// 								}
	// 								formik.setValues({
	// 									title: newtask.title,
	// 									subtitle: newtask.subtitle,
	// 									content: newtask.content,
	// 									placeholder: newtask.placeholder,
	// 									answer: newtask.answer,
	// 									answerChoices: newtask.answerChoices.map((item) => ({
	// 										id: item.id,
	// 										name: item.name,
	// 										correct: item.correct,
	// 									})),
	// 									answerType: newtask.answerType,
	// 									verificationType: newtask.verificationType,
	// 									prerequisites: newtask.prerequisites.map((item) => item),
	// 									points: newtask.points,
	// 									stdin: newtask.stdin,
	// 								});
	// 							}}>
	// 							<Add />
	// 						</Button>
	// 					</Box>
	// 				</Box>
	// 				<form onSubmit={formik.handleSubmit}>
	// 					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
	// 						<Box sx={{ gridColumn: "span 3" }}>
	// 							<Box sx={{ display: "flex", flexDirection: "column", gap: 2, overflow: "auto", height: "calc(100vh - 14rem)" }}>
	// 								<FormLabel className="flex items-center">
	// 									<AssignmentTurnedIn className="mr-1" />
	// 									Title
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Input
	// 										id="title"
	// 										name="title"
	// 										type="text"
	// 										onChange={formik.handleChange}
	// 										value={formik.values.title}
	// 									/>
	// 								</FormControl>
	// 								<FormLabel className="flex items-center">
	// 									<Help className="mr-1" />
	// 									Description
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Textarea
	// 										id="subtitle"
	// 										name="subtitle"
	// 										minRows={2}
	// 										onChange={formik.handleChange}
	// 										value={formik.values.subtitle}
	// 									/>
	// 								</FormControl>
	// 								<FormLabel className="flex items-center">
	// 									<Edit className="mr-1" />
	// 									Content
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Textarea
	// 										id="content"
	// 										name="content"
	// 										minRows={2}
	// 										onChange={formik.handleChange}
	// 										value={formik.values.content}
	// 									/>
	// 								</FormControl>
	// 								{formik.getFieldProps("verificationType").value == "MULTIPLE" && formik.getFieldProps("answerType").value == "MULTIPLE" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<AssignmentTurnedIn className="mr-1" />
	// 											Answer choices
	// 										</FormLabel>
	// 										{formik.values.answerChoices.map((item, index) => (
	// 											<div
	// 												className="mt-2 flex w-full space-x-4"
	// 												key={item.id}>
	// 												<FormControl sx={{ flex: 1 }}>
	// 													<FormLabel>Option {index + 1}</FormLabel>
	// 													<Input
	// 														id={`answerChoices.${index}.name`}
	// 														name={`answerChoices.${index}.name`}
	// 														type="text"
	// 														onChange={formik.handleChange}
	// 														value={item.name}
	// 													/>
	// 												</FormControl>
	// 												<FormControl>
	// 													<FormLabel>Correct</FormLabel>
	// 													<Checkbox
	// 														id={`answerChoices.${index}.correct`}
	// 														name={`answerChoices.${index}.correct`}
	// 														onChange={formik.handleChange}
	// 														checked={item.correct}
	// 													/>
	// 												</FormControl>
	// 												<Button
	// 													type="button"
	// 													variant="plain"
	// 													onClick={() => {
	// 														const newAnswerChoices = formik.values.answerChoices.filter((_, i) => i !== index);
	// 														formik.setFieldValue("answerChoices", newAnswerChoices);
	// 													}}>
	// 													Remove
	// 												</Button>
	// 											</div>
	// 										))}
	// 										<Button
	// 											type="button"
	// 											onClick={() => {
	// 												const newAnswerChoices = [...formik.values.answerChoices, { id: crypto.randomUUID(), name: "", correct: false }];
	// 												formik.setFieldValue("answerChoices", newAnswerChoices);
	// 											}}>
	// 											Add
	// 										</Button>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "MULTIPLE" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<AssignmentTurnedIn className="mr-1" />
	// 											Answer choices
	// 										</FormLabel>
	// 										{formik.values.answerChoices.map((item, index) => (
	// 											<div
	// 												className="mt-2 flex w-full space-x-4"
	// 												key={item.id}>
	// 												<FormControl sx={{ flex: 1 }}>
	// 													<FormLabel>Option {index + 1}</FormLabel>
	// 													<Input
	// 														id={`answerChoices.${index}.name`}
	// 														name={`answerChoices.${index}.name`}
	// 														type="text"
	// 														onChange={formik.handleChange}
	// 														value={item.name}
	// 													/>
	// 												</FormControl>
	// 												<Button
	// 													type="button"
	// 													variant="plain"
	// 													onClick={() => {
	// 														const newAnswerChoices = formik.values.answerChoices.filter((_, i) => i !== index);
	// 														formik.setFieldValue("answerChoices", newAnswerChoices);
	// 													}}>
	// 													Remove
	// 												</Button>
	// 											</div>
	// 										))}
	// 										<Button
	// 											type="button"
	// 											onClick={() => {
	// 												const newAnswerChoices = [...formik.values.answerChoices, { id: crypto.randomUUID(), name: "" }];
	// 												formik.setFieldValue("answerChoices", newAnswerChoices);
	// 											}}>
	// 											Add
	// 										</Button>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "COMPARE" && formik.getFieldProps("answerType").value == "TEXT" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<Check className="mr-1" />
	// 											Answer
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<Input
	// 												id="answer"
	// 												name="answer"
	// 												type="text"
	// 												onChange={formik.handleChange}
	// 												value={formik.values.answer}
	// 											/>
	// 										</FormControl>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "ALGORITHM" && formik.getFieldProps("answerType").value == "PYTHON" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<Code className="mr-1" />
	// 											Placeholder
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<CodeMirror
	// 												id="placeholder"
	// 												height="50vh"
	// 												extensions={[python()]}
	// 												value={formik.values.placeholder}
	// 												onChange={(newValue) => {
	// 													formik.setFieldValue("placeholder", newValue);
	// 												}}
	// 											/>
	// 										</FormControl>
	// 										<FormLabel className="flex items-center">
	// 											<Check className="mr-1" />
	// 											Stdout value
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<Input
	// 												id="answer"
	// 												name="answer"
	// 												type="text"
	// 												onChange={formik.handleChange}
	// 												value={formik.values.answer}
	// 											/>
	// 										</FormControl>
	// 										<FormLabel className="flex items-center">
	// 											<InputIcon className="mr-1" />
	// 											Stdin value
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<Input
	// 												id="stdin"
	// 												name="stdin"
	// 												type="text"
	// 												onChange={formik.handleChange}
	// 												value={formik.values.stdin}
	// 											/>
	// 										</FormControl>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "PYTHON" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<Code className="mr-1" />
	// 											Placeholder
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<CodeMirror
	// 												id="placeholder"
	// 												height="50vh"
	// 												extensions={[python()]}
	// 												value={formik.values.placeholder}
	// 												onChange={(newValue) => {
	// 													formik.setFieldValue("placeholder", newValue);
	// 												}}
	// 											/>
	// 										</FormControl>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "ALGORITHM" && formik.getFieldProps("answerType").value == "CSHARP" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<Code className="mr-1" />
	// 											Placeholder
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<CodeMirror
	// 												id="placeholder"
	// 												height="50vh"
	// 												extensions={[csharp()]}
	// 												value={formik.values.placeholder}
	// 												onChange={(newValue) => {
	// 													formik.setFieldValue("placeholder", newValue);
	// 												}}
	// 											/>
	// 										</FormControl>
	// 										<FormLabel className="flex items-center">
	// 											<Check className="mr-1" />
	// 											Stdout value
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<Input
	// 												id="answer"
	// 												name="answer"
	// 												type="text"
	// 												onChange={formik.handleChange}
	// 												value={formik.values.answer}
	// 											/>
	// 										</FormControl>
	// 										<FormLabel className="flex items-center">
	// 											<InputIcon className="mr-1" />
	// 											Stdin value
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<Input
	// 												id="stdin"
	// 												name="stdin"
	// 												type="text"
	// 												onChange={formik.handleChange}
	// 												value={formik.values.stdin}
	// 											/>
	// 										</FormControl>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "CSHARP" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<Code className="mr-1" />
	// 											Placeholder
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<CodeMirror
	// 												id="placeholder"
	// 												height="50vh"
	// 												extensions={[csharp()]}
	// 												value={formik.values.placeholder}
	// 												onChange={formik.handleChange}
	// 											/>
	// 										</FormControl>
	// 									</>
	// 								)}
	// 								{formik.getFieldProps("verificationType").value == "MANUAL" && formik.getFieldProps("answerType").value == "WEB" && (
	// 									<>
	// 										<FormLabel className="flex items-center">
	// 											<Code className="mr-1" />
	// 											Placeholder
	// 										</FormLabel>
	// 										<FormControl sx={{ gap: 2 }}>
	// 											<CodeMirror
	// 												id="placeholder"
	// 												height="50vh"
	// 												extensions={[html()]}
	// 												value={formik.values.placeholder}
	// 												onChange={formik.handleChange}
	// 											/>
	// 										</FormControl>
	// 									</>
	// 								)}
	// 							</Box>
	// 						</Box>
	// 						<Box sx={{ gridColumn: "span 1" }}>
	// 							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
	// 								<FormLabel className="flex items-center">
	// 									<DataObject className="mr-1" />
	// 									Answer Type
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Select
	// 										id="answerType"
	// 										name="answerType"
	// 										onChange={(event, newValue) => {
	// 											formik.setFieldValue("answer", "");
	// 											formik.setFieldValue("answerChoices", []);
	// 											switch (newValue) {
	// 												case "PYTHON":
	// 													formik.setFieldValue("placeholder", pythonPlaceholder);
	// 													setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 													break;
	// 												case "CSHARP":
	// 													formik.setFieldValue("placeholder", csharpPlaceholder);
	// 													setPossibleVerificationTypes(["ALGORITHM", "MANUAL"]);
	// 													break;
	// 												case "WEB":
	// 													formik.setFieldValue("placeholder", htmlPlaceholder);
	// 													setPossibleVerificationTypes(["MANUAL"]);
	// 													break;
	// 												case "MULTIPLE":
	// 													formik.setFieldValue("placeholder", "");
	// 													setPossibleVerificationTypes(["MANUAL", "MULTIPLE"]);
	// 													break;
	// 												case "TEXT":
	// 													formik.setFieldValue("placeholder", "");
	// 													setPossibleVerificationTypes(["MANUAL", "COMPARE"]);
	// 													break;
	// 												case "MANUAL":
	// 													formik.setFieldValue("placeholder", "");
	// 													setPossibleVerificationTypes(["MANUAL"]);
	// 													break;
	// 											}
	// 											formik.setFieldValue("answerType", newValue);
	// 										}}
	// 										value={formik.values.answerType}>
	// 										<Option value="MANUAL">Manual</Option>
	// 										<Option value="TEXT">Text</Option>
	// 										<Option value="MULTIPLE">Multiple Choice</Option>
	// 										<Option value="PYTHON">Python</Option>
	// 										<Option value="CSHARP">C#</Option>
	// 										<Option value="WEB">Web</Option>
	// 									</Select>
	// 								</FormControl>
	// 								<FormLabel className="flex items-center">
	// 									<Check className="mr-1" />
	// 									Verification Type
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Select
	// 										id="verificationType"
	// 										name="verificationType"
	// 										onChange={(event, newValue) => {
	// 											if (newValue == "MULTIPLE" && formik.getFieldProps("answerType").value == "MULTIPLE") {
	// 												const newAnswerChoices = formik.values.answerChoices.map((item) => ({ ...item, correct: false }));
	// 												formik.setFieldValue("answerChoices", newAnswerChoices);
	// 											}
	// 											if (newValue == "MANUAL" && formik.getFieldProps("answerType").value == "MULTIPLE") {
	// 												const newAnswerChoices = formik.values.answerChoices.map((item) => ({ id: item.id, name: item.name }));
	// 												formik.setFieldValue("answerChoices", newAnswerChoices);
	// 											}
	// 											formik.setFieldValue("verificationType", newValue);
	// 										}}
	// 										value={formik.values.verificationType}>
	// 										{possibleVerificationTypes.map((item) => (
	// 											<Option value={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</Option>
	// 										))}
	// 									</Select>
	// 								</FormControl>
	// 								<FormLabel className="flex items-center">
	// 									<Check className="mr-1" />
	// 									Points
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Input
	// 										id="points"
	// 										name="points"
	// 										type="number"
	// 										onChange={(event) => {
	// 											formik.setFieldValue("points", parseInt(event.target.value));
	// 										}}
	// 										value={formik.values.points}
	// 									/>
	// 								</FormControl>
	// 								<FormLabel className="flex items-center">
	// 									<AssignmentTurnedIn className="mr-1" />
	// 									Prerequisites
	// 								</FormLabel>
	// 								<FormControl sx={{ gap: 2 }}>
	// 									<Select
	// 										id="prerequisites"
	// 										name="prerequisites"
	// 										onChange={(event, newValue) => {
	// 											const isRecursive = newValue.some((id) => {
	// 												return tasks
	// 													.find((t) => t.id === id)
	// 													.prerequisites.map((item) => item)
	// 													.includes(task.id);
	// 											});
	// 											if (!isRecursive) {
	// 												formik.setFieldValue("prerequisites", newValue);
	// 											} else {
	// 												alert("Cannot add recursive prerequisites.");
	// 											}
	// 										}}
	// 										value={formik.values.prerequisites}
	// 										multiple>
	// 										{tasks
	// 											.filter((item) => item.id != task.id)
	// 											.map((item) => (
	// 												<Option value={item.id}>{item.title}</Option>
	// 											))}
	// 									</Select>
	// 								</FormControl>
	// 								<Button
	// 									className="mt-2"
	// 									disabled={!formik.isValid}
	// 									onClick={formik.submitForm}>
	// 									Submit
	// 								</Button>
	// 							</Box>
	// 						</Box>
	// 					</Box>
	// 				</form>
	// 			</div>
	// 		</div>
	// 	)
	// );
}
