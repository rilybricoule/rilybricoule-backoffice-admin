import * as React from "react";
import {
    Alert, Box, Button, Container, Paper, Stack, TextField, Typography
} from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { enableMy2FA, setupMy2FA } from "../api/auth";

type LocationState = { email?: string; remember?: boolean };

function clearPending2FAFlag() {
    localStorage.removeItem("pending2FASetup");
    sessionStorage.removeItem("pending2FASetup");
    localStorage.removeItem("pending2FASetupEmail");
    sessionStorage.removeItem("pending2FASetupEmail");
}

export default function Setup2FARequiredPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const state = (location.state as LocationState | null) ?? null;

    const emailFromStorage =
        localStorage.getItem("pending2FASetupEmail") ||
        sessionStorage.getItem("pending2FASetupEmail") || "";

    const email = state?.email ?? searchParams.get("email") ?? emailFromStorage;

    const [qrCodeBase64, setQrCodeBase64] = React.useState("");
    const [secret, setSecret] = React.useState("");
    const [code, setCode] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    React.useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const setup = await setupMy2FA();
                setQrCodeBase64(setup.qrCodeBase64);
                setSecret(setup.secret);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Impossible de charger le setup 2FA.");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const handleActivate = async () => {
        setError(null);
        setSuccess(null);
        try {
            setLoading(true);
            await enableMy2FA(code.trim());
            setSuccess("2FA activée. Veuillez vous reconnecter.");
            clearPending2FAFlag();
            navigate("/", { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Code invalide.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg,#082244 0%,#0f2f61 45%,#f97316 100%)" }}>
            <Container maxWidth="sm">
                <Paper sx={{ borderRadius: 4, p: { xs: 3, sm: 4 }, background: "rgba(8,18,40,0.78)", border: "1px solid rgba(255,255,255,0.22)" }}>
                    <Stack spacing={2}>
                        <Typography variant="h5" fontWeight={800} color="#f8fafc">
                            Configuration 2FA Requise
                        </Typography>
                        <Typography variant="body2" color="rgba(226,232,240,0.9)">
                            Votre compte ({email}) doit activer la double authentification avant d’accéder au back-office.
                        </Typography>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        {qrCodeBase64 && (
                            <Box component="img" src={`data:image/png;base64,${qrCodeBase64}`} alt="QR 2FA" sx={{ width: 220, height: 220, p: 1, bgcolor: "#fff", borderRadius: 2 }} />
                        )}

                        {secret && (
                            <Typography variant="body2" color="rgba(226,232,240,0.95)">
                                Clé manuelle: <strong>{secret}</strong>
                            </Typography>
                        )}

                        <TextField
                            label="Code 2FA (6 chiffres)"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            fullWidth
                        />

                        <Button
                            variant="contained"
                            disabled={loading || code.length !== 6}
                            onClick={handleActivate}
                            sx={{ fontWeight: 800, background: "linear-gradient(90deg,#2563eb 0%,#f97316 100%)" }}
                        >
                            ACTIVER 2FA
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
