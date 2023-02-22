import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import "../stylesheets/NavigationBar.scss";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LINKS = [
	{
		name: "Home",
		link: "/",
	}
];

function NavigationBar() {
	const [anchorElNav, setAnchorElNav] = React.useState<(EventTarget & HTMLButtonElement) | null>(null);
	const navigate = useNavigate();
	const auth = useAuth();

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = (link: string) => {
		navigate(link);
		setAnchorElNav(null);
	};

	const signOut = () => auth.signOut();

	return (
		<nav className={"navbar"}>
			<div className={"nav-content"}>
				<h2 className={"nav-title"}>Org Assistant</h2>
				<ul className={"nav-links"}>
					{LINKS.map(({ link, name }) => (
						<li onClick={() => handleCloseNavMenu(link)} key={name}>
							{name}
						</li>
					))}
				</ul>
			</div>
			{auth.user && (
				<button className={"blue-button log-out-button"} onClick={signOut}>
					<FontAwesomeIcon icon={solid("sign-out")} />
				</button>
			)}
		</nav>
	);
}

export default NavigationBar;
