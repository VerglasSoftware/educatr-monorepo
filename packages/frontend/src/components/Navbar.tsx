import { Avatar, Box, Button, Dropdown, IconButton, Input, ListDivider, Menu, MenuButton, MenuItem, Stack, Tooltip, Typography } from "@mui/joy";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { FaBook, FaDoorOpen, FaLanguage } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useAppContext } from "../lib/contextLib";

export default function NavbarMain({ ...props }) {
	const { isAuthenticated, userHasAuthenticated } = useAppContext();
	const [open, setOpen] = useState(false);
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
					<IconButton
						size="md"
						variant="outlined"
						color="neutral"
						sx={{ display: { xs: "none", sm: "inline-flex" }, borderRadius: "50%" }}>
						<FaLanguage />
					</IconButton>
					<Button
						variant="plain"
						color="neutral"
						component="a"
						href="/dash"
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
					<Input
						size="sm"
						variant="outlined"
						placeholder="Search anything…"
						startDecorator={<FaMagnifyingGlass color="primary" />}
						endDecorator={
							<IconButton
								variant="outlined"
								color="neutral"
								sx={{ bgcolor: "background.level1" }}>
								<Typography
									level="title-sm"
									textColor="text.icon">
									⌘ K
								</Typography>
							</IconButton>
						}
						sx={{
							alignSelf: "center",
							display: {
								xs: "none",
								sm: "flex",
							},
						}}
					/>
					<IconButton
						size="sm"
						variant="outlined"
						color="neutral"
						sx={{ display: { xs: "inline-flex", sm: "none" }, alignSelf: "center" }}>
						<FaMagnifyingGlass />
					</IconButton>
					<Tooltip
						title="Joy UI overview"
						variant="outlined">
						<IconButton
							size="sm"
							variant="plain"
							color="neutral"
							component="a"
							href="/blog/first-look-at-joy/"
							sx={{ alignSelf: "center" }}>
							<FaBook />
						</IconButton>
					</Tooltip>

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
