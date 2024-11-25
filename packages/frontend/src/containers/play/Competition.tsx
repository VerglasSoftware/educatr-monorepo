import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import "./Play.css";
import {Helmet} from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import NavbarMain from "../../components/play/Navbar";
import { DotWave } from "@uiball/loaders";

export default function PlayCompetition() {
    const [competition, setCompetition] = useState<any>();
    const [packs, setPacks] = useState<any[]>();

    const { compId } = useParams();

    useEffect(() => {
        async function onLoad() {
            try {
                const competition = await API.get("api", `/competition/${compId}`, {});
                setCompetition(competition);

                const packs = await API.get("api", `/pack`, {});
                setPacks(packs);
            } catch (e) {
                console.log(e);
            }
        }
    
        onLoad();
    }, []);

    if (!competition || !packs) {
        return (
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
                padding: '2%'
            }}>

                    <DotWave color="#FFF" />

                <Typography level="title-lg" textColor="common.white" sx={{ mt: 2 }}>Getting ready</Typography>
                { !competition && <Typography level="body-sm" textColor="common.white">Downloading competition data</Typography> }
                { !packs && <Typography level="body-sm" textColor="common.white">Downloading pack data</Typography> }

            </CardContent>
      </Card>
        </Box>
        )
    }

  return (
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

            

            <Stack spacing={2} sx={{ width: '100%' }}>
                {packs.map((pack) => (
                    <>
                    <Typography level="h2" component="h1" textColor="common.white">{pack.name.S}</Typography>
                    </>
                ))}
            </Stack>

        </Box>

    </div>
  );
}
