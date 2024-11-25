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
import { API } from 'aws-amplify';
import { useParams } from 'react-router-dom';
import { Button, Option, Select } from '@mui/joy';
import { FaPlus } from 'react-icons/fa6';

function RowMenu({ compId, packId, competition, packs, setPacks }: { compId: string, packId: string, competition: any, packs: any, setPacks: any }) {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <Divider />
        <MenuItem color="danger" onClick={async () => {

            const updatedCompetition = await API.put("api", `/competition/${compId}`, {
              body: {
                  name: competition.name,
                  status: competition.status || '',
                  packs: packs.filter((p: any) => p !== packId),
              }
            });

            setPacks(updatedCompetition.packs);

        }}>Remove</MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default function CompetitionPackTable({ competition }: { competition: any }) {
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [packs, setPacks] = React.useState<any[]>([]);
  const [availablePacks, setAvailablePacks] = React.useState<any[]>([]);
  const [selectedPack, setSelectedPack] = React.useState<string>('');

  const { compId } = useParams();

  React.useEffect(() => {
    async function onLoad() {
        try {
            const availablePacks = await API.get("api", `/pack`, {});
            setAvailablePacks(availablePacks);
            setPacks(competition.packs);
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
              display: 'flex',
              mb: 1,
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'start', sm: 'center' },
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <Select defaultValue={""} onChange={(_, val) => { setSelectedPack(val || '') }} sx={{ flexGrow: 1 }}>
              <Option value="">Select one</Option>
              {availablePacks.map((pack) => (
                <Option key={pack.PK.S} value={pack.PK.S}>{pack.name.S}</Option>
              ))}
            </Select>
            <Button
              color="primary"
              startDecorator={<FaPlus />}
              size="sm"
              disabled={selectedPack === ''}
              onClick={async () => {
                const updatedCompetition = await API.put("api", `/competition/${compId}`, {
                  body: {
                      name: competition.name,
                      status: competition.status || '',
                      packs: [...packs, selectedPack],
                  }
              });

                setPacks(updatedCompetition.packs);
              }}
            >
              Add
            </Button>
          </Box>

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
                  <Typography level="body-xs">{availablePacks.find(pack => pack.PK.S == row).name.S}</Typography>
                </td>
                <td>
                  <Typography level="body-xs">{availablePacks.find(pack => pack.PK.S == row).description.S}</Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <RowMenu packId={row} compId={compId!} competition={competition} packs={packs} setPacks={setPacks} />
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
