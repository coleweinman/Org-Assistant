import {
	AppBar,
	Box,
	Button,
	Container,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Typography,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { ExitToApp, Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "./AuthProvider";

var LINKS = [
	{
		name: "Home",
		link: "/",
	},
	// {
	// 	name: "Orgs",
	// 	link: "/orgs",
	// },
];

function NavigationBar(props: any) {
	const [anchorElNav, setAnchorElNav] = React.useState<(EventTarget & HTMLButtonElement) | null>(null);
	let navigate = useNavigate();
    let auth = useAuth();

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = (link: string) => {
		navigate(link);
		setAnchorElNav(null);
	};

	const signout = () => {
		auth.signOut();
	}

	return (
		<AppBar position="static" elevation={3}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Typography
						variant="h6"
						noWrap
						component="div"
						onClick={() => handleCloseNavMenu("/home")}
						sx={{
							mr: 2,
							display: { xs: "none", md: "flex" },
							cursor: "pointer",
						}}
					>
						Org Assistant
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "left",
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: "block", md: "none" },
							}}
						>
							{LINKS.map((l) => (
								<MenuItem
									key={l.name}
									onClick={() => handleCloseNavMenu(l.link)}
								>
									<Typography textAlign="center">{l.name}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
					<Typography
						variant="h6"
						noWrap
						component="div"
						onClick={() => handleCloseNavMenu("/home")}
						sx={{
							flexGrow: 1,
							display: { xs: "flex", md: "none" },
							cursor: "pointer",
						}}
					>
						Org Assistant
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
						{LINKS.map((l) => (
							<Button
								key={l.name}
								onClick={() => handleCloseNavMenu(l.link)}
								sx={{ my: 2, color: "white", display: "block" }}
							>
								{l.name}
							</Button>
						))}
					</Box>
					<Box>
						<IconButton
							size="large"
							onClick={signout}
							color="inherit"
						>
							<ExitToApp />
						</IconButton>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
		// <Navbar className="navbar" variant="dark">
		//     <Container className="page-container">
		//         <Navbar.Brand href="/home">UniverCity</Navbar.Brand>
		//         <Nav className="me-auto">
		//             {LINKS.map((l) => <NavLink name={l.name} link={l.link}></NavLink>)}
		//         </Nav>
		//     </Container>
		// </Navbar>
	);
}

export default NavigationBar;
