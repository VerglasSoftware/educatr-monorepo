import { LineChart } from "@mui/x-charts/LineChart";
import DialogContent from "@mui/joy/DialogContent";
import DialogTitle from "@mui/joy/DialogTitle";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import { Fragment } from "react";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";

export default function LeaderboardChart({ competitionId }: { competitionId: string }) {
	const [leaderboardData, setLeaderboardData] = useState<any>();

	useEffect(() => {
		async function onLoad() {
			try {
				const leaderboardData = await API.get("api", `/competition/${competitionId}/leaderboard`, {});
				setLeaderboardData(leaderboardData);
			} catch (e) {
				console.log(e);
			}
		}

		onLoad();

		const interval = setInterval(() => {
			onLoad();
		}, 30000);

		return () => clearInterval(interval);
	}, [competitionId]);

	return (
		leaderboardData && (
			<LineChart
				xAxis={[
					{
						dataKey: "timestamp",
						valueFormatter: (value) => new Date(value).toLocaleTimeString(),
					},
				]}
				series={Object.keys(leaderboardData.teamLabels).map((key) => ({
					dataKey: key,
					label: leaderboardData.teamLabels[key],
					showMark: false,
				}))}
				dataset={leaderboardData.teamData}
				tooltip={{ trigger: "none" }}
			/>
		)
	);
}
