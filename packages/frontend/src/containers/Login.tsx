import { Auth } from "aws-amplify";
import React, { useState } from "react";
import LoaderButton from "../components/LoaderButton";
import { useAppContext } from "../lib/contextLib";
import { useFormFields } from "../lib/hooksLib";
import "./Login.css";
import { Box, Button, Checkbox, Divider, FormControl, FormLabel, IconButton, Input, Link, Stack, Typography } from "@mui/joy";
import { BadgeRounded, Google, Microsoft } from "@mui/icons-material";

interface FormElements extends HTMLFormControlsCollection {
	username: HTMLInputElement;
	password: HTMLInputElement;
	persistent: HTMLInputElement;
}
interface SignInFormElement extends HTMLFormElement {
	readonly elements: FormElements;
}

export default function Login({ useEmail = false }) {
	const { isAuthenticated, userHasAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [fields, handleFieldChange] = useFormFields({
		username: "",
		password: "",
	});

	return (
		<div style={{ position: "absolute", top: -64, left: 0, zIndex: 100 }}>
			<Box
				sx={(theme) => ({
					width: { xs: "100%", md: "50vw" },
					transition: "width var(--Transition-duration)",
					transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
					position: "relative",
					zIndex: 1,
					display: "flex",
					justifyContent: "flex-end",
					backdropFilter: "blur(12px)",
					backgroundColor: "rgba(255 255 255 / 0.2)",
					[theme.getColorSchemeSelector("dark")]: {
						backgroundColor: "rgba(19 19 24 / 0.4)",
					},
				})}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						minHeight: "100dvh",
						width: "100%",
						px: 2,
					}}>
					<Box
						component="main"
						sx={{
							my: "auto",
							py: 2,
							pb: 5,
							display: "flex",
							flexDirection: "column",
							gap: 2,
							width: 400,
							maxWidth: "100%",
							mx: "auto",
							borderRadius: "sm",
							"& form": {
								display: "flex",
								flexDirection: "column",
								gap: 2,
							},
							[`& .MuiFormLabel-asterisk`]: {
								visibility: "hidden",
							},
						}}>
						<Stack sx={{ gap: 4, mb: 2 }}>
							<Stack sx={{ gap: 1 }}>
								<Typography
									component="h1"
									level="h3">
									Sign in
								</Typography>
								<Typography level="body-sm">
									Interested in bringing Educatr to your classroom?{" "}
									<Link
										href="mailto:dana@verglas.io"
										level="title-sm">
										Get in touch.
									</Link>
								</Typography>
							</Stack>
							<Button
								variant="soft"
								color="neutral"
								fullWidth
								onClick={() => {
									Auth.federatedSignIn({ customProvider: "EntraID" });
								}}
								startDecorator={<Microsoft />}>
								Continue with Entra ID
							</Button>
						</Stack>
						<Divider
							sx={(theme) => ({
								[theme.getColorSchemeSelector("light")]: {
									color: { xs: "#FFF", md: "text.tertiary" },
								},
							})}>
							or
						</Divider>
						<Stack sx={{ gap: 4, mt: 2 }}>
							<form
								onSubmit={async (event: React.FormEvent<SignInFormElement>) => {
									event.preventDefault();
									const formElements = event.currentTarget.elements;
									const data = {
										username: formElements.username.value,
										password: formElements.password.value,
										persistent: formElements.persistent.checked,
									};
									//alert(JSON.stringify(data, null, 2));

									setIsLoading(true);

									try {
										await Auth.signIn(data.username, data.password);
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
								}}>
								<FormControl required>
									<FormLabel>Username</FormLabel>
									<Input
										type="text"
										name="username"
									/>
								</FormControl>
								<FormControl required>
									<FormLabel>Password</FormLabel>
									<Input
										type="password"
										name="password"
									/>
								</FormControl>
								<Stack sx={{ gap: 4, mt: 2 }}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}>
										<Checkbox
											size="sm"
											label="Remember me"
											name="persistent"
										/>
										{/* <Link level="title-sm" href="#replace-with-a-link">
						  Forgot your password?
						</Link> */}
									</Box>
									<Button
										type="submit"
										fullWidth>
										Sign in
									</Button>
								</Stack>
							</form>
						</Stack>
					</Box>
					<Box
						component="footer"
						sx={{ py: 3 }}>
						<Typography
							level="body-xs"
							sx={{ textAlign: "center" }}>
							© Verglas (NI) Limited {new Date().getFullYear()}
						</Typography>
					</Box>
				</Box>
			</Box>
			<Box
				sx={(theme) => ({
					height: "100%",
					position: "fixed",
					right: 0,
					top: 0,
					bottom: 0,
					left: { xs: 0, md: "50vw" },
					transition: "background-image var(--Transition-duration), left var(--Transition-duration) !important",
					transitionDelay: "calc(var(--Transition-duration) + 0.1s)",
					backgroundColor: "background.level1",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					backgroundImage: "url(/resources/images/DSC03953.JPG)",
					[theme.getColorSchemeSelector("dark")]: {
						backgroundImage: "url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)",
					},
				})}
			/>
		</div>
	);
}
