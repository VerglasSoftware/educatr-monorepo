import { Auth } from "aws-amplify";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import LoaderButton from "../components/LoaderButton";
import { useAppContext } from "../lib/contextLib";
import { useFormFields } from "../lib/hooksLib";
import "./Login.css";

export default function Login({ useEmail = false }) {
	const { isAuthenticated, userHasAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [fields, handleFieldChange] = useFormFields({
		username: "",
		password: "",
	});


	function validateForm() {
		return fields.username.length > 0 && fields.password.length > 0;
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		try {
			await Auth.signIn(fields.username, fields.password);
			userHasAuthenticated(true);
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				alert(error.message);
			} else {
				alert(String(error));
			}
			setIsLoading(false);
		}
	}

	async function handleLogout() {
		await Auth.signOut();
		userHasAuthenticated(false);
	}

	return (
		<div className="Login">
			<Form onSubmit={handleSubmit}>
				<Stack gap={3}>
					<Form.Group controlId="username">
						<Form.Label>{useEmail ? "Email" : "Username"}</Form.Label>
						<Form.Control
							autoFocus
							size="lg"
							type={useEmail ? "email" : "username"}
							value={fields.username}
							onChange={handleFieldChange}
						/>
					</Form.Group>
					<Form.Group controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control
							size="lg"
							type="password"
							value={fields.password}
							onChange={handleFieldChange}
						/>
					</Form.Group>
					{isAuthenticated ? (
						<a
							href="#"
							onClick={handleLogout}>
							Logout
						</a>
					) : (
						<LoaderButton
							size="lg"
							type="submit"
							isLoading={isLoading}
							disabled={!validateForm()}>
							Login
						</LoaderButton>
					)}
				</Stack>
			</Form>

			<br />
			<h4>Create new user account</h4>
			<Button
				size="lg"
				type="submit"
				href="/signup">
				Create
			</Button>

			<br />
			<h4>Sign in with Entra ID</h4>
			<Button
				size="lg"
				type="button"
				onClick={() => Auth.federatedSignIn({ customProvider: "EntraID" })}>
				Create
			</Button>
		</div>
	);
}
