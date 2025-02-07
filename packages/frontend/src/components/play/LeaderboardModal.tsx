import { LineChart } from "@mui/x-charts/LineChart";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import { Fragment } from "react";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import LeaderboardChart from "./LeaderboardChart";

export default function LeaderboardModal({ open, setOpen, competitionId }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; competitionId: string; }) {
    
    return ((
            <Fragment>
                <Modal
                    open={open}
                    onClose={() => setOpen(false)}>
                    <ModalDialog minWidth="50%">
                        <DialogTitle>Leaderboard</DialogTitle>
                        <DialogContent sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx = {{width: '50vw', height: '30vh'}}>
                                <LeaderboardChart competitionId = {competitionId}></LeaderboardChart>
                            </Box>
                        </DialogContent>
                    </ModalDialog>
                </Modal>
            </Fragment>
        )
    );
}