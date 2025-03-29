import { Box, Button, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import { IoTrashBin } from "react-icons/io5";
import { Competition } from "../../../../../functions/src/types/competition";
import Breadcrumb from "../../../components/dash/breadcrumb";
import CompetitionTable from "../../../components/dash/competition/CompetitionTable";
import NewCompetitionModal from "../../../components/dash/competition/NewCompetitionModal";
import "./CompetitionList.css";

export default function CompetitionList() {
	const [competitions, setCompetitions] = useState<Competition[]>();
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<readonly string[]>([]);

	useEffect(() => {
		async function onLoad() {
			try {
				const competition = await API.get("api", `/competition`, {});
				setCompetitions(competition);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

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
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}>
					<Typography
						level="h2"
						component="h1">
						Competitions
					</Typography>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Button
							color="danger"
							size="sm"
							onClick={async () => {
								const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} pack(s)?`);
								if (!confirmed) return;
								try {
									await Promise.all(
										selected.map(async (id) => {
											await API.del("api", `/competition/${id}`, {});
										})
									);
								} catch (e) {
									console.log(e);
								}
							}}>
							<IoTrashBin />
						</Button>
						<Button
							color="primary"
							startDecorator={<FaPlus />}
							size="sm"
							onClick={() => setOpen(true)}>
							New competition
						</Button>
					</Box>
				</Box>
				<CompetitionTable
					selected={selected}
					setSelected={setSelected}
					competitions={competitions}
				/>
			</div>
			<NewCompetitionModal
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
}
