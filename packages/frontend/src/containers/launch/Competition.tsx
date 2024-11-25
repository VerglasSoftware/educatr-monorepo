import { Box, Button, ButtonGroup, Card, CardContent, Typography } from "@mui/joy";
import "../play/Play.css";
import {Helmet} from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import NavbarMain from "../../components/launch/Navbar";
import { DotWave } from "@uiball/loaders";

export default function LaunchCompetition() {
    const [competition, setCompetition] = useState<any>();
    const [packs, setPacks] = useState<any[]>();

    const [startButtonLoading, setStartButtonLoading] = useState(false);
    const [pauseButtonLoading, setPauseButtonLoading] = useState(false);
    const [resumeButtonLoading, setResumeButtonLoading] = useState(false);
    const [endButtonLoading, setEndButtonLoading] = useState(false);

    const { compId } = useParams();

    useEffect(() => {
        async function onLoad() {
            try {
                const competition = await API.get("api", `/competition/${compId}`, {});
                setCompetition(competition);

                const packs = await API.get("api", `/pack?include=tasks`, {});
                setPacks(packs);
            } catch (e) {
                console.log(e);
            }
        }
    
        onLoad();
    }, []);

    async function startCompetition() {
        setStartButtonLoading(true);
        const newCompetition = await API.put("api", `/competition/${compId}`, {
            body: { ...competition, status: "IN_PROGRESS" }
        });

        setCompetition(newCompetition);
        setStartButtonLoading(false);
    }

    async function pauseCompetition() {
        setPauseButtonLoading(true);
        const newCompetition = await API.put("api", `/competition/${compId}`, {
            body: { ...competition, status: "PAUSED" }
        });

        setCompetition(newCompetition);
        setPauseButtonLoading(false);
    }

    async function resumeCompetition() {
        setResumeButtonLoading(true);
        const newCompetition = await API.put("api", `/competition/${compId}`, {
            body: { ...competition, status: "IN_PROGRESS" }
        });

        setCompetition(newCompetition);
        setResumeButtonLoading(false);
    }

    async function endCompetition() {
        setEndButtonLoading(true);
        const newCompetition = await API.put("api", `/competition/${compId}`, {
            body: { ...competition, status: "ENDED" }
        });

        setCompetition(newCompetition);
        setEndButtonLoading(false);
    }

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
            alignItems: 'left',
            flexDirection: 'column',
            padding: '2%'
        }}>

            <Card variant="plain" sx={{ backgroundColor: 'rgb(0 0 0 / 0.3)', width: '50%' }}>
                <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',
                    justifyContent: 'center',
                    padding: '2%'
                }}>

                    <Typography level="h2" component="h1" textColor="common.white">{competition.name} launchpad</Typography>

                    <ButtonGroup variant="solid">
                        <Button color='success' disabled={competition.status != "NOT_STARTED"} onClick={startCompetition} loading={startButtonLoading}>Start</Button>
                        { competition.status != "PAUSED" && <Button color='warning' disabled={competition.status != "IN_PROGRESS"} onClick={pauseCompetition} loading={pauseButtonLoading}>Pause</Button> }
                        { competition.status == "PAUSED" && <Button color='success' disabled={competition.status != "PAUSED"} onClick={resumeCompetition} loading={resumeButtonLoading}>Resume</Button> }
                        <Button color='danger' disabled={competition.status != "PAUSED"} onClick={endCompetition} loading={endButtonLoading}>End</Button>
                    </ButtonGroup>
    
                </CardContent>
            </Card>

        </Box>

    </div>
  );
}
