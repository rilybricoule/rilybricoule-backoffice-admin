import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slider,
    Snackbar,
    Switch,
    Toolbar,
    Typography,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { useNavigate } from "react-router-dom";
import { navigateTo } from "../../utiles/Navigation";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { getAdminSettings, updateAdminSettings, type AdminSettingsApi } from "../../api/settings";

type SavedKey = "commission" | "gateways" | "regional" | "cancel" | null;

const cardSx = {
    p: 3,
    mb: 2.5,
    borderRadius: 3,
    bgcolor: "rgba(10,37,77,0.58)",
    border: "1px solid rgba(147,181,218,0.15)",
};

export default function ParametresPage() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("settings");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState<SavedKey>(null);
    const [toastOpen, setToastOpen] = useState(false);
    const [settings, setSettings] = useState<AdminSettingsApi>({
        globalRate: 15,
        usePerCategory: true,
        categories: [],
        gateways: [],
        currency: "MAD",
        language: "fr",
        timezone: "Africa/Casablanca",
        dateFormat: "DD/MM/YYYY",
        cancelWindow: 24,
        cancelFeePercent: 20,
        freeCancelWindow: 48,
        autoRefund: true,
        refundDelay: "5",
    });

    useEffect(() => {
        let mounted = true;

        async function loadSettings() {
            try {
                setLoading(true);
                setError("");
                const data = await getAdminSettings();
                if (mounted) setSettings(data);
            } catch (err: any) {
                if (mounted) {
                    setError(err?.response?.data?.message || "Erreur chargement parametres");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        void loadSettings();
        return () => {
            mounted = false;
        };
    }, []);

    const patchSettings = (updates: Partial<AdminSettingsApi>) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    };

    const saveSettings = async (section: SavedKey) => {
        if (!section) return;
        try {
            setError("");
            const response = await updateAdminSettings(settings);
            setSettings(response);
            setSaved(section);
            setToastOpen(true);
            setTimeout(() => setSaved(null), 2500);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur sauvegarde parametres");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={(id) => { setSelected(id); navigateTo(id, navigate); }} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    minHeight: "100vh",
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Toolbar />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                        Parametres
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configuration globale de la plateforme RiLyBricoule
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Typography color="text.secondary">Chargement des parametres...</Typography>
                ) : (
                    <>
                        <Paper sx={cardSx}>
                            <Typography fontWeight={700} sx={{ mb: 2 }}>Commission & Tarification</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Taux global par defaut: {settings.globalRate}%
                            </Typography>
                            <Slider
                                value={settings.globalRate}
                                min={5}
                                max={35}
                                step={1}
                                onChange={(_, value) => patchSettings({ globalRate: value as number })}
                            />
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">Activer taux par categorie</Typography>
                                <Switch
                                    checked={settings.usePerCategory}
                                    onChange={(e) => patchSettings({ usePerCategory: e.target.checked })}
                                />
                            </Box>
                            {settings.usePerCategory && (
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mt: 2 }}>
                                    {settings.categories.map((category) => (
                                        <Box key={category.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(255,255,255,0.03)" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                                <Typography fontWeight={600}>{category.label}</Typography>
                                                <Chip label={`${category.rate}%`} size="small" />
                                            </Box>
                                            <Slider
                                                size="small"
                                                value={category.rate}
                                                min={5}
                                                max={35}
                                                step={1}
                                                onChange={(_, value) =>
                                                    patchSettings({
                                                        categories: settings.categories.map((item) =>
                                                            item.id === category.id ? { ...item, rate: value as number } : item
                                                        ),
                                                    })
                                                }
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <Button
                                sx={{ mt: 2 }}
                                variant="outlined"
                                startIcon={<SaveOutlinedIcon />}
                                onClick={() => void saveSettings("commission")}
                            >
                                {saved === "commission" ? "Saved" : "Enregistrer"}
                            </Button>
                        </Paper>

                        <Paper sx={cardSx}>
                            <Typography fontWeight={700} sx={{ mb: 2 }}>Passerelles de paiement</Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                {settings.gateways.map((gateway) => (
                                    <Box
                                        key={gateway.id}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "rgba(255,255,255,0.03)",
                                        }}
                                    >
                                        <Box>
                                            <Typography fontWeight={600}>{gateway.label}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {gateway.description}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                            {gateway.id !== "cash" && gateway.enabled && (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Mode test</Typography>
                                                    <Switch
                                                        checked={gateway.testMode}
                                                        onChange={() =>
                                                            patchSettings({
                                                                gateways: settings.gateways.map((item) =>
                                                                    item.id === gateway.id ? { ...item, testMode: !item.testMode } : item
                                                                ),
                                                            })
                                                        }
                                                    />
                                                </Box>
                                            )}
                                            <Switch
                                                checked={gateway.enabled}
                                                onChange={() =>
                                                    patchSettings({
                                                        gateways: settings.gateways.map((item) =>
                                                            item.id === gateway.id ? { ...item, enabled: !item.enabled } : item
                                                        ),
                                                    })
                                                }
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <Button
                                sx={{ mt: 2 }}
                                variant="outlined"
                                startIcon={<SaveOutlinedIcon />}
                                onClick={() => void saveSettings("gateways")}
                            >
                                {saved === "gateways" ? "Saved" : "Enregistrer"}
                            </Button>
                        </Paper>

                        <Paper sx={cardSx}>
                            <Typography fontWeight={700} sx={{ mb: 2 }}>Parametres regionaux</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                                <FormControl size="small">
                                    <InputLabel>Devise</InputLabel>
                                    <Select
                                        value={settings.currency}
                                        label="Devise"
                                        onChange={(e) => patchSettings({ currency: e.target.value })}
                                    >
                                        <MenuItem value="MAD">MAD</MenuItem>
                                        <MenuItem value="EUR">EUR</MenuItem>
                                        <MenuItem value="USD">USD</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small">
                                    <InputLabel>Langue</InputLabel>
                                    <Select
                                        value={settings.language}
                                        label="Langue"
                                        onChange={(e) => patchSettings({ language: e.target.value })}
                                    >
                                        <MenuItem value="fr">Francais</MenuItem>
                                        <MenuItem value="ar">Arabe</MenuItem>
                                        <MenuItem value="fr-ar">FR / AR</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small">
                                    <InputLabel>Fuseau horaire</InputLabel>
                                    <Select
                                        value={settings.timezone}
                                        label="Fuseau horaire"
                                        onChange={(e) => patchSettings({ timezone: e.target.value })}
                                    >
                                        <MenuItem value="Africa/Casablanca">Africa/Casablanca</MenuItem>
                                        <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                                        <MenuItem value="UTC">UTC</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small">
                                    <InputLabel>Format date</InputLabel>
                                    <Select
                                        value={settings.dateFormat}
                                        label="Format date"
                                        onChange={(e) => patchSettings({ dateFormat: e.target.value })}
                                    >
                                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Button
                                sx={{ mt: 2 }}
                                variant="outlined"
                                startIcon={<SaveOutlinedIcon />}
                                onClick={() => void saveSettings("regional")}
                            >
                                {saved === "regional" ? "Saved" : "Enregistrer"}
                            </Button>
                        </Paper>

                        <Paper sx={cardSx}>
                            <Typography fontWeight={700} sx={{ mb: 2 }}>Politique d'annulation</Typography>

                            <Typography variant="body2" color="text.secondary">
                                Annulation gratuite: {settings.freeCancelWindow}h
                            </Typography>
                            <Slider
                                value={settings.freeCancelWindow}
                                min={1}
                                max={72}
                                step={1}
                                onChange={(_, value) => patchSettings({ freeCancelWindow: value as number })}
                            />

                            <Typography variant="body2" color="text.secondary">
                                Delai avec frais: {settings.cancelWindow}h
                            </Typography>
                            <Slider
                                value={settings.cancelWindow}
                                min={1}
                                max={48}
                                step={1}
                                onChange={(_, value) => patchSettings({ cancelWindow: value as number })}
                            />

                            <Typography variant="body2" color="text.secondary">
                                Frais d'annulation: {settings.cancelFeePercent}%
                            </Typography>
                            <Slider
                                value={settings.cancelFeePercent}
                                min={0}
                                max={100}
                                step={5}
                                onChange={(_, value) => patchSettings({ cancelFeePercent: value as number })}
                            />

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">Remboursement automatique</Typography>
                                <Switch
                                    checked={settings.autoRefund}
                                    onChange={(e) => patchSettings({ autoRefund: e.target.checked })}
                                />
                            </Box>

                            {settings.autoRefund && (
                                <FormControl size="small" sx={{ mt: 2, minWidth: 220 }}>
                                    <InputLabel>Delai remboursement</InputLabel>
                                    <Select
                                        value={settings.refundDelay}
                                        label="Delai remboursement"
                                        onChange={(e) => patchSettings({ refundDelay: e.target.value })}
                                    >
                                        <MenuItem value="1">1 jour</MenuItem>
                                        <MenuItem value="3">3 jours</MenuItem>
                                        <MenuItem value="5">5 jours</MenuItem>
                                        <MenuItem value="7">7 jours</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            <Button
                                sx={{ mt: 2 }}
                                variant="outlined"
                                startIcon={<SaveOutlinedIcon />}
                                onClick={() => void saveSettings("cancel")}
                            >
                                {saved === "cancel" ? "Saved" : "Enregistrer"}
                            </Button>
                        </Paper>
                    </>
                )}
            </Box>

            <Snackbar
                open={toastOpen}
                autoHideDuration={2500}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    severity="success"
                    icon={<CheckCircleOutlineIcon />}
                    onClose={() => setToastOpen(false)}
                    sx={{
                        bgcolor: "rgba(15,23,42,0.95)",
                        color: "#4ade80",
                        border: "1px solid rgba(74,222,128,0.3)",
                        borderRadius: "12px",
                        "& .MuiAlert-icon": { color: "#4ade80" },
                    }}
                >
                    Parametres enregistres
                </Alert>
            </Snackbar>
        </Box>
    );
}
