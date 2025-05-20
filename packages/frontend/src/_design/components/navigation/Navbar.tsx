import { Auth } from "aws-amplify";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { AppContextType } from "../../../lib/contextLib";
import { useLocation } from "react-router-dom";
import Dropdown from "./Dropdown";

export default function Navbar({ useAuthContext }: { useAuthContext: () => AppContextType }) {
	const { isAuthenticated, userHasAuthenticated } = useAuthContext();
	const [user, setUser] = useState<any>();
	const location = useLocation();

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

	const navLinks = [
		{ href: "/#", label: "Home" },
		{ href: "/dash", label: "Dashboard" },
		{ href: "/launch", label: "Launchpad" },
		{ href: "/play", label: "Play" },
	];

	const isActive = (href: string) => {
		return location.pathname.startsWith(href);
	};

	return (
		<nav className="bg-primary border-gray-200 h-[74px] flex w-full flex-row items-center">
			<div className="max-w-screen-xl w-full flex flex-wrap items-center justify-between mx-auto p-4">
				<a href="/" className="flex items-center space-x-3 rtl:space-x-reverse h-[74px] py-5">
					<Logo variant="educatr" />
				</a>
				<div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
					{
						isAuthenticated ? (
							<Dropdown
								items={[
									{ text: 'Log out', onClick: handleLogout },
								]}
							>
								<span className="sr-only">Open user menu</span>
								<img className="w-8 h-8 rounded-full" src={user?.attributes.picture || `https://ui-avatars.com/api/?name=${user?.attributes.given_name}+${user?.attributes.family_name}`} alt="user photo" />
							</Dropdown>
						) : (
							<a href="/login" className="block py-2 px-3 text-primary-foreground rounded-sm md:bg-transparent font-medium" aria-current="page">Login</a>
						)
					}
				</div>
				<div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
					<ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
						{navLinks.map(link => (
							<li key={link.href}>
								<a
									href={link.href}
									className={`block py-2 px-3 rounded-sm md:bg-transparent ${
										isActive(link.href)
											? "text-primary-foreground bg-primary/30"
											: "text-primary-foreground/60 hover:text-primary-foreground"
									}`}
									aria-current={isActive(link.href) ? "page" : undefined}
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</nav>
	);
}
