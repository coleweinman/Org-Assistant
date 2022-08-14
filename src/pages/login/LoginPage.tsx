import { Alert, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

function LoginPage() {
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [error, setError] = React.useState(null);
    let auth = useAuth();
    let navigate = useNavigate();

    const handleEmailUpdate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordUpdate = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const submit = async () => {
        try {
            let cred = await auth.signInWithEmail(email, password);
            if (cred !== null) {
                navigate("/");
            }
        } catch (e: any) {
            console.log(e);
            setError(e.toString());
        }
    }

    return (
        <Container sx={{height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
            <Typography gutterBottom textAlign="center" variant="h2" component="div">
                Org Assistant
            </Typography>
            <Card sx={{"margin": "auto"}}>
                <CardContent>
                    <Typography gutterBottom textAlign="center" variant="h5" component="div">
                        Login
                    </Typography>
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap={1}
                        sx={{padding: "16px"}}
                    >
                        <TextField 
                            id="outlined-basic" 
                            label="Email" 
                            variant="outlined" 
                            onChange={handleEmailUpdate} 
                            autoComplete="email"
                        />
                        <TextField 
                            id="outlined-basic" 
                            label="Password" 
                            variant="outlined" 
                            onChange={handlePasswordUpdate}
                            type="password"
                            autoComplete="current-password"
                        />
                        <Button variant="contained" onClick={submit}>Login</Button>
                    </Stack>
                </CardContent>
            </Card>
            {error !== null &&
                <Alert sx={{margin: "16px"}} variant="outlined" severity="error">
                    {error}
                </Alert>
            }
            <Typography padding={1} textAlign="center" variant="body1" component="div">
                Created by Logotology
            </Typography>
        </Container>
    );
}

export default LoginPage;