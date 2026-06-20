import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Snackbar,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { navigateTo } from "../../utiles/Navigation";
import { useNavigate } from "react-router-dom";
import { fetchAdminById, fetchAdmins, updateAdmin, type AdminAccount } from "../../api/adminAccounts";
import { getCurrentAdminUser } from "../../api/auth";

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

const cardSx = {
    p: 3,
    borderRadius: 3,
    bgcolor: "rgba(10,37,77,0.58)",
    border: "1px solid rgba(147,181,218,0.15)",
};

function avatarColor(letter: string) {
    const palette = [
        "rgba(47,124,201,0.9)",
        "rgba(99,102,241,0.9)",
        "rgba(16,185,129,0.9)",
        "rgba(245,158,11,0.9)",
        "rgba(239,68,68,0.9)",
        "rgba(236,72,153,0.9)",
    ];
    return palette[letter.charCodeAt(0) % palette.length];
}

function formatRole(roleName: string) {
    return roleName
        .replace(/^ROLE_/, "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const permissionLabels: Record<string, string> = {
    DASHBOARD_VIEW: "Voir le dashboard",
    CLIENTS_VIEW: "Consulter les clients",
    CLIENTS_EDIT: "Modifier les clients",
    PROVIDERS_VIEW: "Consulter les prestataires",
    PROVIDERS_APPROVE: "Approuver les prestataires",
    PROVIDERS_SUSPEND: "Suspendre les prestataires",
    RESERVATIONS_VIEW: "Consulter les reservations",
    RESERVATIONS_INTERVENE: "Intervenir sur les reservations",
    PAYMENTS_VIEW: "Consulter les paiements",
    CATEGORIES_VIEW: "Consulter les categories",
    CONTENT_VIEW: "Consulter le contenu",
    CONTENT_MODERATE: "Moderer le contenu",
    PROMOS_VIEW: "Consulter les promotions",
    NOTIFICATIONS_SEND_TARGETED: "Envoyer des notifications ciblees",
    TICKETS_VIEW: "Consulter les tickets support",
    TICKETS_RESPOND: "Repondre aux tickets",
    TICKETS_MANAGE: "Gerer les tickets",
    ADMINS_VIEW: "Consulter les comptes admin",
    SETTINGS_VIEW: "Consulter les parametres",
    AUDIT_VIEW_OWN: "Voir son historique d'audit",
    "*": "Acces complet",
};

function prettifyPermission(permission: string) {
    return permissionLabels[permission] ?? permission.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function AdminProfilePage() {
    const navigate = useNavigate();
    const currentAdmin = getCurrentAdminUser();
    const adminId = currentAdmin?.id;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [toastOpen, setToastOpen] = useState(false);
    const [admin, setAdmin] = useState<AdminAccount | null>(null);
    const [form, setForm] = useState<FormState>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            if (!adminId) {
                try {
                    const email = currentAdmin?.email;
                    if (!email) {
                        if (mounted) {
                            setError("Admin ID introuvable. Reconnectez-vous.");
                            setLoading(false);
                        }
                        return;
                    }

                    const admins = await fetchAdmins();
                    const matched = admins.find((item) => item.email === email);

                    if (!matched) {
                        if (mounted) {
                            setError("Admin ID introuvable. Reconnectez-vous.");
                            setLoading(false);
                        }
                        return;
                    }

                    if (!mounted) return;

                    setAdmin(matched);
                    setForm({
                        firstName: matched.firstName ?? "",
                        lastName: matched.lastName ?? "",
                        email: matched.email ?? "",
                        phone: matched.phone ?? "",
                    });
                    setLoading(false);
                } catch (err: any) {
                    if (mounted) {
                        setError(err?.response?.data?.message || "Admin ID introuvable. Reconnectez-vous.");
                        setLoading(false);
                    }
                }
                return;
            }

            try {
                setLoading(true);
                setError("");
                const data = await fetchAdminById(adminId);

                if (!mounted) return;

                setAdmin(data);
                setForm({
                    firstName: data.firstName ?? "",
                    lastName: data.lastName ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                });
            } catch (err: any) {
                if (mounted) {
                    setError(err?.response?.data?.message || "Erreur chargement profil admin");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, [adminId]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const initials = useMemo(() => {
        const name = `${form.firstName} ${form.lastName}`.trim() || currentAdmin?.email || "A";
        return name.charAt(0).toUpperCase();
    }, [form.firstName, form.lastName, currentAdmin?.email]);

    const handleChange =
        (key: keyof FormState) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setForm((prev) => ({ ...prev, [key]: event.target.value }));
        };

    const effectiveAdminId = admin?.id ?? adminId;

    const handleSave = async () => {
        if (!effectiveAdminId) return;

        try {
            setSaving(true);
            setError("");

            const updated = await updateAdmin(effectiveAdminId, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
            });

            setAdmin(updated);
            setToastOpen(true);

            const storage =
                localStorage.getItem("authStorage") === "local"
                    ? localStorage
                    : sessionStorage.getItem("authStorage") === "session"
                        ? sessionStorage
                        : null;

            if (storage) {
                const raw = storage.getItem("adminUser");
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw) as Record<string, unknown>;
                        parsed.firstName = updated.firstName;
                        parsed.lastName = updated.lastName;
                        parsed.email = updated.email;
                        storage.setItem("adminUser", JSON.stringify(parsed));
                    } catch {
                        // ignore storage sync issues
                    }
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur sauvegarde profil");
        } finally {
            setSaving(false);
        }
    };

    const profileCompletion = useMemo(() => {
        const fields = [
            form.firstName.trim(),
            form.lastName.trim(),
            form.email.trim(),
            form.phone.trim(),
        ];

        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }, [form.firstName, form.lastName, form.email, form.phone]);

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((value) => !value)} onLogout={handleLogout} />
            <Sidebar
                open={sidebarOpen}
                selected={selected}
                onSelect={(id) => {
                    setSelected(id);
                    navigateTo(id, navigate);
                }}
            />

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
                        Mon Profil
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Informations personnelles et acces de votre compte administrateur
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Typography color="text.secondary">Chargement du profil...</Typography>
                ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" }, gap: 2.5 }}>
                        <Paper sx={cardSx}>
                            <Typography fontWeight={700} sx={{ mb: 2.5 }}>
                                Informations personnelles
                            </Typography>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                <TextField
                                    label="Prenom"
                                    value={form.firstName}
                                    onChange={handleChange("firstName")}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Nom"
                                    value={form.lastName}
                                    onChange={handleChange("lastName")}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Email"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Telephone"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    fullWidth
                                    size="small"
                                />
                            </Box>

                            <Box sx={{ mt: 2.5, display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => void handleSave()}
                                    disabled={saving}
                                >
                                    {saving ? "Enregistrement..." : "Enregistrer"}
                                </Button>
                            </Box>

                            <Box sx={{ mt: 3 }}>
                                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)", mb: 2 }} />
                                <Typography fontWeight={700} sx={{ mb: 1.2 }}>
                                    Resume du profil
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                    <Chip
                                        size="small"
                                        color={profileCompletion === 100 ? "success" : "warning"}
                                        label={`Profil complet a ${profileCompletion}%`}
                                        variant="outlined"
                                    />
                                    <Chip
                                        size="small"
                                        color={admin?.enabled ? "success" : "default"}
                                        label={admin?.enabled ? "Compte actif" : "Compte desactive"}
                                        variant="outlined"
                                    />
                                    <Chip
                                        size="small"
                                        color={admin?.twoFAEnabled ? "success" : "warning"}
                                        label={admin?.twoFAEnabled ? "2FA active" : "2FA desactivee"}
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                        </Paper>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                            <Paper sx={cardSx}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 68,
                                            height: 68,
                                            bgcolor: avatarColor(initials),
                                            fontSize: 28,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {initials}
                                    </Avatar>

                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {`${form.firstName} ${form.lastName}`.trim() || "Admin"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {admin?.email}
                                        </Typography>
                                        {admin && (
                                            <Chip
                                                size="small"
                                                label={formatRole(admin.roleName)}
                                                sx={{ mt: 1, fontWeight: 600 }}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Paper>

                            <Paper sx={cardSx}>
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Securite et acces
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <SecurityRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                            2FA: {admin?.twoFAEnabled ? "Active" : "Desactivee"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <BadgeRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                            Role: {admin ? formatRole(admin.roleName) : "-"}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <MailOutlineRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">{admin?.email || "-"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <PhoneRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">{admin?.phone || "Non renseigne"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <VerifiedUserRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                            Statut: {admin?.enabled ? "Compte actif" : "Compte desactive"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            <Paper sx={cardSx}>
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Informations du compte
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <CalendarMonthRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                            Cree le: {formatDate(admin?.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <AccessTimeRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                            Derniere mise a jour: {formatDate(admin?.updatedAt)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                        <VpnKeyRoundedIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                            Niveau d'acces: {admin?.permissions?.includes("*") ? "Complet" : "Limite au role"}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mt: 2.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => navigate("/change-password-required", { state: { email: admin?.email ?? "" } })}
                                    >
                                        Changer mot de passe
                                    </Button>
                                    {admin?.roleName === "ROLE_SUPER_ADMIN" && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => navigate("/settings/2fa")}
                                        >
                                            Gerer le 2FA
                                        </Button>
                                    )}
                                </Box>
                            </Paper>

                            <Paper sx={cardSx}>
                                <Typography fontWeight={700} sx={{ mb: 2 }}>
                                    Permissions
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    Vos permissions sont affichees avec des libelles plus lisibles pour mieux comprendre votre perimetre d'action.
                                </Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {admin?.permissions?.length ? (
                                        admin.permissions.map((permission) => (
                                            <Chip
                                                key={permission}
                                                label={prettifyPermission(permission)}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                                color={permission === "*" ? "success" : "default"}
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Aucune permission chargee.
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
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
                    Profil admin mis a jour
                </Alert>
            </Snackbar>
        </Box>
    );
}
