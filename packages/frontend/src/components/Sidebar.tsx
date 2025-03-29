import { Box, List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, ListSubheader } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { FaBox } from "react-icons/fa";
import { FaGear, FaPeopleGroup, FaTrophy } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { Organisation } from "../../../functions/src/types/organisation";
import "./LoaderButton.css";

export default function Sidebar() {
	const [organisations, setOrganisations] = useState<Organisation[]>([]);

	useEffect(() => {
		async function onLoad() {
			try {
				const organisations: Organisation[] = await API.get("api", "/organisation", {});
				setOrganisations(organisations);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();
	}, []);

	const location = useLocation();

	return (
		<Box
			component="nav"
			className="Navigation"
			sx={[
				{
					p: 2,
					bgcolor: "background.surface",
					borderRight: "1px solid",
					borderColor: "divider",
					display: {
						xs: "none",
						sm: "initial",
					},
				},
			]}>
			<List
				size="sm"
				sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
				<ListItem nested>
					<ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>Owned by you</ListSubheader>
					<List aria-labelledby="nav-list-browse">
						<ListItem>
							<ListItemButton
								selected={location.pathname === `/dash/packs`}
								component="a"
								href="/dash/packs">
								<ListItemDecorator>
									<FaBox fontSize="small" />
								</ListItemDecorator>
								<ListItemContent>Packs</ListItemContent>
							</ListItemButton>
						</ListItem>
					</List>
				</ListItem>
				<ListItem>
					<ListItemButton
						selected={location.pathname === `/dash/competitions`}
						component="a"
						href={`/dash/competitions`}>
						<ListItemDecorator>
							<FaTrophy fontSize="small" />
						</ListItemDecorator>
						<ListItemContent>Competitions</ListItemContent>
					</ListItemButton>
				</ListItem>
				{organisations.map((org) => (
					<ListItem nested>
						<ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>Owned by {org.name}</ListSubheader>
						<List aria-labelledby="nav-list-browse">
							<ListItem>
								<ListItemButton
									selected={location.pathname === `/dash/${org.id}/classes`}
									component="a"
									href={`/dash/${org.id}/classes`}>
									<ListItemDecorator>
										<FaPeopleGroup fontSize="small" />
									</ListItemDecorator>
									<ListItemContent>Classes</ListItemContent>
								</ListItemButton>
							</ListItem>
							<ListItem>
								<ListItemButton
									selected={location.pathname === `/dash/${org.id}`}
									component="a"
									href={`/dash/${org.id}`}>
									<ListItemDecorator>
										<FaGear fontSize="small" />
									</ListItemDecorator>
									<ListItemContent>Settings</ListItemContent>
								</ListItemButton>
							</ListItem>
						</List>
					</ListItem>
				))}
			</List>
		</Box>
	);
}
