import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { changePasswordRequired, storeAuth } from "../api/auth";

type LocationState = {
    email?: string;
    remember?: boolean;
    currentPassword?: string;
};

function clearPendingPasswordResetFlag() {
    localStorage.removeItem("pendingPasswordReset");
    sessionStorage.removeItem("pendingPasswordReset");
    localStorage.removeItem("pendingPasswordResetEmail");
    sessionStorage.removeItem("pendingPasswordResetEmail");
}

export default function ChangePasswordRequiredPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const state = (location.state as LocationState | null) ?? null;

    const emailFromPending =
        localStorage.getItem("pendingPasswordResetEmail") ||
        sessionStorage.getItem("pendingPasswordResetEmail") ||
        "";

    const [email, setEmail] = React.useState(
        state?.email ?? searchParams.get("email") ?? emailFromPending
    );
    const [currentPassword, setCurrentPassword] = React.useState(state?.currentPassword ?? "");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const remember = state?.remember ?? true;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            setError("Tous les champs sont requis.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("La confirmation ne correspond pas au nouveau mot de passe.");
            return;
        }

        try {
            setLoading(true);
            const loginData = await changePasswordRequired(
                email,
                currentPassword,
                newPassword,
                confirmPassword
            );

            clearPendingPasswordResetFlag();
            storeAuth(loginData, remember);
            localStorage.removeItem("pendingPasswordReset");
            sessionStorage.removeItem("pendingPasswordReset");
            localStorage.removeItem("pendingPasswordResetEmail");
            sessionStorage.removeItem("pendingPasswordResetEmail");

            navigate("/dashboard", { replace: true });
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                "Impossible de changer le mot de passe. Vérifie les informations.";
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
                background: "linear-gradient(135deg, #082244 0%, #0f2f61 45%, #f97316 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    sx={{
                        borderRadius: 4,
                        p: { xs: 3, sm: 4 },
                        background: "rgba(8,18,40,0.78)",
                        border: "1px solid rgba(255,255,255,0.22)",
                    }}
                >
                    <Stack spacing={2.5}>
                        <Typography variant="h5" fontWeight={800} color="#f8fafc">
                            Changement De Mot De Passe Requis
                        </Typography>
                        <Typography variant="body2" color="rgba(226,232,240,0.9)">
                            Ton mot de passe a été réinitialisé par un administrateur.
                            Tu dois le changer avant d'accéder au back-office.
                        </Typography>

                        {error && <Alert severity="error">{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Mot de passe temporaire"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Nouveau mot de passe"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Confirmer le nouveau mot de passe"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        fontWeight: 800,
                                        background: "linear-gradient(90deg, #2563eb 0%, #f97316 100%)",
                                    }}
                                >
                                    {loading ? "Mise à jour en cours..." : "METTRE À JOUR LE MOT DE PASSE"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
