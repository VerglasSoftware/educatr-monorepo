import "./LoaderButton.css";
import { Box, List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, ListSubheader } from "@mui/joy";
import { FaBox, FaInbox, FaPaperPlane, FaTrash } from "react-icons/fa";
import { FaPhotoFilm } from "react-icons/fa6";

export default function Sidebar({ className = "", disabled = false, isLoading = false, ...props }) {
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
					<ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>Browse</ListSubheader>
					<List aria-labelledby="nav-list-browse">
						<ListItem>
							<ListItemButton selected>
								<ListItemDecorator>
									<FaInbox fontSize="small" />
								</ListItemDecorator>
								<ListItemContent>Inbox</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<FaBox fontSize="small" />
								</ListItemDecorator>
								<ListItemContent>Sent</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<FaPaperPlane fontSize="small" />
								</ListItemDecorator>
								<ListItemContent>Draft</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<FaPhotoFilm fontSize="small" />
								</ListItemDecorator>
								<ListItemContent>Flagged</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<FaTrash fontSize="small" />
								</ListItemDecorator>
								<ListItemContent>Trash</ListItemContent>
							</ListItemButton>
						</ListItem>
					</List>
				</ListItem>
				<ListItem
					nested
					sx={{ mt: 2 }}>
					<ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>Tags</ListSubheader>
					<List
						aria-labelledby="nav-list-tags"
						size="sm"
						sx={{ "--ListItemDecorator-size": "32px" }}>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<Box
										sx={{
											width: "10px",
											height: "10px",
											borderRadius: "99px",
											bgcolor: "primary.500",
										}}
									/>
								</ListItemDecorator>
								<ListItemContent>Personal</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<Box
										sx={{
											width: "10px",
											height: "10px",
											borderRadius: "99px",
											bgcolor: "danger.500",
										}}
									/>
								</ListItemDecorator>
								<ListItemContent>Work</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<Box
										sx={{
											width: "10px",
											height: "10px",
											borderRadius: "99px",
											bgcolor: "warning.400",
										}}
									/>
								</ListItemDecorator>
								<ListItemContent>Travels</ListItemContent>
							</ListItemButton>
						</ListItem>
						<ListItem>
							<ListItemButton>
								<ListItemDecorator>
									<Box
										sx={{
											width: "10px",
											height: "10px",
											borderRadius: "99px",
											bgcolor: "success.400",
										}}
									/>
								</ListItemDecorator>
								<ListItemContent>Concert tickets</ListItemContent>
							</ListItemButton>
						</ListItem>
					</List>
				</ListItem>
			</List>
		</Box>
	);
}
