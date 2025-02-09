import { Box, Button, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/dash/breadcrumb";
import PackCard from "../../components/dash/packs/PackCard";
import TaskTable from "../../components/dash/packs/TaskTable";
import "./PackDetail.css";

export default function PackDetail() {
	const [pack, setPack] = useState<any>();

	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");

	const { id } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const pack = await API.get("api", `/pack/${id}`, {});
				setPack(pack);
				setName(pack.name);
				setDescription(pack.description);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, [id]);

	return (
		pack && (
			<div className="Home">
				<Helmet>
					<title>{pack.name} - Packs</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Packs", href: "/dash/packs" },
								{ label: pack.name, href: `/dash/packs/${id}` },
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

					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
						<Box sx={{ gridColumn: "span 6" }}>
							<PackCard
								name={name}
								description={description}
								id={id!}
								pack={pack}
								setPack={setPack}
								setName={setName}
								setDescription={setDescription}
							/>
						</Box>
						<Box sx={{ gridColumn: "span 6" }}>
							<TaskTable />
							<Button
								href={`/dash/packs/${id}/edit`}
								className="mt-2">
								Edit
							</Button>
						</Box>
					</Box>
				</div>
			</div>
		)
	);
}
