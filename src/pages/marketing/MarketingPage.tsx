import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/Campaign";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { navigateTo } from "../../utiles/Navigation";

import {
    getAdminMarketingSummary,
    type AdminMarketingSummary,
    type MarketingPromoStatus,
} from "../../api/marketing";

const emptySummary: AdminMarketingSummary = {
    totalPromos: 0,
    activePromos: 0,
    scheduledPromos: 0,
    expiredPromos: 0,
    inactivePromos: 0,

    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    inactiveCoupons: 0,

    totalNotifications: 0,
    readNotifications: 0,
    unreadNotifications: 0,

    recentPromos: [],
    recentNotifications: [],
};

const cardSx = {
    p: 2,
    bgcolor: "rgba(10,37,77,0.6)",
    border: "1px solid rgba(147,181,218,0.2)",
    borderRadius: 2,
};

const tableSx = {
    bgcolor: "rgba(10,37,77,0.6)",
    border: "1px solid rgba(147,181,218,0.2)",
    borderRadius: 2,
    overflow: "hidden",
    "& .MuiTableHead-root .MuiTableCell-root": {
        fontWeight: 700,
        color: "text.secondary",
        borderBottom: "1px solid rgba(147,181,218,0.25)",
        bgcolor: "rgba(15,45,90,0.95)",
    },
    "& .MuiTableBody-root .MuiTableRow-root:hover": {
        bgcolor: "rgba(255,255,255,0.04)",
    },
    "& .MuiTableCell-root": {
        borderBottom: "1px solid rgba(147,181,218,0.12)",
        color: "text.primary",
    },
};

function formatDate(value: string | null): string {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("fr-FR");
}

function promoStatusLabel(status: MarketingPromoStatus): string {
    if (status === "ACTIVE") return "Active";
    if (status === "SCHEDULED") return "Planifiée";
    if (status === "EXPIRED") return "Expirée";
    return "Inactive";
}

function promoStatusColor(status: MarketingPromoStatus): "success" | "info" | "warning" | "default" {
    if (status === "ACTIVE") return "success";
    if (status === "SCHEDULED") return "info";
    if (status === "EXPIRED") return "warning";
    return "default";
}

export default function MarketingPage() {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("marketing");

    const [summary, setSummary] = useState<AdminMarketingSummary>(emptySummary);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMarketing = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminMarketingSummary();
            setSummary(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur chargement marketing");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMarketing();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const cards = useMemo(() => [
        {
            label: "Promos actives",
            value: summary.activePromos,
            color: "#22c55e",
            icon: <CampaignIcon sx={{ fontSize: 18 }} />,
        },
        {
            label: "Promos planifiées",
            value: summary.scheduledPromos,
            color: "#38bdf8",
            icon: <ScheduleIcon sx={{ fontSize: 18 }} />,
        },
        {
            label: "Coupons actifs",
            value: summary.activeCoupons,
            color: "#f59e0b",
            icon: <LocalOfferIcon sx={{ fontSize: 18 }} />,
        },
        {
            label: "Notifications non lues",
            value: summary.unreadNotifications,
            color: "#a78bfa",
            icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} />,
        },
    ], [summary]);

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar
                onToggleSidebar={() => setSidebarOpen((value) => !value)}
                onLogout={handleLogout}
            />

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
                    overflowX: "hidden",
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Toolbar />

                <Box
                    sx={{
                        mb: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                            Marketing
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Vue globale des promotions, coupons et notifications
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                            size="small"
                            variant="outlined"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate("/promo")}
                        >
                            Codes promo
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate("/notifications")}
                        >
                            Notifications
                        </Button>

                        <Tooltip title="Actualiser">
                            <IconButton
                                onClick={loadMarketing}
                                sx={{
                                    color: "primary.light",
                                    border: "1px solid rgba(147,181,218,0.25)",
                                    bgcolor: "rgba(10,37,77,0.45)",
                                }}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : (
                    <>
                        <Box
                            sx={{
                                mb: 3,
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                    lg: "repeat(4, 1fr)",
                                },
                                gap: 2,
                            }}
                        >
                            {cards.map((card) => (
                                <Box key={card.label} sx={cardSx}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: card.color }}>
                                        {card.icon}
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                                        >
                                            {card.label}
                                        </Typography>
                                    </Box>

                                    <Typography variant="h5" fontWeight={800} sx={{ color: card.color, mt: 1 }}>
                                        {card.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                mb: 3,
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "repeat(3, 1fr)",
                                },
                                gap: 2,
                            }}
                        >
                            <Box sx={cardSx}>
                                <Typography variant="caption" color="text.secondary">
                                    Total promos
                                </Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {summary.totalPromos}
                                </Typography>
                            </Box>

                            <Box sx={cardSx}>
                                <Typography variant="caption" color="text.secondary">
                                    Promos expirées / inactives
                                </Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {summary.expiredPromos} / {summary.inactivePromos}
                                </Typography>
                            </Box>

                            <Box sx={cardSx}>
                                <Typography variant="caption" color="text.secondary">
                                    Notifications envoyées
                                </Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {summary.totalNotifications}
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    lg: "1.15fr 0.85fr",
                                },
                                gap: 2,
                            }}
                        >
                            <TableContainer component={Paper} sx={tableSx}>
                                <Box sx={{ p: 2, borderBottom: "1px solid rgba(147,181,218,0.12)" }}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        Promotions récentes
                                    </Typography>
                                </Box>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Campagne</TableCell>
                                            <TableCell>Audience</TableCell>
                                            <TableCell align="center">Statut</TableCell>
                                            <TableCell align="right">Utilisation</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {summary.recentPromos.map((promo) => (
                                            <TableRow key={promo.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={700} color="primary.light">
                                                        {promo.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {promo.code} · {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {promo.targetAudience ?? "Tous"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={promoStatusLabel(promo.status)}
                                                        color={promoStatusColor(promo.status)}
                                                        sx={{ fontSize: "0.7rem", height: 20 }}
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {promo.currentUsage ?? 0}
                                                        {promo.maxUsage ? ` / ${promo.maxUsage}` : ""}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {summary.recentPromos.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                                    Aucune promotion trouvée
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TableContainer component={Paper} sx={tableSx}>
                                <Box sx={{ p: 2, borderBottom: "1px solid rgba(147,181,218,0.12)" }}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        Notifications récentes
                                    </Typography>
                                </Box>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Message</TableCell>
                                            <TableCell align="center">Type</TableCell>
                                            <TableCell align="right">Date</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {summary.recentNotifications.map((notification) => (
                                            <TableRow key={notification.id}>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
                                                        {notification.content}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {notification.read ? "Lue" : "Non lue"}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={notification.type ?? "Notification"}
                                                        sx={{ fontSize: "0.7rem", height: 20 }}
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        {formatDate(notification.date)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {summary.recentNotifications.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                                                    Aucune notification trouvée
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
