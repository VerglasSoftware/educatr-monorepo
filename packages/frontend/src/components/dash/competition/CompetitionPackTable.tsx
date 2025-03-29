import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Box, Button, Checkbox, Divider, Dropdown, IconButton, Menu, MenuButton, MenuItem, Option, Select, Sheet, Table, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { Fragment, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { Competition } from "../../../../../functions/src/types/competition";
import { Pack } from "../../../../../functions/src/types/pack";

interface CompetitionPackTableProps {
	competition: Competition;
}

export default function CompetitionPackTable({ competition }: CompetitionPackTableProps) {
	const [selected, setSelected] = useState<readonly string[]>([]);
	const [packs, setPacks] = useState<string[]>([]);
	const [availablePacks, setAvailablePacks] = useState<Pack[]>([]);
	const [selectedPack, setSelectedPack] = useState<string>("");

	const { compId } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const availablePacks = await API.get("api", `/pack`, {});
				setAvailablePacks(availablePacks);
				setPacks(competition.packs);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		<Fragment>
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
				<Select
					defaultValue={""}
					onChange={(_, val) => {
						setSelectedPack(val || "");
					}}
					sx={{ flexGrow: 1 }}>
					<Option value="">Select one</Option>
					{availablePacks
						.filter((pack) => !packs.includes(pack.id))
						.map((pack) => (
							<Option
								key={pack.id}
								value={pack.id}>
								{pack.name}
							</Option>
						))}
				</Select>
				<Button
					color="primary"
					startDecorator={<FaPlus />}
					size="sm"
					disabled={selectedPack === ""}
					onClick={async () => {
						const updatedCompetition = await API.put("api", `/competition/${compId}`, {
							body: {
								name: competition.name,
								status: competition.status || "",
								packs: [...packs, selectedPack],
							},
						});

						setPacks(updatedCompetition.packs);
					}}>
					Add
				</Button>
			</Box>

			<Sheet
				className="OrderTableContainer"
				variant="plain"
				sx={{
					display: { xs: "none", sm: "initial" },
					width: "100%",
					borderRadius: "sm",
					flexShrink: 1,
					overflow: "auto",
					minHeight: 0,
				}}>
				<Table
					aria-labelledby="tableTitle"
					stickyHeader
					hoverRow
					sx={{
						"--TableCell-headBackground": "var(--joy-palette-background-level1)",
						"--Table-headerUnderlineThickness": "1px",
						"--TableRow-hoverBackground": "var(--joy-palette-background-level1)",
						"--TableCell-paddingY": "4px",
						"--TableCell-paddingX": "8px",
					}}>
					<thead>
						<tr>
							<th style={{ width: 48, textAlign: "center", padding: "12px 6px" }}>
								<Checkbox
									size="sm"
									indeterminate={selected.length > 0 && selected.length !== packs.length}
									checked={selected.length === packs.length}
									onChange={(event) => {
										setSelected(event.target.checked ? packs.map((row) => row) : []);
									}}
									color={selected.length > 0 || selected.length === packs.length ? "primary" : undefined}
									sx={{ verticalAlign: "text-bottom" }}
								/>
							</th>
							<th style={{ width: 140, padding: "12px 6px" }}>Name</th>
							<th style={{ width: 140, padding: "12px 6px" }}>Description</th>
							<th style={{ width: 140, padding: "12px 6px" }}> </th>
						</tr>
					</thead>
					<tbody>
						{[...packs].map((row) => (
							<tr key={row}>
								<td style={{ textAlign: "center", width: 120 }}>
									<Checkbox
										size="sm"
										checked={selected.includes(row)}
										color={selected.includes(row) ? "primary" : undefined}
										onChange={(event) => {
											setSelected((ids) => (event.target.checked ? ids.concat(row) : ids.filter((itemId) => itemId !== row)));
										}}
										slotProps={{ checkbox: { sx: { textAlign: "left" } } }}
										sx={{ verticalAlign: "text-bottom" }}
									/>
								</td>
								<td>
									<Typography level="body-xs">{availablePacks.find((pack) => pack.id == row).name}</Typography>
								</td>
								<td>
									<Typography level="body-xs">{availablePacks.find((pack) => pack.id == row).description}</Typography>
								</td>
								<td>
									<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
										<Dropdown>
											<MenuButton
												slots={{ root: IconButton }}
												slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}>
												<MoreHorizRoundedIcon />
											</MenuButton>
											<Menu
												size="sm"
												sx={{ minWidth: 140 }}>
												<Divider />
												<MenuItem
													color="danger"
													onClick={async () => {
														const updatedCompetition = await API.put("api", `/competition/${compId}`, {
															body: {
																name: competition.name,
																status: competition.status || "",
																packs: packs.filter((p) => p !== row),
															},
														});

														setPacks(updatedCompetition.packs);
													}}>
													Remove
												</MenuItem>
											</Menu>
										</Dropdown>
									</Box>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Sheet>
		</Fragment>
	);
}
