import { useMemo, useState, type MouseEvent } from "react";
import {
    Alert,
    Avatar,
    Box,
    IconButton,
    InputAdornment,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AdminLayout from "../../components/AdminLayout";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";
import StarIcon from "@mui/icons-material/Star";
import BuildIcon from "@mui/icons-material/Build";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useNavigate } from "react-router-dom";
import AppPagination from "../../components/AppPagination";
import { usePagination } from "../hooks/usePagination";
import { useMessages } from "../context/MessagesContext";
import type { AdminProvider, ProviderStatus } from "../../api/providers";
import { getCurrentAdminUser } from "../../api/auth";
import { openAdminChat } from "../../api/chats";
import { useProviders } from "../context/ProviderContext";

const statusConfig: Record<ProviderStatus, {
    label: string;
    color: string;
    bg: string;
    border: string;
}> = {
    pending: { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
    approved: { label: "Approuve", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
    suspended: { label: "Suspendu", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
    rejected: { label: "Rejete", color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
};

const avatarColors = [
    "#2F7CC9", "#F08A2F", "#22c55e", "#ef4444",
    "#a855f7", "#06b6d4", "#f59e0b", "#ec4899",
];

type TabKey = "all" | ProviderStatus;

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Tous", icon: <VisibilityIcon sx={{ fontSize: 15 }} /> },
    { key: "pending", label: "En attente", icon: <HourglassEmptyIcon sx={{ fontSize: 15 }} /> },
    { key: "approved", label: "Approuves", icon: <ThumbUpIcon sx={{ fontSize: 15 }} /> },
    { key: "suspended", label: "Suspendus", icon: <PauseCircleIcon sx={{ fontSize: 15 }} /> },
    { key: "rejected", label: "Rejetes", icon: <HighlightOffIcon sx={{ fontSize: 15 }} /> },
];

function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getProviderFullName(provider: AdminProvider) {
    const fullName = `${provider.firstName ?? ""} ${provider.lastName ?? ""}`.trim();
    return fullName || provider.name || provider.businessName || provider.email;
}

function getProviderInitials(provider: AdminProvider) {
    return getProviderFullName(provider)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function tabBadgeColor(key: TabKey) {
    if (key === "pending") return { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" };
    if (key === "approved") return { color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" };
    if (key === "suspended") return { color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)" };
    if (key === "rejected") return { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.25)" };
    return { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.25)" };
}

export default function ProviderPage() {
    const navigate = useNavigate();
    const { openChat, refreshMessages } = useMessages();

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [actionError, setActionError] = useState("");

    const {
        providers,
        loadingProviders,
        providersError,
        updateProviderStatus,
    } = useProviders();

    const counts = useMemo(() => ({
        all: providers.length,
        pending: providers.filter((p) => p.status === "pending").length,
        approved: providers.filter((p) => p.status === "approved").length,
        suspended: providers.filter((p) => p.status === "suspended").length,
        rejected: providers.filter((p) => p.status === "rejected").length,
    }), [providers]);

    const filtered = useMemo(() => {
        const tabKey = TABS[activeTab].key;

        let list = tabKey === "all"
            ? [...providers]
            : providers.filter((provider) => provider.status === tabKey);

        const query = search.toLowerCase().trim();

        if (query) {
            list = list.filter((provider) =>
                getProviderFullName(provider).toLowerCase().includes(query) ||
                provider.email.toLowerCase().includes(query) ||
                (provider.phone?.toLowerCase().includes(query) ?? false) ||
                (provider.businessName?.toLowerCase().includes(query) ?? false) ||
                (provider.city?.toLowerCase().includes(query) ?? false)
            );
        }

        return list;
    }, [providers, activeTab, search]);

    const {
        paginated: paginatedProviders,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        total,
    } = usePagination(filtered);

    const handleUpdateProviderStatus = async (
        id: number,
        action: "approve" | "reject" | "suspend" | "reactivate"
    ) => {
        try {
            setActionError("");
            await updateProviderStatus(id, action);
        } catch (err: any) {
            setActionError(
                err?.response?.data?.message || "Erreur changement statut prestataire"
            );
        }
    };

    const handleMessageProvider = async (event: MouseEvent, provider: AdminProvider) => {
        event.stopPropagation();

        const admin = getCurrentAdminUser();
        if (!admin?.id) {
            setActionError("Impossible d'ouvrir la conversation: admin introuvable");
            return;
        }

        try {
            const chat = await openAdminChat({
                adminId: admin.id,
                prestataireId: provider.id,
            });

            openChat({
                id: String(chat.chatId),
                providerName: getProviderFullName(provider),
                avatar: getProviderInitials(provider) || "P",
                providerId: String(provider.id),
                receiverId: String(provider.id),
            });

            void refreshMessages();
        } catch (error) {
            console.error("Failed to open provider chat", error);
            setActionError("Impossible d'ouvrir la conversation prestataire");
        }
    };

    return (
        <AdminLayout selected="providers">
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{
                    fontWeight: 800,
                    background: "linear-gradient(90deg, #f8fafc 0%, #f08a2f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>
                    Gestion des prestataires
                </Typography>

                <Box sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    mt: 1,
                    px: 1.25,
                    py: 0.4,
                    bgcolor: "rgba(240,138,47,0.12)",
                    border: "1px solid rgba(240,138,47,0.25)",
                    borderRadius: 20,
                }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#f08a2f", boxShadow: "0 0 6px rgba(240,138,47,0.8)" }} />
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#f08a2f", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                        {providers.length} prestataires
                    </Typography>
                </Box>
            </Box>

            {(providersError || actionError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {providersError || actionError}
                </Alert>
            )}

            <Box sx={{
                p: 2,
                mb: 2,
                bgcolor: "rgba(10,37,77,0.6)",
                border: "1px solid rgba(147,181,218,0.2)",
                borderRadius: 2,
            }}>
                <TextField
                    fullWidth
                    placeholder="Rechercher par nom, email, telephone, ville, entreprise..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(0,0,0,0.2)",
                            "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                        },
                    }}
                />
            </Box>

            <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                sx={{
                    mb: 2,
                    borderBottom: "1px solid rgba(56,189,248,0.2)",
                    "& .MuiTabs-indicator": { bgcolor: "#38bdf8", height: 3, borderRadius: 3 },
                }}
            >
                {TABS.map((tab) => {
                    const count = counts[tab.key];
                    const badge = tabBadgeColor(tab.key);

                    return (
                        <Tab
                            key={tab.key}
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    {tab.icon}
                                    {tab.label}
                                    {count > 0 && (
                                        <Box sx={{
                                            px: 0.8,
                                            py: 0.1,
                                            borderRadius: 999,
                                            bgcolor: badge.bg,
                                            border: `1px solid ${badge.border}`,
                                        }}>
                                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: badge.color }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            }
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: 13,
                                minHeight: 44,
                                color: "rgba(226,232,240,0.6)",
                                "&.Mui-selected": { color: "#38bdf8" },
                            }}
                        />
                    );
                })}
            </Tabs>

            {loadingProviders ? (
                <Alert severity="info">Chargement des prestataires...</Alert>
            ) : filtered.length === 0 ? (
                <Box sx={{ mt: 6, textAlign: "center" }}>
                    <Typography color="text.secondary">Aucun prestataire trouve</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{
                    bgcolor: "rgba(10,37,77,0.6)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    borderRadius: 2,
                    maxHeight: 560,
                    "& .MuiTableHead-root .MuiTableCell-root": {
                        fontWeight: 700,
                        color: "rgba(148,175,218,0.85)",
                        fontSize: "0.72rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(56,189,248,0.2)",
                        py: 1.5,
                        bgcolor: "rgba(15,45,90,0.95)",
                    },
                    "& .MuiTableBody-root .MuiTableRow-root": {
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                    },
                    "& .MuiTableCell-root": {
                        borderBottom: "1px solid rgba(147,181,218,0.1)",
                        color: "text.primary",
                        px: 1.5,
                        py: 1,
                    },
                }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell sx={{ width: 180 }}>Email</TableCell>
                                <TableCell sx={{ width: 110 }}>Tel.</TableCell>
                                <TableCell sx={{ width: 100 }}>Ville</TableCell>
                                <TableCell sx={{ width: 120 }}>Perf.</TableCell>
                                <TableCell sx={{ width: 95 }}>Inscr.</TableCell>
                                <TableCell sx={{ width: 90 }}>Statut</TableCell>
                                <TableCell align="right" sx={{ width: 110 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedProviders.map((provider) => {
                                const cfg = statusConfig[provider.status];
                                const fullName = getProviderFullName(provider);
                                const avatarBg = getAvatarColor(fullName);

                                return (
                                    <TableRow key={provider.id}>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                <Avatar sx={{
                                                    width: 34,
                                                    height: 34,
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    bgcolor: avatarBg,
                                                    border: `1px solid ${avatarBg}55`,
                                                    flexShrink: 0,
                                                }}>
                                                    {getProviderInitials(provider)}
                                                </Avatar>

                                                <Box>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                                            {fullName}
                                                        </Typography>
                                                        <Tooltip title="Envoyer un message">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(event) => void handleMessageProvider(event, provider)}
                                                                sx={{
                                                                    p: 0.25,
                                                                    color: "text.secondary",
                                                                    "&:hover": { color: "primary.light" },
                                                                }}
                                                            >
                                                                <ChatIcon sx={{ fontSize: 13 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                    {provider.businessName && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {provider.businessName}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{provider.email}</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {provider.phone || "-"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {provider.city ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                                    <LocationOnIcon sx={{ fontSize: 13, color: "#38bdf8" }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {provider.city}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled">-</Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {provider.status === "approved" ? (
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                                        <StarIcon sx={{ fontSize: 13, color: "#f59e0b" }} />
                                                        <Typography variant="caption" fontWeight={600} sx={{ color: "#f59e0b" }}>
                                                            {provider.averageRating.toFixed(1)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.disabled">/ 5</Typography>
                                                    </Box>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                                        <BuildIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {provider.completedInterventions} interventions
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ) : null}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString("fr-FR") : "-"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                px: 1,
                                                py: 0.3,
                                                borderRadius: 2,
                                                bgcolor: cfg.bg,
                                                border: `1px solid ${cfg.border}`,
                                            }}>
                                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>
                                                    {cfg.label}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                            <Tooltip title="Voir profil">
                                                <IconButton
                                                    size="small"
                                                    sx={{ color: "primary.light" }}
                                                    onClick={() => navigate(`/providers/${provider.id}`)}
                                                >
                                                    <VisibilityIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>

                                            {provider.status === "pending" && (
                                                <>
                                                    <Tooltip title="Approuver">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: "success.main" }}
                                                            onClick={() => void handleUpdateProviderStatus(provider.id, "approve")}
                                                        >
                                                            <CheckCircleIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Rejeter">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: "error.main" }}
                                                            onClick={() => void handleUpdateProviderStatus(provider.id, "reject")}
                                                        >
                                                            <CancelIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}

                                            {provider.status === "approved" && (
                                                <Tooltip title="Suspendre">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "warning.main" }}
                                                        onClick={() => void handleUpdateProviderStatus(provider.id, "suspend")}
                                                    >
                                                        <BlockIcon sx={{ fontSize: 17 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {(provider.status === "suspended" || provider.status === "rejected") && (
                                                <Tooltip title="Reactiver">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "success.main" }}
                                                        onClick={() => void handleUpdateProviderStatus(provider.id, "reactivate")}
                                                    >
                                                        <ReplayIcon sx={{ fontSize: 17 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    <AppPagination
                        total={total}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setPage}
                        onRowsPerPage={setRowsPerPage}
                    />
                </TableContainer>
            )}
        </AdminLayout>
    );
}