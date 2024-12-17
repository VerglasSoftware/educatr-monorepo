import { Callback, Context, PreSignUpTriggerEvent } from "aws-lambda";

const handler = async (event: PreSignUpTriggerEvent, _context: Context, _callback: Callback) => {
	// Automatically confirm users if they don't have an email set
	// This is for Student users who don't have an email
	if (!event.request.userAttributes.hasOwnProperty("email")) {
		event.response.autoConfirmUser = true;
	}

	// Return to Amazon Cognito
	return event;
};

// For whatever reason, AWS cries if it's not exported like this
export { handler };
