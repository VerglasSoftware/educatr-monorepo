import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Box, Button, Checkbox, Divider, Dropdown, IconButton, Menu, MenuButton, MenuItem, Sheet, Table, Typography } from "@mui/joy";
import { API } from "aws-amplify";
import { Fragment, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { Organisation } from "../../../../../functions/src/types/organisation";
import { User } from "../../../../../functions/src/types/user";
import NewUserModal from "./NewUserModal";

interface OrganisationStudentTableProps {
	organisation: Organisation;
}

export default function OrganisationStudentTable({ organisation }: OrganisationStudentTableProps) {
	const [selected, setSelected] = useState<readonly string[]>([]);
	const [students, setStudents] = useState<User[]>([]);

	const [open, setOpen] = useState(false);

	const { id } = useParams();

	useEffect(() => {
		async function onLoad() {
			try {
				const students = await API.get("api", `/organisation/${id}/students`, {});
				setStudents(students);
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
				<Button
					color="primary"
					startDecorator={<FaPlus />}
					size="sm"
					onClick={async () => {
						setOpen(true);
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
									indeterminate={selected.length > 0 && selected.length !== students.length}
									checked={selected.length === students.length}
									onChange={(event) => {
										setSelected(event.target.checked ? students.map((row) => row.id) : []);
									}}
									color={selected.length > 0 || selected.length === students.length ? "primary" : undefined}
									sx={{ verticalAlign: "text-bottom" }}
								/>
							</th>
							<th style={{ width: 140, padding: "12px 6px" }}>Name</th>
							<th style={{ width: 140, padding: "12px 6px" }}>Description</th>
							<th style={{ width: 140, padding: "12px 6px" }}> </th>
						</tr>
					</thead>
					<tbody>
						{[...students].map((row) => (
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
									<Typography level="body-xs">
										{row.given_name} {row.family_name}
									</Typography>
								</td>
								<td>
									<Typography level="body-xs">{row.nickname}</Typography>
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
														await API.put("api", `/organisation/${organisation.id}`, {
															body: {
																...organisation,
																students: organisation.students.filter((studentId: string) => studentId !== row.id),
															},
														});
														const students = await API.get("api", `/organisation/${organisation.id}/students`, {});
														setStudents(students);
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
			<NewUserModal
				open={open}
				setOpen={setOpen}
				organisation={organisation}
			/>
		</Fragment>
	);
}
