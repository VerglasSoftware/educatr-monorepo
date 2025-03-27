import { Box, DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy";
import { Dispatch, Fragment, SetStateAction } from "react";
import LeaderboardChart from "./LeaderboardChart";

interface LeaderboardModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	competitionId: string;
}

export default function LeaderboardModal({ open, setOpen, competitionId }: LeaderboardModalProps) {
	return (
		<Fragment>
			<Modal
				open={open}
				onClose={() => setOpen(false)}>
				<ModalDialog minWidth="50%">
					<DialogTitle>Leaderboard</DialogTitle>
					<DialogContent sx={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<Box sx={{ width: "50vw", height: "30vh" }}>
							<LeaderboardChart competitionId={competitionId}></LeaderboardChart>
						</Box>
					</DialogContent>
				</ModalDialog>
			</Modal>
		</Fragment>
	);
}
