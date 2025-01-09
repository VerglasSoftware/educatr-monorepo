import { Callback, Context, Handler, PreSignUpTriggerEvent } from "aws-lambda";

const handler = async (event: PreSignUpTriggerEvent, context: Context, callback: Callback) => {
	// Automatically confirm users if they don't have an email set
	// This is for Student users who don't have an email
	if (!event.request.userAttributes.hasOwnProperty("email")) {
		event.response.autoConfirmUser = true;
	}

	console.log(event.response);

	// Return to Amazon Cognito
	return event;
};

export { handler };
