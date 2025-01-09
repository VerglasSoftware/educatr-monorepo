import { Box, List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, ListSubheader } from "@mui/joy";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { FaBox } from "react-icons/fa";
import { FaGear, FaPeopleGroup, FaTrophy } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import "./LoaderButton.css";

export default function Sidebar({ className = "", disabled = false, isLoading = false, ...props }) {
	const [organisations, setOrganisations] = useState<any[]>([]);

	useEffect(() => {
		async function onLoad() {
			try {
				const organisations = await API.get("api", "/organisation", {});
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
			{...props}
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
				{organisations.map((org) => (
					<ListItem nested>
						<ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>Owned by {org.name.S}</ListSubheader>
						<List aria-labelledby="nav-list-browse">
							<ListItem>
								<ListItemButton
									selected={location.pathname === `/dash/${org.PK.S.split('#')[1]}/competitions`}
									component="a"
									href={`/dash/${org.PK.S.split('#')[1]}/competitions`}>
									<ListItemDecorator>
										<FaTrophy fontSize="small" />
									</ListItemDecorator>
									<ListItemContent>Competitions</ListItemContent>
								</ListItemButton>
							</ListItem>
							<ListItem>
								<ListItemButton
									selected={location.pathname === `/dash/${org.PK.S.split('#')[1]}/classes`}
									component="a"
									href={`/dash/${org.PK.S.split('#')[1]}/classes`}>
									<ListItemDecorator>
										<FaPeopleGroup fontSize="small" />
									</ListItemDecorator>
									<ListItemContent>Classes</ListItemContent>
								</ListItemButton>
							</ListItem>
							<ListItem>
								<ListItemButton
									selected={location.pathname === `/dash/${org.PK.S.split('#')[1]}`}
									component="a"
									href={`/dash/${org.PK.S.split('#')[1]}`}>
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
