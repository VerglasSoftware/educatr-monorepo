import { Box, Breadcrumbs, Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Link, Stack, Textarea, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import "./PackDetail.css";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import TaskTable from "../../components/dash/packs/TaskTable";

export default function PackDetail() {
	const [pack, setPack] = useState<any>();

	const [name, setName] = useState<any>("");
	const [description, setDescription] = useState<any>("");

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
	}, []);

	return (
		pack && (
			<div className="Home">
				<Helmet>
					<title>{pack.name} - Packs</title>
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
								href="/"
								aria-label="Home">
								<HomeRoundedIcon />
							</Link>
							<Link
								underline="hover"
								color="neutral"
								href="/dash"
								sx={{ fontSize: 12, fontWeight: 500 }}>
								Dashboard
							</Link>
							<Link
								underline="hover"
								color="neutral"
								href="/dash/packs"
								sx={{ fontSize: 12, fontWeight: 500 }}>
								Packs
							</Link>
							<Typography
								color="primary"
								sx={{ fontWeight: 500, fontSize: 12 }}>
								{pack.name}
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
							{pack.name}
						</Typography>
					</Box>

					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 2 }}>
						<Box sx={{ gridColumn: "span 6" }}>
							<Card sx={{ flexGrow: "1" }}>
								<Stack
									direction="row"
									spacing={1}
									sx={{ my: 1 }}>
									<Stack
										spacing={2}
										sx={{ width: "100%" }}>
										<Stack spacing={1}>
											<FormLabel>Name</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Input
													size="sm"
													placeholder="Name"
													value={name}
													onChange={(e) => setName(e.target.value)}
												/>
											</FormControl>
										</Stack>
										<Stack spacing={1}>
											<FormLabel>Description</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Textarea
													minRows={2}
													size="sm"
													placeholder="Description"
													value={description}
													onChange={(e) => setDescription(e.target.value)}
												/>
											</FormControl>
										</Stack>
									</Stack>
								</Stack>
								<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
									<CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
										<Button
											size="sm"
											variant="solid"
											onClick={async () => {
												const updatedPack = await API.put("api", `/pack/${id}`, {
													body: {
														name,
														description,
														ownerId: pack.ownerId,
													},
												});
												setPack(updatedPack);
											}}>
											Save
										</Button>
									</CardActions>
								</CardOverflow>
							</Card>
						</Box>
						<Box sx={{ gridColumn: "span 6" }}>
							<TaskTable />
						</Box>
					</Box>
				</div>
			</div>
		)
	);
}
