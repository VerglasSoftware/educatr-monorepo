import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { Link } from '@mui/joy';
import { API } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function RowMenu({ id }: { id: string }) {
    const nav = useNavigate();

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem onClick={() => nav(`/dash/packs/${id}`)}>
            Edit
        </MenuItem>
        <Divider />
        <MenuItem color="danger" onClick={async () => {

            const confirmed = window.confirm(
                "Are you sure you want to delete this pack?"
            );

            if (!confirmed) {
                return;
            }

            try {
                await API.del("api", `/pack/${id}`, {});
            } catch (e) {
                console.log(e);
            }

        }}>Delete</MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default function PackTable() {
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [packs, setPacks] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function onLoad() {
        try {
            const packs = await API.get("api", "/pack", {});
            setPacks(packs);
        } catch (e) {
            console.log(e);
        }
    }

    onLoad();
  }, []);

  return (
    <React.Fragment>
      <Sheet
        className="OrderTableContainer"
        variant="plain"
        sx={{
          display: { xs: 'none', sm: 'initial' },
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
            '--TableCell-paddingY': '4px',
            '--TableCell-paddingX': '8px',
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== packs.length
                  }
                  checked={selected.length === packs.length}
                  onChange={(event) => {
                    setSelected(
                      event.target.checked ? packs.map((row) => row.id) : [],
                    );
                  }}
                  color={
                    selected.length > 0 || selected.length === packs.length
                      ? 'primary'
                      : undefined
                  }
                  sx={{ verticalAlign: 'text-bottom' }}
                />
              </th>
              <th style={{ width: 140, padding: '12px 6px' }}>Name</th>
              <th style={{ width: 140, padding: '12px 6px' }}>Description</th>
              <th style={{ width: 240, padding: '12px 6px' }}>Owner</th>
              <th style={{ width: 140, padding: '12px 6px' }}> </th>
            </tr>
          </thead>
          <tbody>
            {[...packs].map((row) => (
              <tr key={row.id}>
                <td style={{ textAlign: 'center', width: 120 }}>
                  <Checkbox
                    size="sm"
                    checked={selected.includes(row.id)}
                    color={selected.includes(row.id) ? 'primary' : undefined}
                    onChange={(event) => {
                      setSelected((ids) =>
                        event.target.checked
                          ? ids.concat(row.id)
                          : ids.filter((itemId) => itemId !== row.id),
                      );
                    }}
                    slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                    sx={{ verticalAlign: 'text-bottom' }}
                  />
                </td>
                <td>
                  <Typography level="body-xs">{row.name.S}</Typography>
                </td>
                <td>
                  <Typography level="body-xs">{row.description.S}</Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar size="sm">{row.ownerId.S[0]}</Avatar>
                    <div>
                      <Typography level="body-xs">{row.ownerId.S}</Typography>
                      <Typography level="body-xs">{row.ownerId.S}</Typography>
                    </div>
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <RowMenu id={row.PK.S} />
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </React.Fragment>
  );
}
