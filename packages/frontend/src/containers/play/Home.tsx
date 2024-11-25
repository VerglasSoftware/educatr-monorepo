import { Box, Button, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import "./Play.css";
import "./Home.css";
import {Helmet} from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";

export default function PlayHome() {
    const [competitions, setCompetitions] = useState<any[]>([]);

    useEffect(() => {
        async function onLoad() {
            try {
                const competitions = await API.get("api", `/competition`, {});
                setCompetitions(competitions);
            } catch (e) {
                console.log(e);
            }
        }
    
        onLoad();
    }, []);

  return (
    <div className="Home">
        <Helmet>
            <title></title>
        </Helmet>
     
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '85vh',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            
            <Card variant="plain" sx={{ backgroundColor: 'rgb(0 0 0 / 0.3)', width: '60%' }}>
            <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Typography level="h2" component="h1" textColor="common.white">Educatr Launchpad 🚀</Typography>
                <Typography level="body-lg" textColor="common.white">Select a game to start</Typography>

                <Stack direction="column" spacing={1} sx={{ marginTop: 1, width: '100%' }}>

                    {
                        competitions.map((competition) => (
                            <Card variant="plain" sx={{ display: 'flex', gap: 2, backgroundColor: 'rgb(0 0 0 / 0.3)' }}>
                                <Link
                                    overlay
                                    href={`/play/${competition.PK.S}`}
                                    underline="none"
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}
                                >
                                    <Typography level="title-lg" textColor="common.white">{competition.name.S}</Typography>
                                    <Typography level="body-sm" textColor="common.white">{competition.createdAt.N}</Typography>
                                </Link>
                            </Card>
                        ))
                    }

                </Stack>
            </CardContent>
      </Card>

        </Box>

    </div>
  );
}
