import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckIcon from "@mui/icons-material/Check";
import DataObjectIcon from "@mui/icons-material/DataObject";
import EditIcon from "@mui/icons-material/Edit";
import HelpIcon from "@mui/icons-material/Help";
import { Box, Button, FormControl, FormLabel, Input, Option, Select, Textarea, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/dash/breadcrumb";
import "./TaskEditor.css";

export default function TaskEditor() {
	const [pack, setPack] = useState<any>();
	const [tasks, setTasks] = useState<any[]>([]);
	const [task, setTask] = useState<any>();

	const { id } = useParams();
	const formik = useFormik({
		initialValues: {
			title: "",
			subtitle: "",
			content: "",
			answerType: "",
			verificationType: "",
			points: 0,
		},
		onSubmit: (values) => {
			alert(JSON.stringify(values, null, 2));
		},
	});

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
			formik.setValues({
				title: task.title.S,
				subtitle: task.subtitle.S,
				content: task.content.S,
				answerType: task.answerType.S,
				verificationType: task.verificationType.S,
				points: task.points.N,
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
							disabled={tasks[0].id.S == task.id.S}
							onClick={() => {
								const index = tasks.findIndex((t) => t.id.S == task.id.S);
								setTask(tasks[index - 1]);
							}}>
							<ArrowBackIcon />
						</Button>
						<Typography
							level="h3"
							component="h2"
							sx={{ my: 0 }}>
							{tasks[0].title.S}
						</Typography>
						<Button
							variant="plain"
							disabled={tasks[tasks.length - 1].id.S == task.id.S}
							onClick={() => {
								const index = tasks.findIndex((t) => t.id.S == task.id.S);
								setTask(tasks[index + 1]);
							}}>
							<ArrowForwardIcon />
						</Button>
					</Box>
					{/* 4 columns */}
					<form onSubmit={formik.handleSubmit}>
						<Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
							{/* 3 columns */}
							<Box sx={{ gridColumn: "span 3" }}>
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
								{task.verificationType.S == "MULTIPLE" && task.answerType.S == "MULTIPLE" && (
									// TODO: Add multiple choice editor with correct answers
									<></>
								)}
								{task.verificationType.S == "MANUAL" && task.answerType.S == "MULTIPLE" && (
									// TODO: Add multiple choice editor without correct answers
									<></>
								)}
								{task.verificationType.S == "COMPARE" && task.answerType.S == "TEXT" && (
									// TODO: Add answer field
									<></>
								)}
								{task.verificationType.S == "ALGORITHM" && task.answerType.S == "PYTHON" && (
									// TODO: add python placeholder field
									// TODO: output answer field
									<></>
								)}
								{task.verificationType.S == "MANUAL" && task.answerType.S == "PYTHON" && (
									// TODO: Add python placeholder field
									<></>
								)}
								{task.verificationType.S == "ALGORITHM" && task.answerType.S == "CSHARP" && (
									// TODO: add csharp placeholder field
									// TODO: output answer field
									<></>
								)}
								{task.verificationType.S == "MANUAL" && task.answerType.S == "CSHARP" && (
									// TODO: Add csharp placeholder field
									<></>
								)}
								{task.verificationType.S == "MANUAL" && task.answerType.S == "WEB" && (
									// TODO: Add web placeholder field
									<></>
								)}
							</Box>
							{/* one column */}
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
											onChange={(event, newValue) => formik.setFieldValue("answerType", newValue)}
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
											onChange={(event, newValue) => formik.setFieldValue("verificationType", newValue)}
											value={formik.values.verificationType}>
											<Option value="MANUAL">Manual</Option>
											<Option value="COMPARE">Compare</Option>
											<Option value="MULTIPLE">Multiple Choice</Option>
											<Option value="ALGORITHM">Algorithm</Option>
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
											onChange={formik.handleChange}
											value={formik.values.points}
										/>
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
// verification types for answertype
// - multiple choice
//  - multiple
//  - manual
// - text
//  - compare
//  - manual
// - python
//  - algorithm
//  - manual
// - csharp
//  - algorithm
//  - manual
// - web
//  - manual
