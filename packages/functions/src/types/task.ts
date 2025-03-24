export interface TaskDynamo {
	SK: { S: string };
	title: { S: string };
	subtitle: { S: string };
	points: { N: string };
	content: { S: string };
	answer: { S: string };
	stdin: { S: string };
	answerChoices: {
		L: {
			M: {
				correct: { BOOL: boolean };
				id: { S: string };
				name: { S: string };
			};
		}[];
	};
	verificationType: { S: string };
	answerType: { S: string };
	placeholder: { S: string };
	prerequisites: { L: { S: string }[] };
	createdAt: { N: string };
}

export interface Task {
	id: string;
	title: string;
	subtitle: string;
	points: number;
	content: string;
	answer: string;
	stdin: string
	answerChoices: {
		correct: boolean;
		id: string;
		name: string;
	}[];
	verificationType: string;
	answerType: string;
	placeholder: string;
	prerequisites: string[];
	createdAt: string;
}

export interface TaskCreateUpdate {
	title: string;
	subtitle: string;
	points: number;
	content: string;
	answer: string;
	stdin: string;
	answerChoices: {
		correct: boolean;
		id: string;
		name: string;
	}[];
	verificationType: string;
	answerType: string;
	placeholder: string;
	prerequisites: string[];
}
