import * as React from "react";
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Logo from "../assets/rily-logo.png";

import BgWorkshop from "../assets/openart.png";


type FormErrors = {
    email?: string;
    password?: string;
};

export default function LoginPage() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [remember, setRemember] = React.useState(true);
    const [errors, setErrors] = React.useState<FormErrors>({});


    const neonInputSx = {
        "& .MuiInputBase-root": {
            color: "#e2e8f0",
            background: "rgba(255,255,255,0.03)"
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(148,163,184,0.45)"
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.65)"
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#60a5fa",
            boxShadow: "0 0 0 3px rgba(96,165,250,0.22)"
        },
        "& .MuiInputLabel-root": {
            color: "rgba(226,232,240,0.8)"
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: "#93c5fd"
        },
        "& .MuiFormHelperText-root": {
            color: "#fca5a5"
        }
    };


    const validate = (): boolean => {
        const next: FormErrors = {};

        if (!email) next.email = "Email requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Email invalide";

        if (!password) next.password = "Mot de passe requis";
        else if (password.length < 8) next.password = "Minimum 8 caractères";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const ADMIN_EMAIL = "admin@rily.com";
            const ADMIN_PASSWORD = "12345678";

            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("role", "ROLE_ADMIN");
                window.location.href = "/dashboard";
            } else {
                setErrors({
                    email: "Email ou mot de passe invalide",
                    password: "Email ou mot de passe invalide"
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                p: 2,
                backgroundImage: `url(${BgWorkshop})`, // importe ton image fond
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: "rgba(6, 15, 35, 0.45)" // légère couche sombre pour lisibilité
                }
            }}
        >
            <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        p: { xs: 3, sm: 4.5 },
                        background: "rgba(8, 18, 40, 0.62)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        boxShadow:
                            "0 0 28px rgba(37,99,235,0.35), 0 0 18px rgba(249,115,22,0.28), inset 0 0 0 1px rgba(255,255,255,0.06)"
                    }}
                >

                    <Stack spacing={2.5} alignItems="center">
                        <Box
                            component="img"
                            src={Logo}
                            alt="RilyBricoule"
                            sx={{
                                width: 170,
                                height: 170,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "3px solid #fb923c",
                                boxShadow:
                                    "0 0 0 4px rgba(255,255,255,0.12), 0 0 24px rgba(249,115,22,0.65), 0 0 20px rgba(37,99,235,0.45)"
                            }}
                        />

                        <Stack spacing={0.5} textAlign="center">
                            <Typography variant="h4" fontWeight={800} sx={{ color: "#f8fafc", letterSpacing: 0.3 }}>
                                RilyBricoule Admin
                            </Typography>

                            <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.88)" }}>
                                Connectez-vous pour accéder au tableau de bord
                            </Typography>
                        </Stack>

                        <Box component="form" onSubmit={handleSubmit} noValidate width="100%">
                            <Stack spacing={2}>
                                <TextField
                                    label="Adresse email"
                                    type="email"
                                    fullWidth
                                    sx={neonInputSx}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={Boolean(errors.email)}
                                    helperText={errors.email}
                                />

                                <TextField
                                    label="Mot de passe"
                                    type={showPassword ? "text" : "password"}
                                    fullWidth
                                    value={password}
                                    sx={neonInputSx}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={Boolean(errors.password)}
                                    helperText={errors.password}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword((v) => !v)} edge="end"
                                                            sx={{
                                                                color: "rgba(255,255,255,0.9)",
                                                                "&:hover": { color: "#ffffff" }
                                                            }}
                                                >
                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={remember}
                                                onChange={(e) => setRemember(e.target.checked)}
                                                sx={{
                                                    color: "rgba(255,255,255,0.75)",
                                                    "&.Mui-checked": { color: "#60a5fa" }
                                                }}

                                            />
                                        }
                                        label="Se souvenir de moi"
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                color: "#ffffff"
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="text"
                                        size="small"
                                        sx={{
                                            color: "rgba(255,255,255,0.95)",
                                            textTransform: "uppercase",
                                            fontWeight: 600,
                                            "&:hover": {
                                                color: "#ffffff",
                                                backgroundColor: "rgba(255,255,255,0.08)"
                                            }
                                        }}
                                    >
                                        Mot de passe oublié ?
                                    </Button>
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    sx={{
                                        mt: 0.5,
                                        py: 1.3,
                                        fontWeight: 800,
                                        letterSpacing: 0.5,
                                        color: "#f8fafc",
                                        background: "linear-gradient(90deg, #2563eb 0%, #f97316 100%)",
                                        boxShadow: "0 10px 30px rgba(37,99,235,0.4), 0 0 18px rgba(249,115,22,0.45)",
                                        border: "1px solid rgba(255,255,255,0.25)",
                                        "&:hover": {
                                            background: "linear-gradient(90deg, #1d4ed8 0%, #ea580c 100%)",
                                            boxShadow: "0 12px 35px rgba(37,99,235,0.55), 0 0 22px rgba(249,115,22,0.55)"
                                        }
                                    }}
                                >
                                    SE CONNECTER
                                </Button>


                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}