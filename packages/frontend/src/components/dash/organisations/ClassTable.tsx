import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Box, Checkbox, Divider, Dropdown, IconButton, Menu, MenuButton, MenuItem, Sheet, Table, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pack } from "../../../../../functions/src/types/pack";

interface ClassTableProps {
	selected: readonly string[];
	setSelected: Dispatch<SetStateAction<readonly string[]>>;
}

export default function ClassTable({ selected, setSelected }: ClassTableProps) {
	const { orgId } = useParams();
	const nav = useNavigate();

	const [packs, setPacks] = useState<Pack[]>([]);

	useEffect(() => {
		async function onLoad() {
			try {
				const packs = await API.get("api", `/organisation/${orgId}/class`, {});
				setPacks(packs);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	return (
		<Fragment>
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
										setSelected(event.target.checked ? packs.map((row) => row.id) : []);
									}}
									color={selected.length > 0 || selected.length === packs.length ? "primary" : undefined}
									sx={{ verticalAlign: "text-bottom" }}
								/>
							</th>
							<th style={{ width: 140, padding: "12px 6px" }}>Name</th>
							<th style={{ width: 140, padding: "12px 6px" }}> </th>
						</tr>
					</thead>
					<tbody>
						{[...packs].map((row) => (
							<tr key={row.id}>
								<td style={{ textAlign: "center", width: 120 }}>
									<Checkbox
										size="sm"
										checked={selected.includes(row.id)}
										color={selected.includes(row.id) ? "primary" : undefined}
										onChange={(event) => {
											setSelected((ids) => (event.target.checked ? ids.concat(row.id) : ids.filter((itemId) => itemId !== row.id)));
										}}
										slotProps={{ checkbox: { sx: { textAlign: "left" } } }}
										sx={{ verticalAlign: "text-bottom" }}
									/>
								</td>
								<td>
									<Typography level="body-xs">{row.name}</Typography>
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
												<MenuItem onClick={() => nav(`/dash/${orgId}/classes/${row.id}`)}>View</MenuItem>
												<Divider />
												<MenuItem
													color="danger"
													onClick={async () => {
														const confirmed = window.confirm("Are you sure you want to delete this class?");
														if (!confirmed) return;
														try {
															await API.del("api", `/organisation/${orgId}/class/${row.id}`, {});
														} catch (e) {
															console.log(e);
														}
													}}>
													Delete
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
