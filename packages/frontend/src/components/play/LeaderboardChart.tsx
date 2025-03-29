import { LineChart } from "@mui/x-charts/LineChart";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";

interface LeaderboardChartProps {
	competitionId: string;
}

export default function LeaderboardChart({ competitionId }: LeaderboardChartProps) {
	const [leaderboardData, setLeaderboardData] = useState<{
		teamLabels: Record<string, string>;
		teamData: {
			[key: string]: number;
			timestamp: number;
		}[];
	}>();

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
