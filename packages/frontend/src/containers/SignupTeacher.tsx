import { Auth } from "aws-amplify";
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { useFormFields } from "../lib/hooksLib";
import "./SignupTeacher.css";

export default function SignupTeacher() {
	const [fields, handleFieldChange] = useFormFields({
		email: "",
		password: "",
		confirmPassword: "",
	});

	const nav = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	function validateForm() {
		return fields.email.length > 0 && fields.password.length > 0 && fields.password === fields.confirmPassword;
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setIsLoading(true);

		try {
			const r = (Math.random() + 1).toString(36).substring(7);

			await Auth.signUp({
				username: fields.email.split("@")[0] + "-" + r,
				password: fields.password,
				attributes: {
					email: fields.email,
				},
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
		<div className="SignupTeacher">
			<Form onSubmit={handleSubmit}>
				<Stack gap={3}>
					<Form.Group controlId="email">
						<Form.Label>Email</Form.Label>
						<Form.Control
							autoFocus
							size="lg"
							type="email"
							value={fields.email}
							onChange={handleFieldChange}
							autoComplete="email"
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
						Create Teacher
					</LoaderButton>
				</Stack>
			</Form>
		</div>
	);
}
