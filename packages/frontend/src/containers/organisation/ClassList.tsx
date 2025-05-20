import { Box, Button, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import { IoTrashBin } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { Organisation } from "../../../../functions/src/types/organisation";
import Breadcrumb from "../../components/dash/breadcrumb";
import ClassTable from "../../components/dash/organisations/ClassTable";
import NewClassModal from "../../components/dash/organisations/NewClassModal";

export default function ClassList() {
	const { orgId } = useParams();

	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<readonly string[]>([]);
	const [org, setOrg] = useState<Organisation>();

	useEffect(() => {
		async function onLoad() {
			try {
				const org = await API.get("api", `/organisation/${orgId}`, {});
				setOrg(org);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		org && (
			<div className="Home">
				<Helmet>
					<title>Classes</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: org.name, href: `/dash/${orgId}` },
								{ label: "Classes", href: `/dash/${orgId}/classes` },
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
							Classes
						</Typography>
						<Box sx={{ display: "flex", gap: 1 }}>
							<Button
								color="danger"
								size="sm"
								onClick={async () => {
									const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} class(es)?`);
									if (!confirmed) return;
									try {
										await Promise.all(
											selected.map(async (id) => {
												await API.del("api", `/organisation/${orgId}/class/${id}`, {});
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
								New class
							</Button>
						</Box>
					</Box>
					<ClassTable
						selected={selected}
						setSelected={setSelected}
					/>
				</div>
				<NewClassModal
					open={open}
					setOpen={setOpen}
				/>
			</div>
		)
	);
}
