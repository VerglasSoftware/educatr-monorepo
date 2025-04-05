export interface Competition {
	id: string;
	name: string;
	status: string;
	userStartedById: string; // AWS Cognito username // basically who created the competition
	showLeaderboard: boolean;
	packs: string[];
	organisationId: string;
	createdAt: string;
}

export interface CompetitionDynamo {
	PK: { S: string };
	SK: { S: string };
	name: { S: string };
	status: { S: string };
	showLeaderboard: { BOOL: boolean };
	userStartedById: { S: string };
	packs: { L: { S: string }[] };
	organisationId: { S: string };
	createdAt: { N: string };
}

export interface CompetitionCreate {
	name: string;
	status: string;
	showLeaderboard: boolean;
	organisationId: string;
	packs: string[];
}

export interface CompetitionUpdate {
	name: string;
	status: string;
	showLeaderboard: boolean;
	organisationId: string;
	packs: string[];
}

export interface CompetitionCheck {
	packId: string;
	taskId: string;
	answer: string;
}

export interface CompetitionRun {
	language: string;
	code: string;
	stdin: string;
}

export interface Judge0CreateSubmissionResponse {
	token: string;
}
export interface Judge0GetSubmissionResponse {
	stdout: string;
	time: string;
	memory: string;
	stderr: string;
	token: string;
	compile_output: string;
	message: string;
	status: {
		id: number;
		description: string;
	};
}
