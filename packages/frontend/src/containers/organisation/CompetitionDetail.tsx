import { Box, Breadcrumbs, Button, Card, CardActions, CardOverflow, FormControl, FormLabel, Input, Link, Stack, Textarea, Typography } from "@mui/joy";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TaskTable from "../../components/dash/packs/TaskTable";
import CompetitionPackTable from "../../components/dash/organisations/CompetitionPackTable";

export default function CompetitionDetail() {
	const [competition, setCompetition] = useState<any>();

    const [name, setName] = useState<any>("");

	const { compId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const competition = await API.get("api", `/competition/${compId}`, {});
				setCompetition(competition);
                setName(competition.name);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		competition && (
			<div className="Home">
				<Helmet>
					<title>{competition.name} - Competitions</title>
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
								href="/dash"
								sx={{ fontSize: 12, fontWeight: 500 }}>
								Competitions
							</Link>
							<Typography
								color="primary"
								sx={{ fontWeight: 500, fontSize: 12 }}>
								{competition.name}
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
							{competition.name}
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
									</Stack>
								</Stack>
								<CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
									<CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
										<Button
											size="sm"
											variant="solid"
                                            onClick={async () => {
                                                const updatedCompetition = await API.put("api", `/competition/${compId}`, {
                                                    body: {
                                                        name,
                                                        status: competition.status || '',
                                                        packs: competition.packs || [],
                                                    }
                                                });
                                                setCompetition(updatedCompetition);
                                            }}
                                            >
											Save
										</Button>
									</CardActions>
								</CardOverflow>
							</Card>
                        </Box>
                        <Box sx={{ gridColumn: 'span 6' }}>
                            <CompetitionPackTable competition={competition} />
                        </Box>
                    </Box>
				</div>
			</div>
		)
	);
}
