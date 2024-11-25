import { Box, Breadcrumbs, Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Link, Stack, Textarea, Typography } from "@mui/joy";
import "./OrganisationDetail.css";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TaskTable from "../../components/dash/packs/TaskTable";

export default function OrganisationDetail() {
	const [organisation, setOrganisation] = useState<any>();

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
							<Typography
								color="primary"
								sx={{ fontWeight: 500, fontSize: 12 }}>
								{organisation.name}
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
							{organisation.name}
						</Typography>
					</Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                        <Box sx={{ gridColumn: 'span 6' }}>
                        <Card sx={{ flexGrow: '1' }}>
								<Stack
									direction="row"
									spacing={1}
									sx={{ my: 1 }}>
									<Stack spacing={2} sx={{ width: '100%' }}>
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
                                                    }
                                                });
                                                setOrganisation(updatedOrganisation);
                                            }}
                                            >
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
