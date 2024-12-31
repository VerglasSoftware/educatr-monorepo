import { Auth } from "aws-amplify";
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { useFormFields } from "../lib/hooksLib";
import "./SignupStudent.css";

export default function SignupStudent() {
	const [fields, handleFieldChange] = useFormFields({
		username: "",
		password: "",
		confirmPassword: "",
	});

	const nav = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	function validateForm() {
		return fields.username.length > 0 && fields.password.length > 0 && fields.password === fields.confirmPassword;
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		try {
			await Auth.signUp({
				username: fields.username,
				password: fields.password,
			});

			setIsLoading(false);
			nav("/login");
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

	return (
		<div className="SignupStudent">
			<Form onSubmit={handleSubmit}>
				<Stack gap={3}>
					<Form.Group controlId="username">
						<Form.Label>Username</Form.Label>
						<Form.Control
							autoFocus
							size="lg"
							type="username"
							value={fields.username}
							onChange={handleFieldChange}
							autoComplete="username"
						/>
					</Form.Group>
					<Form.Group controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control
							size="lg"
							type="password"
							value={fields.password}
							onChange={handleFieldChange}
							autoComplete="new-password"
						/>
					</Form.Group>
					<Form.Group controlId="confirmPassword">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control
							size="lg"
							type="password"
							value={fields.confirmPassword}
							onChange={handleFieldChange}
							autoComplete="new-password"
						/>
					</Form.Group>

					<LoaderButton
						size="lg"
						type="submit"
						variant="success"
						isLoading={isLoading}
						disabled={!validateForm()}>
						Create Student
					</LoaderButton>
				</Stack>
			</Form>
		</div>
	);
}
