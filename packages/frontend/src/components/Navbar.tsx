import { Avatar, Box, Button, Dropdown, IconButton, ListDivider, Menu, MenuButton, MenuItem, Stack, Typography } from "@mui/joy";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { FaDoorOpen, FaLanguage } from "react-icons/fa";
import { useAppContext } from "../lib/contextLib";

export default function NavbarMain({ ...props }) {
	const { isAuthenticated, userHasAuthenticated } = useAppContext();
	const [user, setUser] = useState<any>();

	async function handleLogout() {
		await Auth.signOut();
		userHasAuthenticated(false);
	}

	useEffect(() => {
		async function fetchUser() {
			try {
				const currentUser = await Auth.currentAuthenticatedUser();
				setUser(currentUser);
			} catch (error) {
				console.error("Error fetching user", error);
			}
		}

		fetchUser();
	}, []);

	return (
		<Box
			component="header"
			className="Header"
			{...props}
			sx={[
				{
					p: 2,
					gap: 2,
					bgcolor: "background.surface",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					gridColumn: "1 / -1",
					borderBottom: "1px solid",
					borderColor: "divider",
					position: "sticky",
					top: 0,
					zIndex: 1100,
				},
			]}>
			<Box sx={{ display: "flex", flexGrow: 1, justifyContent: "space-between" }}>
				<Stack
					direction="row"
					spacing={1}
					sx={{
						justifyContent: "center",
						alignItems: "center",
						display: { xs: "none", sm: "flex" },
					}}>
					<Button
						variant="plain"
						color="neutral"
						component="a"
						href="/dash/packs"
						size="sm"
						sx={{ alignSelf: "center" }}>
						Dashboard
					</Button>
					<Button
						variant="plain"
						color="neutral"
						component="a"
						href="/launch"
						size="sm"
						sx={{ alignSelf: "center" }}>
						Launchpad
					</Button>
					<Button
						variant="plain"
						color="neutral"
						component="a"
						href="/play"
						size="sm"
						sx={{ alignSelf: "center" }}>
						Play
					</Button>
				</Stack>
				<Box
					sx={{
						display: "flex",
						flexDirection: "row",
						gap: 1.5,
						alignItems: "center",
					}}>
					{isAuthenticated ? (
						<Dropdown>
							<MenuButton
								variant="plain"
								size="sm"
								sx={{ maxWidth: "32px", maxHeight: "32px", borderRadius: "9999999px" }}>
								<Avatar
									src={user?.attributes.picture || `https://ui-avatars.com/api/?name=${user?.attributes.given_name}+${user?.attributes.family_name}`}
									sx={{ maxWidth: "32px", maxHeight: "32px" }}
								/>
							</MenuButton>
							<Menu
								placement="bottom-end"
								size="sm"
								sx={{
									zIndex: "1100",
									p: 1,
									gap: 1,
									"--ListItem-radius": "var(--joy-radius-sm)",
								}}>
								<MenuItem>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<Avatar
											src={user?.attributes.picture || `https://ui-avatars.com/api/?name=${user?.attributes.given_name}+${user?.attributes.family_name}`}
											sx={{ borderRadius: "50%" }}
										/>
										<Box sx={{ ml: 1.5 }}>
											<Typography
												level="title-sm"
												textColor="text.primary">
												{user?.attributes.given_name} {user?.attributes.family_name}
											</Typography>
											<Typography
												level="body-xs"
												textColor="text.tertiary">
												{user?.attributes.email}
											</Typography>
										</Box>
									</Box>
								</MenuItem>
								<ListDivider />
								<MenuItem onClick={handleLogout}>
									<FaDoorOpen />
									Log out
								</MenuItem>
							</Menu>
						</Dropdown>
					) : null}
				</Box>
			</Box>
		</Box>
	);
}
