import { Box, Button, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import { IoTrashBin } from "react-icons/io5";
import { Pack } from "../../../../../functions/src/types/pack";
import Breadcrumb from "../../../components/dash/breadcrumb";
import NewPackModal from "../../../components/dash/packs/NewPackModal";
import PackTable from "../../../components/dash/packs/PackTable";
import "./PackList.css";

export default function PackList() {
	const [packs, setPacks] = useState<Pack[]>();
	const [selected, setSelected] = useState<readonly string[]>([]);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		async function onLoad() {
			try {
				const packs = await API.get("api", `/pack`, {});
				setPacks(packs);
			} catch (e) {
				console.log(e);
			}
		}
		onLoad();
	}, []);

	return (
		packs && (
			<div className="Home">
				<Helmet>
					<title>Packs</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Packs", href: "/dash/packs" },
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
							Packs
						</Typography>
						<Box sx={{ display: "flex", gap: 1 }}>
							<Button
								color="danger"
								size="sm"
								disabled={selected.length === 0}
								onClick={async () => {
									const confirmed = window.confirm(`Are you sure you want to delete ${selected.length} pack(s)?`);
									if (!confirmed) return;
									try {
										await Promise.all(
											selected.map(async (id) => {
												await API.del("api", `/pack/${id}`, {});
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
								New pack
							</Button>
						</Box>
					</Box>
					<PackTable
						packs={packs}
						selected={selected}
						setSelected={setSelected}
					/>
				</div>
				<NewPackModal
					open={open}
					setOpen={setOpen}
				/>
			</div>
		)
	);
}
