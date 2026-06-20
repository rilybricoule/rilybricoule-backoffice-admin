import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
    Chip,
} from "@mui/material";
import AdminLayout from "../components/AdminLayout";
import { disableMy2FA, enableMy2FA, setupMy2FA, type TwoFASetupResponse } from "../api/auth";

export default function TwoFASetupPage() {
    const [data, setData] = React.useState<TwoFASetupResponse | null>(null);
    const [code, setCode] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const loadSetup = React.useCallback(async () => {
        setError(null);
        setSuccess(null);
        try {
            setLoading(true);
            const setup = await setupMy2FA();
            setData(setup);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Impossible de charger la configuration 2FA.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadSetup();
    }, [loadSetup]);

    const handleEnable = async () => {
        setError(null);
        setSuccess(null);
        try {
            setLoading(true);
            await enableMy2FA(code.trim());
            setSuccess("2FA activée avec succès.");
            setCode("");
            await loadSetup();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Code invalide.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        setError(null);
        setSuccess(null);
        try {
            setLoading(true);
            await disableMy2FA(code.trim());
            setSuccess("2FA désactivée avec succès.");
            setCode("");
            await loadSetup();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Code invalide.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout selected="settings">
            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "rgba(10,37,77,0.75)",
                    border: "1px solid rgba(147,181,218,0.22)",
                    maxWidth: 760,
                }}
            >
                <Stack spacing={2.2}>
                    <Typography variant="h5" fontWeight={700}>
                        Configuration 2FA
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Scannez le QR code avec Google Authenticator, puis validez un code à 6 chiffres.
                    </Typography>

                    {data && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={`Compte: ${data.email}`} size="small" />
                            <Chip
                                label={data.enabled ? "2FA activée" : "2FA désactivée"}
                                color={data.enabled ? "success" : "warning"}
                                size="small"
                            />
                        </Stack>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}

                    {data?.qrCodeBase64 && (
                        <Box
                            component="img"
                            src={`data:image/png;base64,${data.qrCodeBase64}`}
                            alt="QR 2FA"
                            sx={{
                                width: 220,
                                height: 220,
                                p: 1,
                                borderRadius: 2,
                                bgcolor: "#fff",
                                border: "1px solid rgba(147,181,218,0.35)",
                            }}
                        />
                    )}

                    {data?.secret && (
                        <Typography variant="body2">
                            Clé manuelle: <strong>{data.secret}</strong>
                        </Typography>
                    )}

                    <TextField
                        label="Code 2FA (6 chiffres)"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="123456"
                        sx={{ maxWidth: 280 }}
                    />

                    <Stack direction="row" spacing={1.2}>
                        <Button
                            variant="contained"
                            onClick={handleEnable}
                            disabled={loading || code.length !== 6}
                        >
                            Activer 2FA
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDisable}
                            disabled={loading || code.length !== 6}
                        >
                            Désactiver 2FA
                        </Button>
                        <Button variant="text" onClick={loadSetup} disabled={loading}>
                            Recharger QR
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </AdminLayout>
    );
}
