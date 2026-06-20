import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, IconButton, InputAdornment, InputLabel,
    MenuItem, Paper, Select, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Toolbar,
    Tooltip, Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { navigateTo } from "../../utiles/Navigation";
import { useCategories } from "../context/CategoriesContext";
import type { ServiceCategory } from "../../Data/ServiceCategory";
import NotificationDetailDrawer from "./NotificationDetailDrawer";
import AppPagination from "../../components/AppPagination";
import { usePagination } from "../hooks/usePagination";

import {
    cancelAdminNotificationCampaign,
    createAdminNotificationCampaign,
    getAdminNotificationCampaigns,
    sendAdminNotificationCampaign,
} from "../../api/notificationCampaigns";
import {
    getUserNotifications,
    markNotificationRead,
} from "../../api/notifications";

import type {
    SentNotification,
    ReceivedNotification,
    NotificationTarget,
    NotificationChannel,
    NotificationType,
    NotificationPurpose,
} from "../../Data/Notification";
import {getCurrentAdminUser} from "../../api/auth.ts";

const targetLabel: Record<NotificationTarget, string> = {
    all_clients: "Tous les clients",
    all_providers: "Tous les prestataires",
    category_providers: "Prestataires par catégorie",
    specific_user: "Utilisateur spécifique",
};

const channelConfig: Record<NotificationChannel, { label: string; bgcolor: string; color: string; borderColor: string }> = {
    push: { label: "Push", bgcolor: "rgba(100,160,255,0.12)", color: "#6495f0", borderColor: "rgba(100,160,255,0.4)" },
    email: { label: "Email", bgcolor: "rgba(100,200,100,0.12)", color: "#6fcf97", borderColor: "rgba(100,200,100,0.4)" },
    sms: { label: "SMS", bgcolor: "rgba(255,180,50,0.12)", color: "#f2c94c", borderColor: "rgba(255,180,50,0.4)" },
};

const purposeConfig: Record<NotificationPurpose, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
    promotion: { label: "Promotion", color: "secondary" },
    maintenance: { label: "Maintenance", color: "warning" },
    feature: { label: "Nouveauté", color: "primary" },
    cgu: { label: "CGU", color: "default" },
    support: { label: "Support", color: "info" },
};

const statusConfig = {
    sent: { label: "Envoyée", color: "success" as const },
    scheduled: { label: "Planifiée", color: "warning" as const },
    draft: { label: "Brouillon", color: "default" as const },
    failed: { label: "Échouée", color: "error" as const },
    cancelled: { label: "Annulée", color: "default" as const },
};

const typeConfig: Record<NotificationType, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
    booking: { label: "Réservation", color: "primary" },
    payment: { label: "Paiement", color: "success" },
    chat: { label: "Message", color: "info" },
    review: { label: "Avis", color: "secondary" },
    dispute: { label: "Litige", color: "error" },
    account: { label: "Compte", color: "warning" },
    promo: { label: "Promo", color: "secondary" },
    system: { label: "Système", color: "default" },
};

const MOROCCAN_CITIES = [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
    "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
];

const dialogPaperSx = {
    bgcolor: "rgba(10,37,77,0.98)",
    border: "1px solid rgba(147,181,218,0.2)",
    minWidth: 500,
};

const tableSx = {
    bgcolor: "rgba(10,37,77,0.6)",
    border: "1px solid rgba(147,181,218,0.2)",
    borderRadius: 2,
    "& .MuiTableHead-root .MuiTableCell-root": {
        fontWeight: 600,
        color: "text.secondary",
        borderBottom: "1px solid rgba(147,181,218,0.25)",
        bgcolor: "rgba(15,45,90,0.95)",
    },
    "& .MuiTableBody-root .MuiTableRow-root:hover": { bgcolor: "rgba(255,255,255,0.04)" },
    "& .MuiTableCell-root": { borderBottom: "1px solid rgba(147,181,218,0.12)", color: "text.primary" },
};

const chipSx = { fontSize: "0.7rem", height: 20, "& .MuiChip-label": { px: 0.8 } };

type FormState = {
    title: string;
    message: string;
    titleAr: string;
    messageAr: string;
    bilingual: boolean;
    target: NotificationTarget;
    category: string;
    cityFilter: string;
    targetEmail: string;
    purpose: NotificationPurpose | "";
    userName: string;
    channel: NotificationChannel;
    scheduled: boolean;
    scheduledAt: string;
};

const emptyForm: FormState = {
    title: "",
    message: "",
    titleAr: "",
    messageAr: "",
    bilingual: false,
    purpose: "",
    target: "all_clients",
    category: "",
    cityFilter: "",
    targetEmail: "",
    userName: "",
    channel: "push",
    scheduled: false,
    scheduledAt: "",
};

function mapNotificationType(type: string): NotificationType {
    switch (type) {
        case "RESERVATION": return "booking";
        case "PAIEMENT": return "payment";
        case "MESSAGE": return "chat";
        case "AVIS": return "review";
        case "DISPUTE": return "dispute";
        case "ACCOUNT": return "account";
        case "MARKETING":
        case "PROMO": return "promo";
        default: return "system";
    }
}

function mapBackendReceived(item: any): ReceivedNotification {
    return {
        id: String(item.id),
        title: item.title || "Notification",
        message: item.message || item.contenu || "",
        type: mapNotificationType(item.type),
        channel: item.channel || "push",
        triggeredBy: item.triggeredBy || "Système",
        triggeredByRole:
            item.triggeredByRole === "client" || item.triggeredByRole === "provider"
                ? item.triggeredByRole
                : "system",
        triggeredById: item.triggeredById == null ? "0" : String(item.triggeredById),
        read: Boolean(item.read ?? item.vu),
        sentAt: item.sentAt || item.date || new Date().toISOString(),
    };
}

function SentTable({ rows, onDelete, onSend }: {
    rows: SentNotification[];
    onDelete: (n: SentNotification) => void;
    onSend: (n: SentNotification) => void;
}) {
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Titre</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Cible</TableCell>
                        <TableCell align="center">Canal</TableCell>
                        <TableCell align="right">Destinataires</TableCell>
                        <TableCell align="center">Statut</TableCell>
                        <TableCell align="center">Objet</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((n) => {
                        const sc = statusConfig[n.status] ?? statusConfig.sent;
                        const cc = channelConfig[n.channel] ?? channelConfig.push;

                        const dateStr =
                            n.status === "scheduled" && n.scheduledAt
                                ? new Date(n.scheduledAt).toLocaleDateString("fr-FR")
                                : n.sentAt
                                    ? new Date(n.sentAt).toLocaleDateString("fr-FR")
                                    : "—";

                        return (
                            <TableRow key={n.id}>
                                <TableCell>
                                    <Typography fontWeight={600} color="primary.light">{n.title}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography color="text.secondary">{n.message}</Typography>
                                </TableCell>
                                <TableCell>{targetLabel[n.target] ?? "Cible inconnue"}</TableCell>
                                <TableCell align="center">
                                    <Chip label={cc.label} size="small" variant="outlined" sx={{ ...chipSx, bgcolor: cc.bgcolor, color: cc.color, borderColor: cc.borderColor }} />
                                </TableCell>
                                <TableCell align="center">{n.recipientCount ?? "—"}</TableCell>
                                <TableCell align="center">
                                    <Chip label={sc.label} size="small" color={sc.color} variant="outlined" sx={chipSx} />
                                </TableCell>
                                <TableCell align="center">
                                    {n.purpose ? (
                                        <Chip label={purposeConfig[n.purpose].label} size="small" color={purposeConfig[n.purpose].color} variant="outlined" sx={chipSx} />
                                    ) : "—"}
                                </TableCell>
                                <TableCell>{dateStr}</TableCell>
                                <TableCell align="right">
                                    {(n.status === "scheduled" || n.status === "draft") && (
                                        <Tooltip title="Envoyer maintenant">
                                            <IconButton size="small" onClick={() => onSend(n)} sx={{ color: "success.main" }}>
                                                <SendIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {(n.status === "scheduled" || n.status === "draft") && (
                                        <Tooltip title="Annuler">
                                            <IconButton size="small" onClick={() => onDelete(n)} sx={{ color: "error.main" }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function ReceivedTable({ rows, onDelete, onView }: {
    rows: ReceivedNotification[];
    onDelete: (n: ReceivedNotification) => void;
    onView: (n: ReceivedNotification) => void;
}) {
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Message</TableCell>
                        <TableCell>Déclenché par</TableCell>
                        <TableCell align="center">Type</TableCell>
                        <TableCell align="center">Canal</TableCell>
                        <TableCell align="center">Lu</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.map((n) => {
                        const tc = typeConfig[n.type] ?? typeConfig.system;
                        const cc = channelConfig[n.channel] ?? channelConfig.push;

                        return (
                            <TableRow key={n.id}>

                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            maxWidth: 360,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            fontWeight: n.read ? 400 : 600,
                                            color: n.read ? "text.secondary" : "text.primary",
                                        }}
                                    >
                                        {n.read ? "Message consulté" : n.message}
                                    </Typography>
                                </TableCell>
                                <TableCell>{n.triggeredBy}</TableCell>
                                <TableCell align="center">
                                    <Chip label={tc.label} size="small" color={tc.color} variant="outlined" sx={chipSx} />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip label={cc.label} size="small" variant="outlined" sx={{ ...chipSx, bgcolor: cc.bgcolor, color: cc.color, borderColor: cc.borderColor }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                    label={n.read ? "Lu" : "Non lu"}
                                    size="small"
                                    color={n.read ? "default" : "warning"}
                                    variant="outlined"
                                    sx={chipSx}
                                /></TableCell>
                                <TableCell>{new Date(n.sentAt).toLocaleDateString("fr-FR")}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => onView(n)}
                                        sx={{ color: n.read ? "text.secondary" : "primary.light" }}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDelete(n)} sx={{ color: "error.main" }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default function NotificationsPage() {
    const { categories } = useCategories();
    const navigate = useNavigate();
    const location = useLocation();
    const currentAdmin = getCurrentAdminUser();
    const permissions = Array.isArray(currentAdmin?.permissions)
        ? currentAdmin.permissions.map((permission) => String(permission).toUpperCase())
        : [];
    const hasPermission = (permission: string) =>
        permissions.includes("*") || permissions.includes(permission.toUpperCase());
    const canSendNotifications = hasPermission("NOTIFICATIONS_SEND_TARGETED");

    const [sent, setSent] = useState<SentNotification[]>([]);
    const [adminReceived, setAdminReceived] = useState<ReceivedNotification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [notificationsError, setNotificationsError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("notifications");

    const [tab, setTab] = useState<0 | 1>(() => {
        const params = new URLSearchParams(location.search);
        if (!canSendNotifications) return 1;
        return params.get("tab") === "received" || params.get("focus") ? 1 : 0;
    });

    const [sentError, setSentError] = useState("");
    const [receivedError, setReceivedError] = useState("");

    const [search, setSearch] = useState("");

    const focusNotificationId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("focus");
    }, [location.search]);

    const [formOpen, setFormOpen] = useState(false);
    const [deleteSentTarget, setDeleteSentTarget] = useState<SentNotification | null>(null);
    const [deleteRecvTarget, setDeleteRecvTarget] = useState<ReceivedNotification | null>(null);
    const [drawerNotif, setDrawerNotif] = useState<ReceivedNotification | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);

    const unreadReceivedCount = useMemo(
        () => adminReceived.filter((notification) => !notification.read).length,
        [adminReceived]
    );

    const loadNotifications = async () => {
        setLoadingNotifications(true);
        setSentError("");
        setReceivedError("");

        try {
            if (canSendNotifications) {
            try {
                const campaigns = await getAdminNotificationCampaigns();
                setSent(campaigns);
            } catch (error) {
                console.error("Failed to load campaigns", error);
                setSent([]);
                setSentError("Erreur chargement des notifications envoyées.");
            }
            } else {
                setSent([]);
            }

            try {
                if (!currentAdmin?.id) {
                    setAdminReceived([]);
                    setReceivedError("Admin courant introuvable. Reconnectez-vous.");
                    return;
                }

                const received = await getUserNotifications(currentAdmin.id);
                console.log("RECEIVED NOTIFICATIONS:", received);
                setAdminReceived(received.map(mapBackendReceived));
            } catch (error) {
                console.error("Failed to load received notifications", error);
                setAdminReceived([]);
                setReceivedError("Erreur chargement des notifications reçues.");
            }
        } finally {
            setLoadingNotifications(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [canSendNotifications]);

    useEffect(() => {
        if (!canSendNotifications && tab === 0) {
            setTab(1);
        }
    }, [canSendNotifications, tab]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };



    const set = (field: keyof FormState) =>
        (e: ChangeEvent<HTMLInputElement | { value: unknown }>) =>
            setForm((f) => ({ ...f, [field]: (e.target as HTMLInputElement).value }));

    const isValid =
        form.title.trim() &&
        form.message.trim() &&
        form.purpose &&
        (form.target !== "category_providers" || form.category) &&
        (form.target !== "specific_user" || form.targetEmail.trim()) &&
        (!form.scheduled || form.scheduledAt) &&
        (!form.bilingual || (form.titleAr.trim() && form.messageAr.trim()));

    const replaceSent = (saved: SentNotification) => {
        setSent((prev) => prev.map((notification) => notification.id === saved.id ? saved : notification));
    };

    const handleSend = async () => {
        if (!canSendNotifications) return;
        if (!isValid) return;

        try {
            setNotificationsError("");

            const saved = await createAdminNotificationCampaign({
                title: form.title.trim(),
                message: form.message.trim(),
                purpose: form.purpose as NotificationPurpose,
                target: form.target,
                targetEmail: form.target === "specific_user" ? form.targetEmail.trim() : undefined,
                scheduledAt: form.scheduled ? form.scheduledAt : undefined,
                sendNow: !form.scheduled,
            });

            setSent((prev) => [saved, ...prev]);
            setForm(emptyForm);
            setFormOpen(false);
        } catch (err: any) {
            setNotificationsError(err?.response?.data?.message || "Erreur envoi notification");
        }
    };

    const handleSendCampaign = async (notification: SentNotification) => {
        if (!canSendNotifications) return;

        try {
            setNotificationsError("");
            const saved = await sendAdminNotificationCampaign(notification.id);
            replaceSent(saved);
        } catch (err: any) {
            setNotificationsError(err?.response?.data?.message || "Erreur envoi campagne");
        }
    };

    const handleCancelCampaign = async () => {
        if (!canSendNotifications) return;
        if (!deleteSentTarget) return;

        try {
            setNotificationsError("");
            const saved = await cancelAdminNotificationCampaign(deleteSentTarget.id);
            replaceSent(saved);
            setDeleteSentTarget(null);
        } catch (err: any) {
            setNotificationsError(err?.response?.data?.message || "Erreur annulation campagne");
        }
    };

    const handleMarkAllRead = async () => {
        const unread = adminReceived.filter((n) => !n.read);

        await Promise.all(
            unread.map((n) => markNotificationRead(Number(n.id)))
        );

        setAdminReceived((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleMarkOneRead = async (id: string) => {
        await markNotificationRead(Number(id));

        setAdminReceived((prev) =>
            prev.map((n) => n.id === id ? { ...n, read: true } : n)
        );
    };

    const handleDeleteReceived = async (id: string) => {
        setAdminReceived((prev) => prev.filter((n) => n.id !== id));
    };

    const filteredSent = useMemo(() => {
        if (!search.trim()) return sent;
        const q = search.toLowerCase();

        return sent.filter((n) =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q)
        );
    }, [sent, search]);

    const filteredReceived = useMemo(() => {
        if (focusNotificationId) {
            return adminReceived.filter((n) => n.id === focusNotificationId);
        }

        if (!search.trim()) return adminReceived;

        const q = search.toLowerCase();

        return adminReceived.filter((n) =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q) ||
            n.triggeredBy.toLowerCase().includes(q)
        );
    }, [adminReceived, search, focusNotificationId]);

    const {
        paginated: paginatedSent,
        page: pageSent,
        setPage: setPageSent,
        rowsPerPage: rowsPerPageSent,
        setRowsPerPage: setRowsPerPageSent,
        total: totalSent,
    } = usePagination(filteredSent);

    const {
        paginated: paginatedReceived,
        page: pageReceived,
        setPage: setPageReceived,
        rowsPerPage: rowsPerPageReceived,
        setRowsPerPage: setRowsPerPageReceived,
        total: totalReceived,
    } = usePagination(filteredReceived);

    const handleSelect = (id: string) => {
        setSelected(id);
        navigateTo(id, navigate);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                minHeight: "100vh",
                minWidth: 0,
                overflowX: "auto",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
                <Toolbar />

                <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Notifications</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Envois ciblés et suivi des notifications système
                        </Typography>
                    </Box>

                    {canSendNotifications && (
                        <Button variant="contained" startIcon={<SendIcon />} onClick={() => setFormOpen(true)}>
                            Envoyer une notification
                        </Button>
                    )}
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{
                        display: "inline-flex",
                        bgcolor: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(147,181,218,0.15)",
                        borderRadius: 3,
                        p: "4px",
                        gap: "4px",
                    }}>
                        {[
                            { label: "Envoyées", count: null },
                            { label: "Reçues", count: unreadReceivedCount },
                        ].map((t, i) => {
                            if (!canSendNotifications && i === 0) return null;

                            return (
                            <Box
                                key={t.label}
                                onClick={() => { setTab(i as 0 | 1); setSearch(""); }}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: 2.5,
                                    cursor: "pointer",
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    transition: "all 0.2s ease",
                                    bgcolor: tab === i ? "rgba(255,255,255,0.15)" : "transparent",
                                    color: tab === i ? "#ffffff" : "rgba(255,255,255,0.45)",
                                    border: tab === i ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                                    "&:hover": {
                                        color: "rgba(255,255,255,0.85)",
                                        bgcolor: tab === i ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                                    },
                                }}
                            >
                                {t.label}
                                {t.count != null && t.count > 0 && (
                                    <Box sx={{
                                        bgcolor: "#e53935",
                                        color: "#fff",
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        minWidth: 18,
                                        height: 18,
                                        borderRadius: "9px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        px: 0.5,
                                    }}>
                                        {t.count > 99 ? "99+" : t.count}
                                    </Box>
                                )}
                            </Box>
                            );
                        })}
                    </Box>
                </Box>

                {tab === 0 && sentError && (
                    <Typography sx={{ mb: 2, color: "error.main", fontWeight: 700 }}>
                        {sentError}
                    </Typography>
                )}

                {tab === 1 && receivedError && (
                    <Typography sx={{ mb: 2, color: "error.main", fontWeight: 700 }}>
                        {receivedError}
                    </Typography>
                )}

                {notificationsError && (
                    <Typography sx={{ mb: 2, color: "error.main", fontWeight: 700 }}>
                        {notificationsError}
                    </Typography>
                )}
                {loadingNotifications && (
                    <Typography sx={{ mb: 2, color: "text.secondary" }}>
                        Chargement des notifications...
                    </Typography>
                )}

                <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                    <Box sx={{ flex: 1, p: 2, bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2 }}>
                        <TextField
                            placeholder={tab === 0 ? "Rechercher une notification..." : "Rechercher par titre, message, déclencheur..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "text.secondary" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)", "& fieldset": { borderColor: "rgba(147,181,218,0.2)" } } }}
                        />
                    </Box>

                    {tab === 1 && unreadReceivedCount > 0 && (
                        <Tooltip title="Tout marquer comme lu">
                            <Button
                                variant="outlined"
                                startIcon={<DoneAllIcon />}
                                onClick={handleMarkAllRead}
                                sx={{ whiteSpace: "nowrap", borderColor: "rgba(147,181,218,0.3)", color: "text.secondary" }}
                            >
                                Tout lire
                            </Button>
                        </Tooltip>
                    )}
                </Box>
                {tab === 1 && focusNotificationId && (
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/notifications?tab=received")}
                        sx={{ mb: 2 }}
                    >
                        Voir toutes les notifications
                    </Button>
                )}

                {tab === 0 && canSendNotifications ? (
                    <Paper sx={tableSx}>
                        <SentTable rows={paginatedSent} onDelete={setDeleteSentTarget} onSend={handleSendCampaign} />
                        <AppPagination total={totalSent} page={pageSent} rowsPerPage={rowsPerPageSent} onPageChange={setPageSent} onRowsPerPage={setRowsPerPageSent} />
                    </Paper>
                ) : (
                    <Paper sx={tableSx}>
                        <ReceivedTable rows={paginatedReceived} onDelete={setDeleteRecvTarget} onView={async (n) => {
                            if (!n.read) {
                                await handleMarkOneRead(n.id);
                                setDrawerNotif({ ...n, read: true });
                                return;
                            }

                            setDrawerNotif(n);
                        }} />
                        <AppPagination total={totalReceived} page={pageReceived} rowsPerPage={rowsPerPageReceived} onPageChange={setPageReceived} onRowsPerPage={setRowsPerPageReceived} />
                    </Paper>
                )}

                <Dialog open={formOpen} onClose={() => setFormOpen(false)} PaperProps={{ sx: dialogPaperSx }}>
                    <DialogTitle>Envoyer une notification</DialogTitle>

                    <DialogContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                            <FormControl size="small" fullWidth required>
                                <InputLabel>Objet</InputLabel>
                                <Select value={form.purpose} label="Objet" onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value as NotificationPurpose }))}>
                                    <MenuItem value="promotion">Promotion — coupon, offre</MenuItem>
                                    <MenuItem value="maintenance">Maintenance — interruption de service</MenuItem>
                                    <MenuItem value="feature">Nouveauté — nouvelle fonctionnalité</MenuItem>
                                    <MenuItem value="cgu">CGU — mise à jour des conditions</MenuItem>
                                    <MenuItem value="support">Support — réponse individuelle</MenuItem>
                                </Select>
                            </FormControl>

                            <Typography variant="caption" sx={{ color: "rgba(147,181,218,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.65rem", fontWeight: 600 }}>
                                Français
                            </Typography>

                            <TextField label="Titre (FR)" size="small" fullWidth value={form.title} onChange={set("title")} />
                            <TextField label="Message (FR)" size="small" fullWidth multiline rows={3} value={form.message} onChange={set("message")} />

                            <FormControl size="small" fullWidth>
                                <InputLabel>Cible</InputLabel>
                                <Select value={form.target} label="Cible" onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as NotificationTarget, category: "", cityFilter: "", userId: "", userName: "" }))}>
                                    <MenuItem value="all_clients">Tous les clients</MenuItem>
                                    <MenuItem value="all_providers">Tous les prestataires</MenuItem>
                                    <MenuItem value="category_providers">Prestataires par catégorie</MenuItem>
                                    <MenuItem value="specific_user">Utilisateur spécifique</MenuItem>
                                </Select>
                            </FormControl>

                            {form.target === "category_providers" && (
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Catégorie</InputLabel>
                                    <Select value={form.category} label="Catégorie" onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                                        {categories.map((c: ServiceCategory) => (
                                            <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {form.target === "specific_user" && (
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        label="Email utilisateur"
                                        size="small"
                                        fullWidth
                                        value={form.targetEmail}
                                        onChange={set("targetEmail")}
                                        placeholder="exemple@email.com"
                                    />
                                    <TextField
                                        label="Nom (optionnel)"
                                        size="small"
                                        fullWidth
                                        value={form.userName}
                                        onChange={set("userName")}
                                    />
                                </Box>
                            )}

                            {(form.target === "all_clients" || form.target === "all_providers" || form.target === "category_providers") && (
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Ville (optionnel)</InputLabel>
                                    <Select value={form.cityFilter} label="Ville (optionnel)" onChange={(e) => setForm((f) => ({ ...f, cityFilter: e.target.value }))}>
                                        <MenuItem value="">Toutes les villes</MenuItem>
                                        {MOROCCAN_CITIES.map((c) => (
                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl size="small" fullWidth>
                                <InputLabel>Canal</InputLabel>
                                <Select value={form.channel} label="Canal" onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as NotificationChannel }))}>
                                    <MenuItem value="push">Push notification</MenuItem>
                                    <MenuItem value="email">Email</MenuItem>
                                    <MenuItem value="sms">SMS — critique uniquement</MenuItem>
                                </Select>
                            </FormControl>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Button
                                    size="small"
                                    variant={form.scheduled ? "contained" : "outlined"}
                                    startIcon={<ScheduleIcon />}
                                    onClick={() => setForm((f) => ({ ...f, scheduled: !f.scheduled, scheduledAt: "" }))}
                                >
                                    Planifier
                                </Button>

                                {form.scheduled && (
                                    <TextField type="datetime-local" size="small" fullWidth value={form.scheduledAt} onChange={set("scheduledAt")} />
                                )}
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => { setFormOpen(false); setForm(emptyForm); }}>Annuler</Button>
                        <Button variant="contained" startIcon={form.scheduled ? <ScheduleIcon /> : <SendIcon />} onClick={handleSend} disabled={!isValid}>
                            {form.scheduled ? "Planifier" : "Envoyer"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={Boolean(deleteSentTarget)} onClose={() => setDeleteSentTarget(null)} PaperProps={{ sx: { ...dialogPaperSx, minWidth: 380 } }}>
                    <DialogTitle>Annuler la campagne ?</DialogTitle>
                    <DialogContent>
                        <Typography color="text.secondary">
                            Annuler <strong>"{deleteSentTarget?.title}"</strong> ?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDeleteSentTarget(null)}>Annuler</Button>
                        <Button variant="contained" color="error" onClick={handleCancelCampaign}>Confirmer</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={Boolean(deleteRecvTarget)} onClose={() => setDeleteRecvTarget(null)} PaperProps={{ sx: { ...dialogPaperSx, minWidth: 380 } }}>
                    <DialogTitle>Supprimer de l'historique ?</DialogTitle>
                    <DialogContent>
                        <Typography color="text.secondary">
                            Supprimer <strong>"{deleteRecvTarget?.title}"</strong> de l'historique des reçues ?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDeleteRecvTarget(null)}>Annuler</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={async () => {
                                if (!deleteRecvTarget) return;
                                await handleDeleteReceived(deleteRecvTarget.id);
                                setDeleteRecvTarget(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            <NotificationDetailDrawer
                notification={drawerNotif}
                onClose={() => setDrawerNotif(null)}
                onDelete={async (id) => {
                    await handleDeleteReceived(id);
                    setDrawerNotif(null);
                }}
                onMarkRead={async (id) => {
                    await handleMarkOneRead(id);
                    setDrawerNotif((n) => n ? { ...n, read: true } : null);
                }}
            />
        </Box>
    );
}
