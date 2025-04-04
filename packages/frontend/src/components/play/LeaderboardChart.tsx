import { LineChart } from "@mui/x-charts/LineChart";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";

interface LeaderboardChartProps {
	competitionId: string;
}

interface LeaderboardData {
	teamLabels: Record<string, string>;
	teamData: {
		[key: string]: number;
		timestamp: number;
	}[];
}

export default function LeaderboardChart({ competitionId }: LeaderboardChartProps) {
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>();

	useEffect(() => {
		async function onLoad() {
			try {
				const leaderboardData: LeaderboardData = await API.get("api", `/competition/${competitionId}/leaderboard`, {});
				setLeaderboardData(leaderboardData);
				console.log(leaderboardData);
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
		// [
		// 	{
		// 		timestamp: 1743719162025,
		// 		changedTeams: { k7u0qzimb37fqgs8glifpnth: 0, woi9tr2j0bx840b8xsj0s7gc: 4 }
		// 	},
		// 	{
		// 		timestamp: 1743720302025,
		// 		changedTeams: { woi9tr2j0bx840b8xsj0s7gc: 5 }
		// 	}
		// ]
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
				dataset={leaderboardData.teamData.map((item) => ({
					...item,
					...Object.keys(leaderboardData.teamLabels).reduce((acc, key) => {
						acc[key] = item.changedTeams[key] ?? 0;
						return acc;
					}, {}),
				}))}
				tooltip={{ trigger: "none" }}
			/>
		)
	);
}
