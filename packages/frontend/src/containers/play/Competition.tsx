import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/joy";
import "./Play.css";
import {Helmet} from "react-helmet";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import NavbarMain from "../../components/play/Navbar";
import { DotWave } from "@uiball/loaders";
import { cardio } from 'ldrs';
import useWebSocket, { ReadyState } from "react-use-websocket";
import TaskModal from "../../components/play/TaskModal";

export default function PlayCompetition() {
    const [competition, setCompetition] = useState<any>();
    const [packs, setPacks] = useState<any[]>();
    const [webhookStatus, setWebhookStatus] = useState<any>('Default');

    const [selectedTask, setSelectedTask] = useState<any>();
    const [open, setOpen] = useState<any>();

    const { compId } = useParams();

    const { sendMessage, lastMessage, readyState } = useWebSocket(import.meta.env.VITE_WEBSOCKET_URI);

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            console.log(data);

            if (data.filter.competitionId && data.filter.competitionId != compId) return;

            switch (data.type) {
                case "COMPETITION:STATUS_UPDATE":
                    setCompetition({ ...competition, status: data.body.status });
                    break;
                default:
                    break;
            }
        }
      }, [lastMessage]);

      useEffect(() => {
        const connectionStatus = {
            [ReadyState.CONNECTING]: 'Connecting',
            [ReadyState.OPEN]: 'Open',
            [ReadyState.CLOSING]: 'Closing',
            [ReadyState.CLOSED]: 'Closed',
            [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
          }[readyState];
          console.log(connectionStatus);
          setWebhookStatus(connectionStatus);
    }, [readyState]);

    cardio.register();

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

    if (!competition || !packs || webhookStatus != "Open") {
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
                { webhookStatus != "Open" && <Typography level="body-sm" textColor="common.white">Connecting to stream</Typography> }

            </CardContent>
      </Card>
        </Box>
        )
    }

    if (competition.status != "IN_PROGRESS") {
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


                <l-cardio
                    size="50"
                    stroke="4"
                    speed="2"
                    color="white" 
                ></l-cardio>

                {competition.status == "NOT_STARTED" && (
                    <>
                    <Typography level="title-lg" textColor="common.white" sx={{ mt: 2 }}>{competition.name} hasn't started yet</Typography>
                    <Typography level="body-sm" textColor="common.white">This screen will automatically refresh when we're ready to start</Typography>
                    </>
                )}

                {competition.status == "PAUSED" && (
                    <>
                    <Typography level="title-lg" textColor="common.white" sx={{ mt: 2 }}>{competition.name} is paused</Typography>
                    <Typography level="body-sm" textColor="common.white">This screen will automatically refresh when we're ready to go again</Typography>
                    </>
                )}

                {competition.status == "ENDED" && (
                    <>
                    <Typography level="title-lg" textColor="common.white" sx={{ mt: 2 }}>{competition.name} hasn't ended</Typography>
                    <Typography level="body-sm" textColor="common.white">Thanks for playing!</Typography>
                    </>
                )}

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
                {packs.map((pack: any) => (
                    <>
                    <Typography level="h2" component="h1" textColor="common.white">{pack.name.S}</Typography>
                    <Box sx={{ display: 'grid', flexGrow: 1, gridTemplateColumns: 'repeat(5, 1fr)', justifyContent: 'center', gap: 2 }}>
                        {pack.tasks.map((task: any) => (
                            <Link component="button" onClick={() => { setSelectedTask(task); setOpen(true); }}>
                                <Card variant="plain" sx={{ backgroundColor: 'rgb(0 0 0 / 0.3)', width: '100%' }}>
                                    <CardContent sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2%'
                                    }}>

                                    <Typography level="title-lg" textColor="common.white">{task.title.S}</Typography>
                                    <Typography level="body-sm" textColor="common.white">{task.points.N} point{task.points.N != 1 && 's'}</Typography>
                    
                                </CardContent>
                        </Card>
                      </Link>
                        ))}
                    </Box>
                    </>
                ))}
            </Stack>

        </Box>

        <TaskModal open={open} setOpen={setOpen} competition={competition} task={selectedTask} />

    </div>
  );
}
