import { Box, Breadcrumbs, Button, Link, Typography } from "@mui/joy";
import "./ClassList.css";
import {Helmet} from "react-helmet";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PackTable from "../../components/dash/packs/PackTable";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import NewPackModal from "../../components/dash/packs/NewPackModal";
import ClassTable from "../../components/dash/organisations/ClassTable";
import NewClassModal from "../../components/dash/organisations/NewClassModal";

export default function ClassList() {
    const [open, setOpen] = useState(false);

  return (
    <div className="Home">
        <Helmet>
            <title>Classes</title>
        </Helmet>
      <div>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="small" />}
              sx={{ pl: 0 }}
            >
              <Link
                underline="none"
                color="neutral"
                href="#some-link"
                aria-label="Home"
              >
                <HomeRoundedIcon />
              </Link>
              <Link
                underline="hover"
                color="neutral"
                href="#some-link"
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Dashboard
              </Link>
              <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
                Classes
              </Typography>
            </Breadcrumbs>
          </Box>

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
            <Typography level="h2" component="h1">
              Classes
            </Typography>
            <Button
              color="primary"
              startDecorator={<FaPlus />}
              size="sm"
              onClick={() => setOpen(true)}
            >
              New class
            </Button>
          </Box>
          <ClassTable />
      </div>
      <NewClassModal open={open} setOpen={setOpen} />
    </div>
  );
}
