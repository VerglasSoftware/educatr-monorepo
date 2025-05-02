import { Auth } from "aws-amplify";
import React, { useState } from "react";
import { useAppContext } from "../lib/contextLib";
import Page from "../_design/components/layout/Page";
import Button from "../_design/components/core/Button";
import Input from "../_design/components/form/Input";
import Text from "../_design/components/core/Text";

interface FormElements extends HTMLFormControlsCollection {
	username: HTMLInputElement;
	password: HTMLInputElement;
	persistent: HTMLInputElement;
}
interface SignInFormElement extends HTMLFormElement {
	readonly elements: FormElements;
}

export default function Login() {
	const [isLoading, setIsLoading] = useState(false);

	const [usernameError, setUsernameError] = useState(undefined);
	const [passwordError, setPasswordError] = useState(undefined);

	const { userHasAuthenticated } = useAppContext();

	async function handleSubmit(event: React.FormEvent<SignInFormElement>) {
		event.preventDefault();
		const formElements = event.currentTarget.elements;
		const data = {
			username: formElements.username.value,
			password: formElements.password.value,
		};

		if (/^[a-zA-Z0-9].{6,}$/.test(data.username) === false)
			return setUsernameError("Username must be 6 characters long and contain only letters and numbers.");
		setUsernameError(undefined);

		if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(data.password) === false)
			return setPasswordError("Password must be at least 8 characters long, and contain at least one uppercase letter, lowercase letter, and special character.");
		setPasswordError(undefined);

		setIsLoading(true);

		try {
			await Auth.signIn(data.username, data.password);
			userHasAuthenticated(true);
		} catch (e) {
			setUsernameError(e.message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Page title="Login" useAuthContext={useAppContext}>
			<div className="grid grid-cols-2 h-full w-full">
				<div className="flex flex-col justify-center items-center">
					<div className="w-1/2 gap-y-4">
						<Text variant="title" noMarginBottom>Welcome back!</Text>
						<Text variant="subtitle">Enter your details to access your competitions</Text>
						<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
							<Input name="username" label="Username" errorMessage={usernameError} placeholder="" />
							<Input name="password" label="Password" errorMessage={passwordError} type="password" />
							<Button fluid loading={isLoading}>Login</Button>
						</form>
					</div>
				</div>
				<div className="bg-cover bg-center" style={{ backgroundImage: 'url(/resources/images/login.png)' }} />
			</div>
		</Page>
	);
}
