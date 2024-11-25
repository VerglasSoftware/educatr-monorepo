import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import "./Play.css";
import {Helmet} from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import NavbarMain from "../../components/play/Navbar";

export default function PlayCompetition() {
    const [competition, setCompetition] = useState<any>();

    const { compId } = useParams();

    useEffect(() => {
        async function onLoad() {
            try {
                const competition = await API.get("api", `/competition/${compId}`, {});
                setCompetition(competition);
            } catch (e) {
                console.log(e);
            }
        }
    
        onLoad();
    }, []);

  return competition && (
    <div className="Home">
        <Helmet>
            <title>{competition.name}</title>
        </Helmet>

        <NavbarMain />
     
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: '2%'
        }}>

            <Typography level="h2" component="h1" textColor="common.white">{competition.name}</Typography>

        </Box>

    </div>
  );
}
