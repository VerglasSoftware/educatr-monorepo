import { Box, Button, Typography } from "@mui/joy";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import Breadcrumb from "../../components/dash/breadcrumb";
import CompetitionTable from "../../components/dash/organisations/CompetitionTable";
import NewCompetitionModal from "../../components/dash/organisations/NewCompetitionModal";
import "./CompetitionList.css";

export default function CompetitionList() {
	const [open, setOpen] = useState(false);

	return (
		<div className="Home">
			<Helmet>
				<title>Competitions</title>
			</Helmet>
			<div>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Breadcrumb
						items={[
							{ label: "Dashboard", href: "/dash" },
							{ label: "Competitions", href: "/dash/competitions" },
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
						Competitions
					</Typography>
					<Button
						color="primary"
						startDecorator={<FaPlus />}
						size="sm"
						onClick={() => setOpen(true)}>
						New competition
					</Button>
				</Box>
				<CompetitionTable />
			</div>
			<NewCompetitionModal
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
}
