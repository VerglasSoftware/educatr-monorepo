import { Avatar, Box, Button, Dropdown, IconButton, ListDivider, Menu, MenuButton, MenuItem, Stack, Typography } from "@mui/joy";
import { Auth } from "aws-amplify";
import React from "react";
import { useEffect, useState } from "react";
import { FaDoorOpen, FaLanguage } from "react-icons/fa";
import Logo from "./Logo";
import { AppContextType } from "../../../lib/contextLib";

export default function Navbar({ useAuthContext }: { useAuthContext: () => AppContextType }) {
	const { isAuthenticated, userHasAuthenticated } = useAuthContext();
	const [user, setUser] = useState<any>();

	async function handleLogout() {
		await Auth.signOut();
		userHasAuthenticated(false);
	}

	useEffect(() => {
		async function fetchUser() {
			try {
				const currentUser = await Auth.currentAuthenticatedUser();
				setUser(currentUser);
			} catch (error) {
				console.error("Error fetching user", error);
			}
		}

		fetchUser();
	}, []);

	return (
		<nav className="bg-primary border-gray-200 h-[74px] flex w-full flex-row items-center">
			<div className="max-w-screen-xl w-full flex flex-wrap items-center justify-between mx-auto p-4">
				<a href="/" className="flex items-center space-x-3 rtl:space-x-reverse h-[74px] py-5">
					<Logo variant="educatr" />
				</a>
				<div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
					{
						isAuthenticated ? (
							<button type="button" className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
								<span className="sr-only">Open user menu</span>
								<img className="w-8 h-8 rounded-full" src={user?.attributes.picture || `https://ui-avatars.com/api/?name=${user?.attributes.given_name}+${user?.attributes.family_name}`} alt="user photo" />
							</button>
						) : (
							<a href="/login" className="block py-2 px-3 text-primary-foreground rounded-sm md:bg-transparent font-medium" aria-current="page">Login</a>
						)
					}
				</div>
				<div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
					<ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
					<li>
						<a href="/" className="block py-2 px-3 text-primary-foreground rounded-sm md:bg-transparent" aria-current="page">Home</a>
					</li>
					<li>
						<a href="/dash" className="block py-2 px-3 text-primary-foreground/60 rounded-sm hover:text-primary-foreground">Dashboard</a>
					</li>
					<li>
						<a href="/launch" className="block py-2 px-3 text-primary-foreground/60 rounded-sm hover:text-primary-foreground">Launchpad</a>
					</li>
					<li>
						<a href="/play" className="block py-2 px-3 text-primary-foreground/60 rounded-sm hover:text-primary-foreground">Play</a>
					</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}
