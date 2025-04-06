import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Box, Checkbox, Dropdown, IconButton, Menu, MenuButton, MenuItem, Sheet, Table, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import { Task } from "../../../../../functions/src/types/task";

interface TaskTableProps {
	tasks: Task[];
}

export default function TaskTable({ tasks }: TaskTableProps) {
	const [selected, setSelected] = useState<readonly string[]>([]);
	const { id } = useParams();

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
							<th style={{ textAlign: "center", padding: "12px 6px" }}>
								<Checkbox
									size="sm"
									indeterminate={selected.length > 0 && selected.length !== tasks.length}
									checked={selected.length === tasks.length}
									onChange={(event) => {
										setSelected(event.target.checked ? tasks.map((row) => row.id) : []);
									}}
									color={selected.length > 0 || selected.length === tasks.length ? "primary" : undefined}
									sx={{ verticalAlign: "text-bottom" }}
								/>
							</th>
							<th style={{ padding: "12px 6px" }}>Title</th>
							<th style={{ padding: "12px 6px" }}>Points</th>
							<th style={{ padding: "12px 6px" }}> </th>
						</tr>
					</thead>
					<tbody>
						{[...tasks]
							.sort((a, b) => {
								// Sort numerically if titles are numbers, otherwise lexicographically
								const numA = parseFloat(a.title);
								const numB = parseFloat(b.title);
								if (!isNaN(numA) && !isNaN(numB)) {
									return numA - numB;
								}
								if (!isNaN(numA) || !isNaN(numB)) {
									return isNaN(numA) ? 1 : -1;
								}
								return a.title.localeCompare(b.title, undefined, { numeric: true });
							})
							.map((row) => (
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
										<Typography level="body-xs">{row.title}</Typography>
									</td>
									<td>
										<Typography level="body-xs">{row.points}</Typography>
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
													<MenuItem
														color="danger"
														onClick={async () => {
															const confirmed = window.confirm("Are you sure you want to delete this task?");
															if (!confirmed) return;
															try {
																await API.del("api", `/pack/${id}/task/${row.id}`, {});
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
