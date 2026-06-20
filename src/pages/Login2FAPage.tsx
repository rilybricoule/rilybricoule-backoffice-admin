import * as React from "react";
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { verify2FALogin, storeAuth } from "../api/auth";
import { startForceLogoutRealtime } from "../api/forceLogoutRealTime.ts";
import BgWorkshop from "../assets/openart.png";
import Logo from "../assets/rily-logo.png";

type LocationState = {
    tempToken?: string;
    remember?: boolean;
    email?: string;
};

export default function Login2FAPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as LocationState | null) ?? null;

    const [code, setCode] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const tempToken = state?.tempToken ?? "";
    const remember = state?.remember ?? true;
    const email = state?.email ?? "";

    React.useEffect(() => {
        if (!tempToken) {
            navigate("/", { replace: true });
        }
    }, [tempToken, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!/^\d{6}$/.test(code.trim())) {
            setError("Code 2FA invalide (6 chiffres).");
            return;
        }

        try {
            setLoading(true);
            const loginData = await verify2FALogin(tempToken, code.trim());
            storeAuth(loginData, remember);
            startForceLogoutRealtime();
            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            const message =
                err?.response?.data?.message || "Code 2FA incorrect ou expiré.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                p: 2,
                backgroundImage: `url(${BgWorkshop})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: "rgba(6, 15, 35, 0.45)",
                },
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
                    }}
                >
                    <Stack spacing={2.5} alignItems="center">
                        <Box
                            component="img"
                            src={Logo}
                            alt="RilyBricoule"
                            sx={{
                                width: 110,
                                height: 110,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "3px solid #fb923c",
                            }}
                        />

                        <Stack spacing={0.5} textAlign="center">
                            <Typography variant="h5" fontWeight={800} sx={{ color: "#f8fafc" }}>
                                Vérification 2FA
                            </Typography>
                            <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.88)" }}>
                                {email ? `Compte: ${email}` : "Entrez le code de votre application d'authentification"}
                            </Typography>
                        </Stack>

                        {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}
                        <Box
                            sx={{
                                mt: 1,
                                mb: 2,
                                px: 1.5,
                                py: 1,
                                borderRadius: 1.5,
                                border: "1px solid rgba(147,181,218,0.28)",
                                background:
                                    "linear-gradient(135deg, rgba(10,37,77,0.55), rgba(15,23,42,0.45))",
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    color: "#fde68a",
                                    fontWeight: 700,
                                    letterSpacing: 0.2,
                                    mb: 0.25,
                                }}
                            >
                                2FA activée par le Super Admin
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    color: "rgba(234,244,255,0.9)",
                                    lineHeight: 1.5,
                                }}
                            >
                                Veuillez installer Google Authenticator pour récupérer votre code de
                                vérification.
                            </Typography>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit} noValidate width="100%">
                            <Stack spacing={2}>
                                <TextField
                                    label="Code 2FA (6 chiffres)"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    fullWidth
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        py: 1.3,
                                        fontWeight: 800,
                                        color: "#f8fafc",
                                        background: "linear-gradient(90deg, #2563eb 0%, #f97316 100%)",
                                    }}
                                >
                                    {loading ? "Vérification..." : "VALIDER LE CODE"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
