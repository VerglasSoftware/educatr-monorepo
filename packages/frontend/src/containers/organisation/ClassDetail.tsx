import { Box, Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/dash/breadcrumb";
import "./ClassDetail.css";

export default function ClassDetail() {
	const [clazz, setClass] = useState<any>();

	const [name, setName] = useState<any>("");

	const { orgId, classId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const clazz = await API.get("api", `/organisation/${orgId}/class/${classId}`, {});
				setClass(clazz);
				setName(clazz.name);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		clazz && (
			<div className="Home">
				<Helmet>
					<title>{clazz.name} - Classes</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: "Classes", href: "/dash/classes" },
								{ label: clazz.name, href: `/dash/classes/${classId}` },
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
							{clazz.name}
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
									</Stack>
								</Stack>
								<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
									<CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
										<Button
											size="sm"
											variant="solid"
											onClick={async () => {
												const updatedClass = await API.put("api", `/organisation/${orgId}/class/${classId}`, {
													body: {
														name,
														students: clazz.students || [],
													},
												});
												setClass(updatedClass);
											}}>
											Save
										</Button>
									</CardActions>
								</CardOverflow>
							</Card>
						</Box>
					</Box>
				</div>
			</div>
		)
	);
}
