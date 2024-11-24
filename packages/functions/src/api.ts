import { Handler } from "aws-lambda";

export const handler: Handler = async (_event) => {
	return {
		statusCode: 301,
		headers: {
			Location: 'https://educatr.uk',
		}
	};
};
