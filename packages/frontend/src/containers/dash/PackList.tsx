import { Box, Button, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { FaPlus } from "react-icons/fa6";
import Breadcrumb from "../../components/dash/breadcrumb";
import NewPackModal from "../../components/dash/packs/NewPackModal";
import PackTable from "../../components/dash/packs/PackTable";
import "./PackList.css";

export default function PackList() {
	const [packs, setPacks] = useState<any[]>();

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
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "start", sm: "center" },
							flexWrap: "wrap",
							justifyContent: "space-between",
						}}>
						<Typography
							level="h2"
							component="h1">
							Packs
						</Typography>
						<Button
							color="primary"
							startDecorator={<FaPlus />}
							size="sm"
							onClick={() => setOpen(true)}>
							New pack
						</Button>
					</Box>
					<PackTable packs={packs} />
				</div>
				<NewPackModal
					open={open}
					setOpen={setOpen}
				/>
			</div>
		)
	);
}
