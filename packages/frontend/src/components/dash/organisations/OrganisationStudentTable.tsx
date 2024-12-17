import * as React from "react";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Checkbox from "@mui/joy/Checkbox";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Dropdown from "@mui/joy/Dropdown";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import { Button, Option, Select } from "@mui/joy";
import { FaPlus } from "react-icons/fa6";
import NewUserModal from "./NewUserModal";

function RowMenu({ student, organisation, setStudents }: { student: any, organisation: any, setStudents: any }) {
	return (
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
						const updatedOrganisation = await API.put("api", `/organisation/${organisation.PK.split('#')[1]}`, {
							body: {
								...organisation,
								students: organisation.students.filter((studentId: string) => studentId !== student.PK),
							},
						});

						const students = await API.get("api", `/organisation/${organisation.PK.split('#')[1]}/students`, {});
						setStudents(students);
					}}>
					Remove
				</MenuItem>
			</Menu>
		</Dropdown>
	);
}

export default function OrganisationStudentTable({ organisation }: { organisation: any }) {
	const [selected, setSelected] = React.useState<readonly string[]>([]);
	const [students, setStudents] = React.useState<any[]>([]);

	const [open, setOpen] = React.useState(false);

	const { id } = useParams();

	React.useEffect(() => {
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
		<React.Fragment>
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
							<tr key={row.PK}>
								<td style={{ textAlign: "center", width: 120 }}>
									<Checkbox
										size="sm"
										checked={selected.includes(row.PK)}
										color={selected.includes(row.PK) ? "primary" : undefined}
										onChange={(event) => {
											setSelected((ids) => (event.target.checked ? ids.concat(row.PK) : ids.filter((itemId) => itemId !== row.PK)));
										}}
										slotProps={{ checkbox: { sx: { textAlign: "left" } } }}
										sx={{ verticalAlign: "text-bottom" }}
									/>
								</td>
								<td>
									<Typography level="body-xs">{row.given_name} {row.family_name}</Typography>
								</td>
								<td>
									<Typography level="body-xs">{row.username}</Typography>
								</td>
								<td>
									<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
										<RowMenu
											student={row}
											organisation={organisation}
											setStudents={setStudents}
										/>
									</Box>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Sheet>
			<NewUserModal open={open} setOpen={setOpen} organisation={organisation} />
		</React.Fragment>
	);
}
