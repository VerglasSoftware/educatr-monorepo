import "./LoaderButton.css";
import { Box, List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, ListSubheader } from "@mui/joy";
import { FaBook, FaBox, FaBoxOpen, FaInbox, FaPaperPlane, FaTrash } from "react-icons/fa";
import { FaBookAtlas, FaBookOpen, FaPhotoFilm } from "react-icons/fa6";

export default function Sidebar({
  className = "",
  disabled = false,
  isLoading = false,
  ...props
}) {
  return (
    <Box
component="nav"
className="Navigation"
{...props}
sx={[
  {
    p: 2,
    bgcolor: 'background.surface',
    borderRight: '1px solid',
    borderColor: 'divider',
    display: {
      xs: 'none',
      sm: 'initial',
    },
  }
]}
>
<List size="sm" sx={{ '--ListItem-radius': '8px', '--List-gap': '4px' }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: '2px', fontWeight: '800' }}>
          Owned by you
        </ListSubheader>
        <List aria-labelledby="nav-list-browse">
          <ListItem>
            <ListItemButton selected href="/dash/packs">
              <ListItemDecorator>
                <FaBox fontSize="small" />
              </ListItemDecorator>
              <ListItemContent>Packs</ListItemContent>
            </ListItemButton>
          </ListItem>
      </List>
      </ListItem>
      </List>
</Box>
  );
}
