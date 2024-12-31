import { Box, Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Stack, Textarea, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import "./OrganisationDetail.css";

import Breadcrumb from "../../components/dash/breadcrumb";
import OrganisationStudentTable from "../../components/dash/organisations/OrganisationStudentTable";

export default function OrganisationDetail() {
	const [organisation, setOrganisation] = useState<any>();

	const [open, setOpen] = useState(false);

	const [name, setName] = useState<any>("");
	const [logo, setLogo] = useState<any>("");

	const { id } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const organisation = await API.get("api", `/organisation/${id}`, {});
				setOrganisation(organisation);
				setName(organisation.name);
				setLogo(organisation.logo);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		organisation && (
			<div className="Home">
				<Helmet>
					<title>{organisation.name}</title>
				</Helmet>
				<div>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Breadcrumb
							items={[
								{ label: "Dashboard", href: "/dash" },
								{ label: organisation.name, href: `/dash/organisations/${id}` },
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
							{organisation.name}
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
											<FormLabel>Logo</FormLabel>
											<FormControl sx={{ gap: 2 }}>
												<Textarea
													minRows={2}
													size="sm"
													placeholder="Logo"
													value={logo}
													onChange={(e) => setLogo(e.target.value)}
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
												const updatedOrganisation = await API.put("api", `/organisation/${id}`, {
													body: {
														name,
														logo,
														students: organisation.students || [],
													},
												});
												setOrganisation(updatedOrganisation);
											}}>
											Save
										</Button>
									</CardActions>
								</CardOverflow>
							</Card>
						</Box>
						<Box sx={{ gridColumn: "span 6" }}>
							<OrganisationStudentTable organisation={organisation} />
						</Box>
					</Box>
				</div>
			</div>
		)
	);
}
