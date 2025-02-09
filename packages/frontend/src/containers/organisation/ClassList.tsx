import { Box, Button, Typography } from "@mui/joy";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import Breadcrumb from "../../components/dash/breadcrumb";
import ClassTable from "../../components/dash/organisations/ClassTable";
import NewClassModal from "../../components/dash/organisations/NewClassModal";
import "./ClassList.css";

export default function ClassList() {
	const [open, setOpen] = useState(false);

	return (
		<div className="Home">
			<Helmet>
				<title>Classes</title>
			</Helmet>
			<div>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Breadcrumb
						items={[
							{ label: "Dashboard", href: "/dash" },
							{ label: "Classes", href: "/dash/classes" },
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
						Classes
					</Typography>
					<Button
						color="primary"
						startDecorator={<FaPlus />}
						size="sm"
						onClick={() => setOpen(true)}>
						New class
					</Button>
				</Box>
				<ClassTable />
			</div>
			<NewClassModal
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
}
