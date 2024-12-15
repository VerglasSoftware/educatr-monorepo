import { Box, Breadcrumbs, Button, Link, Typography } from "@mui/joy";
import "./CompetitionList.css";
import { Helmet } from "react-helmet";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import CompetitionTable from "../../components/dash/organisations/CompetitionTable";
import NewCompetitionModal from "../../components/dash/organisations/NewCompetitionModal";

export default function CompetitionList() {
	const [open, setOpen] = useState(false);

	return (
		<div className="Home">
			<Helmet>
				<title>Competitions</title>
			</Helmet>
			<div>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<Breadcrumbs
						size="sm"
						aria-label="breadcrumbs"
						separator={<ChevronRightRoundedIcon fontSize="small" />}
						sx={{ pl: 0 }}>
						<Link
							underline="none"
							color="neutral"
							href="#some-link"
							aria-label="Home">
							<HomeRoundedIcon />
						</Link>
						<Link
							underline="hover"
							color="neutral"
							href="#some-link"
							sx={{ fontSize: 12, fontWeight: 500 }}>
							Dashboard
						</Link>
						<Typography
							color="primary"
							sx={{ fontWeight: 500, fontSize: 12 }}>
							Competitions
						</Typography>
					</Breadcrumbs>
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
