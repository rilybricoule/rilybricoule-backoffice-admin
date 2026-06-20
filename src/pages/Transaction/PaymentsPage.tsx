import { useState, useMemo, useEffect } from "react";
import {
    Box, Button, Chip, IconButton, InputAdornment, Menu, MenuItem, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Toolbar,
    Tooltip, Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon  from "@mui/icons-material/MonetizationOn";
import TuneIcon            from "@mui/icons-material/Tune";
import ChatIcon            from "@mui/icons-material/Chat";
import SearchIcon          from "@mui/icons-material/Search";
import Navbar              from "../../components/Navbar";
import Sidebar             from "../../components/Sidebar";
import OpenArtBg           from "../../assets/openart.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { navigateTo }      from "../../utiles/Navigation";

import { getCurrentAdminUser } from "../../api/auth";
import { openAdminChat } from "../../api/chats";




import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { AdminPayment, PaymentStatus } from "../../Data/Payment";



import { useMessages }     from "../context/MessagesContext";
import AppPagination from "../../components/AppPagination";
import { usePagination } from "../hooks/usePagination";
import {useTransactions} from "../context/TransactionsContext.tsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `${n.toLocaleString("fr-FR")} MAD`;

const methodLabel: Record<string, string> = {
    carte:   "Carte",
    especes: "Espèces",
};

const chipSx = { fontSize: "0.7rem", height: 20, "& .MuiChip-label": { px: 0.8 } };



// ── Simulation menu per row ───────────────────────────────────────────────────
function SimulateMenu({
                          payment,
                          onChange,
                      }: {
    payment: AdminPayment;
    onChange: (id: string, status: PaymentStatus) => void;
}) {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);

    const options: {
        label: string;
        status: PaymentStatus;
        color: string;
    }[] = [
        { label: "En attente", status: "en_attente", color: "#f59e0b" },
        { label: "Payé", status: "paye", color: "#22c55e" },
        { label: "Remboursé", status: "rembourse", color: "#ef4444" },
        { label: "Échoué", status: "echoue", color: "#94a3b8" },
    ];

    return (
        <>
            <Tooltip title="Modifier le statut paiement">
                <IconButton
                    size="small"
                    onClick={(e) => setAnchor(e.currentTarget)}
                    sx={{
                        p: 0.4,
                        borderRadius: 1,
                        color: "#a78bfa",
                        bgcolor: "rgba(167,139,250,0.1)",
                        border: "1px solid rgba(167,139,250,0.25)",
                        "&:hover": { bgcolor: "rgba(167,139,250,0.2)" },
                    }}
                >
                    <TuneIcon sx={{ fontSize: 13 }} />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                PaperProps={{
                    sx: {
                        bgcolor: "rgba(8,18,40,0.97)",
                        border: "1px solid rgba(56,189,248,0.2)",
                        borderRadius: 2,
                        boxShadow: "0 8px 32px rgba(2,6,23,0.6)",
                        minWidth: 160,
                    },
                }}
            >
                <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
                    <Typography
                        sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#a78bfa",
                            letterSpacing: 0.5,
                        }}
                    >
                        STATUT PAIEMENT
                    </Typography>

                    <Typography sx={{ fontSize: 10, color: "rgba(226,232,240,0.4)" }}>
                        Paiement #{payment.id}
                    </Typography>
                </Box>

                {options.map((option) => (
                    <MenuItem
                        key={option.status}
                        selected={payment.paymentStatus === option.status}
                        onClick={() => {
                            onChange(payment.id, option.status);
                            setAnchor(null);
                        }}
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: option.color,
                            "&.Mui-selected": { bgcolor: `${option.color}18` },
                            "&:hover": { bgcolor: `${option.color}12` },
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}


// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PaymentsPage() {

    const [actionError, setActionError] = useState("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { openChat, refreshMessages } = useMessages();


    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("payments");
    const [search, setSearch] = useState("");
    const [filterPayment, setFilterPayment] = useState("all");
    const [filterCommission, setFilterCommission] = useState("all");
    const [filterMethod, setFilterMethod] = useState("all");
    const [filterVersement, setFilterVersement] = useState("all");
    const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

    const reservationId = searchParams.get("reservation");
    const paymentId = searchParams.get("payment");


    const {
        payments,
        loadingPayments,
        paymentsError,
        refreshPayments,
        updatePaymentStatus,
        updatePayoutStatus,
        updateCommissionStatus,
    } = useTransactions();

    // ── Auto-process payments after 3s ────────────────────────────────────────
    useEffect(() => {
        void refreshPayments(reservationId ?? undefined);

        setSearch(paymentId ?? "");
    }, [refreshPayments, reservationId, paymentId]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };





    const handlePaymentStatus = async (id: string, status: PaymentStatus) => {
        try {
            setActionError("");
            await updatePaymentStatus(id, status);
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur statut paiement");
        }
    };

    const handleMarkPayout = async (payment: AdminPayment) => {
        try {
            setActionError("");
            await updatePayoutStatus(payment.id, "verse");
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur versement prestataire");
        }
    };

    const handleMarkCommission = async (payment: AdminPayment) => {
        try {
            setActionError("");
            await updateCommissionStatus(payment.id, "recue");
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur commission");
        }
    };



    // ── Filtered rows ─────────────────────────────────────────────────────────

    const filteredPayments = useMemo(() => {
        let result = [...payments];

        if (filterPayment !== "all") {
            result = result.filter((payment) => payment.paymentStatus === filterPayment);
        }

        if (filterMethod !== "all") {
            result = result.filter((payment) => payment.paymentMethod === filterMethod);
        }

        if (filterVersement !== "all") {
            result = result.filter((payment) => payment.payoutStatus === filterVersement);
        }

        if (filterCommission !== "all") {
            result = result.filter((payment) => payment.commissionStatus === filterCommission);
        }

        if (search.trim()) {
            const q = search.toLowerCase();

            result = result.filter((payment) =>
                [
                    payment.id,
                    payment.reservationId,
                    payment.clientName,
                    payment.providerName,
                    payment.serviceName,
                    payment.transactionId ?? "",
                ].some((field) => field.toLowerCase().includes(q))
            );
        }

        result.sort((a, b) => {
            if (sortOrder === "latest") {
                return b.updatedAt.localeCompare(a.updatedAt);
            }

            return a.updatedAt.localeCompare(b.updatedAt);
        });

        return result;
    }, [payments, filterPayment, filterMethod, filterVersement, filterCommission, search, sortOrder]);


    const {
        paginated: paginatedRows,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        total,
    } = usePagination(filteredPayments);

    const paymentCounts = useMemo(() => ({
        all: payments.length,
        en_attente: payments.filter((payment) => payment.paymentStatus === "en_attente").length,
        paye: payments.filter((payment) => payment.paymentStatus === "paye").length,
        rembourse: payments.filter((payment) => payment.paymentStatus === "rembourse").length,
        echoue: payments.filter((payment) => payment.paymentStatus === "echoue").length,
    }), [payments]);

    const paymentTabs: { key: "all" | PaymentStatus; label: string }[] = [
        { key: "all", label: "Tous" },
        { key: "en_attente", label: "Paiement en attente" },
        { key: "paye", label: "Payés" },
        { key: "rembourse", label: "Remboursés" },
        { key: "echoue", label: "Échoués" },
    ];






    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={handleLogout} />
            <Sidebar
                open={sidebarOpen} selected={selected}
                onSelect={id => { setSelected(id); navigateTo(id, navigate); }}
            />

            <Box component="main" sx={{
                flexGrow: 1, p: 3, minHeight: "100vh", overflowX: "hidden",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover", backgroundPosition: "center",
            }}>
                <Toolbar />

                {/* ── Header ── */}
                <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Paiements</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Suivi des transactions, versements et commissions
                        </Typography>
                    </Box>
                </Box>




                {/* ── Reservation filter banner ── */}
                {(reservationId || paymentId) && (
                    <Box sx={{
                        mb: 2, p: 1.5,
                        bgcolor: "rgba(47,124,201,0.1)",
                        border: "1px solid rgba(47,124,201,0.25)",
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <Typography variant="body2" color="primary.light">
                            Filtré par {paymentId ? "paiement" : "réservation"} :{" "}
                            <strong>#{paymentId ?? reservationId}</strong>
                        </Typography>

                        <Button
                            size="small"
                            onClick={() => {
                                setSearch("");
                                navigate("/payments");
                            }}
                        >
                            Voir tout
                        </Button>
                    </Box>
                )}

                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 2,
                    mb: 3,
                }}>
                    {[
                        { label: "Paiement en attente", value: paymentCounts.en_attente, color: "warning.main" },
                        { label: "Payés", value: paymentCounts.paye, color: "success.main" },
                        { label: "Remboursés", value: paymentCounts.rembourse, color: "info.light" },
                        { label: "Échoués", value: paymentCounts.echoue, color: "error.main" },
                    ].map((card) => (
                        <Box
                            key={card.label}
                            sx={{
                                p: 2,
                                minHeight: 92,
                                bgcolor: "rgba(10,37,77,0.62)",
                                border: "1px solid rgba(147,181,218,0.16)",
                                borderRadius: 2,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}
                            >
                                {card.label}
                            </Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ color: card.color, mt: 1 }}>
                                {card.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Filters */}
                <Box sx={{
                    mb: 2, p: 2, bgcolor: "rgba(10,37,77,0.5)",
                    border: "1px solid rgba(147,181,218,0.15)", borderRadius: 2,
                    display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap",
                }}>
                    <TextField
                        size="small" placeholder="Rechercher..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1, minWidth: 180,
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(0,0,0,0.2)",
                                "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                            },
                        }}
                    />

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: "100%" }}>
                        {paymentTabs.map((tab) => {
                            const active = filterPayment === tab.key;

                            return (
                                <Chip
                                    key={tab.key}
                                    label={`${tab.label} (${paymentCounts[tab.key] ?? 0})`}
                                    onClick={() => setFilterPayment(tab.key)}
                                    size="small"
                                    sx={{
                                        cursor: "pointer",
                                        fontWeight: active ? 700 : 500,
                                        bgcolor: active ? "primary.main" : "rgba(147,181,218,0.1)",
                                        color: active ? "#fff" : "text.secondary",
                                        border: active ? "none" : "1px solid rgba(147,181,218,0.2)",
                                        "&:hover": {
                                            bgcolor: active ? "primary.dark" : "rgba(147,181,218,0.2)",
                                        },
                                    }}
                                />
                            );
                        })}
                    </Box>

                    {[
                        {
                            label: "Commission",
                            value: filterCommission,
                            onChange: setFilterCommission,
                            options: [
                                { value: "all",        label: "Tous"        },
                                { value: "en_attente", label: "À collecter" },
                                { value: "recue",      label: "Collectée"   },
                            ],
                        },
                        {
                            label: "Méthode",
                            value: filterMethod,
                            onChange: setFilterMethod,
                            options: [
                                { value: "all",     label: "Toutes"  },
                                { value: "carte",   label: "Carte"   },
                                { value: "especes", label: "Espèces" },
                            ],
                        },
                        {
                            label: "Versement",
                            value: filterVersement,
                            onChange: setFilterVersement,
                            options: [
                                { value: "all",        label: "Tous"      },
                                { value: "en_attente", label: "À verser"  },
                                { value: "verse",      label: "Versé"     },
                            ],
                        },
                    ].map(f => (
                        <TextField
                            key={f.label}
                            select size="small"
                            label={f.label}
                            value={f.value}
                            onChange={e => f.onChange(e.target.value)}
                            sx={{
                                minWidth: 140,
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "rgba(0,0,0,0.2)",
                                    "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                                },
                            }}
                            SelectProps={{ native: true }}
                        >
                            {f.options.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </TextField>
                    ))}
                    <IconButton
                        onClick={() =>
                            setSortOrder(prev =>
                                prev === "latest" ? "oldest" : "latest"
                            )
                        }
                        sx={{
                            color: sortOrder === "latest"
                                ? "#38bdf8"
                                : "rgba(226,232,240,0.6)",

                            bgcolor: sortOrder === "latest"
                                ? "rgba(56,189,248,0.12)"
                                : "transparent",

                            border: "1px solid rgba(56,189,248,0.25)",

                            "&:hover": {
                                bgcolor: "rgba(56,189,248,0.2)"
                            }
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {(paymentsError || actionError) && (
                    <Typography sx={{ mb: 2, color: "error.main", fontWeight: 700 }}>
                        {paymentsError || actionError}
                    </Typography>
                )}

                {loadingPayments && (
                    <Typography sx={{ mb: 2, color: "text.secondary" }}>
                        Chargement des paiements...
                    </Typography>
                )}

                {/* ── Table ── */}
                <TableContainer
                    component={Paper}
                    sx={{
                        bgcolor: "rgba(10,37,77,0.6)",
                        overflowX: "auto",
                        border: "1px solid rgba(147,181,218,0.2)",
                        borderRadius: 2,
                        maxWidth: "100%",
                        "& .MuiTableHead-root .MuiTableCell-root": {
                            fontWeight: 700,
                            color: "text.secondary",
                            borderBottom: "1px solid rgba(147,181,218,0.25)",
                            bgcolor: "rgba(15,45,90,0.95)",
                            whiteSpace: "nowrap",
                        },
                        "& .MuiTableBody-root .MuiTableRow-root:hover": {
                            bgcolor: "rgba(255,255,255,0.04)",
                        },
                        "& .MuiTableCell-root": {
                            borderBottom: "1px solid rgba(147,181,218,0.12)",
                            color: "text.primary",
                            whiteSpace: "nowrap",
                        },
                    }}
                >

                <Table size="small" sx={{ minWidth: 1260 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 180 }}>Réservation</TableCell>
                                <TableCell sx={{ width: 120 }}>Client</TableCell>
                                <TableCell sx={{ width: 130 }}>Prestataire</TableCell>
                                <TableCell align="center" sx={{ width: 90 }}>Méthode</TableCell>
                                <TableCell align="right" sx={{ width: 100 }}>Montant</TableCell>
                                <TableCell align="right" sx={{ width: 110 }}>Commission</TableCell>
                                <TableCell align="right" sx={{ width: 110 }}>À verser</TableCell>
                                <TableCell align="center" sx={{ width: 140 }}>Paiement</TableCell>
                                <TableCell align="center" sx={{ width: 140 }}>Versement</TableCell>
                                <TableCell align="center" sx={{ width: 140 }}>Etat du commission</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRows.map((payment) => {
                                const isCard = payment.paymentMethod === "carte";
                                const isCash = payment.paymentMethod === "especes";
                                const isClosedPayment =
                                    payment.paymentStatus === "rembourse" ||
                                    payment.paymentStatus === "echoue";
                                const isPaidPayment = payment.paymentStatus === "paye";

                                const canMarkPayout =false;

                                const canMarkCommission =false;

                                const commissionLabel =
                                    isClosedPayment
                                        ? "Annulé"
                                        : isCard
                                            ? isPaidPayment
                                                ? "Auto collectée"
                                                : "En attente paiement"
                                            : payment.commissionStatus === "recue"
                                                ? "Collectée"
                                                : isPaidPayment
                                                    ? "À collecter"
                                                    : "En attente paiement";

                                const commissionColor: "success" | "warning" | "error" =
                                    isClosedPayment
                                        ? "error"
                                        : isCard
                                            ? isPaidPayment
                                                ? "success"
                                                : "warning"
                                            : payment.commissionStatus === "recue"
                                            ? "success"
                                            : "warning";

                                const paymentChip =
                                    payment.paymentStatus === "echoue"
                                        ? { label: "Échoué", color: "error" as const }
                                        : payment.paymentStatus === "rembourse"
                                            ? { label: "Remboursé", color: "error" as const }
                                            : payment.paymentStatus === "en_attente"
                                                ? { label: "En attente", color: "warning" as const }
                                                : { label: "Payé", color: "success" as const };


                                const handleMessageProvider = async (e: React.MouseEvent, payment: AdminPayment) => {
                                    e.stopPropagation();

                                    const admin = getCurrentAdminUser();
                                    if (!admin?.id) return;

                                    try {
                                        const chat = await openAdminChat({
                                            adminId: admin.id,
                                            prestataireId: Number(payment.providerId),
                                        });

                                        openChat({
                                            id: String(chat.chatId),
                                            providerName: payment.providerName,
                                            avatar: payment.providerName[0]?.toUpperCase() ?? "P",
                                            providerId: String(payment.providerId),
                                            receiverId: String(payment.providerId),
                                        });

                                        void refreshMessages();
                                    } catch (error) {
                                        console.error("Failed to open provider chat", error);
                                    }
                                };

                                const handleMessageClient = async (e: React.MouseEvent, payment: AdminPayment) => {
                                    e.stopPropagation();

                                    const admin = getCurrentAdminUser();
                                    if (!admin?.id) return;

                                    try {
                                        const chat = await openAdminChat({
                                            adminId: admin.id,
                                            clientId: Number(payment.clientId),
                                        });

                                        openChat({
                                            id: String(chat.chatId),
                                            providerName: payment.clientName,
                                            avatar: payment.clientName[0]?.toUpperCase() ?? "C",
                                            providerId: String(payment.clientId),
                                            receiverId: String(payment.clientId),
                                        });

                                        void refreshMessages();
                                    } catch (error) {
                                        console.error("Failed to open client chat", error);
                                    }
                                };



                                return (
                                    <TableRow key={payment.id}>
                                        {/* Réservation */}
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    noWrap
                                                    sx={{
                                                        maxWidth: 130,
                                                        color: "primary.light",
                                                    }}
                                                >
                                                    {payment.serviceName}
                                                </Typography>

                                                <Tooltip title="Voir la réservation">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/reservations?reservation=${payment.reservationId}`)}
                                                        sx={{
                                                            p: 0.35,
                                                            color: "primary.light",
                                                            border: "1px solid rgba(56,189,248,0.25)",
                                                            bgcolor: "rgba(56,189,248,0.08)",
                                                            "&:hover": {
                                                                bgcolor: "rgba(56,189,248,0.18)",
                                                            },
                                                        }}
                                                    >
                                                        <VisibilityIcon sx={{ fontSize: 15 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>

                                        {/* Client */}
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <Tooltip title={payment.clientName} placement="top">
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 80 }}>
                                                        {payment.clientName}
                                                    </Typography>
                                                </Tooltip>

                                                <Tooltip title="Envoyer un message">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => void handleMessageClient(e, payment)}

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
                                        </TableCell>

                                        {/* Prestataire */}
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <Tooltip title={payment.providerName} placement="top">
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 80 }}>
                                                        {payment.providerName}
                                                    </Typography>
                                                </Tooltip>

                                                <Tooltip title="Envoyer un message">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => void handleMessageProvider(e, payment)}

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
                                        </TableCell>

                                        {/* Méthode */}
                                        <TableCell align="center">
                                            <Chip
                                                label={methodLabel[payment.paymentMethod]}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontSize: "0.7rem",
                                                    height: 20,
                                                    borderColor: "rgba(147,181,218,0.3)",
                                                    color: "text.secondary",
                                                    "& .MuiChip-label": { px: 0.8 },
                                                }}
                                            />
                                        </TableCell>

                                        {/* Montant */}
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={600}>
                                                {fmt(payment.amount)}
                                            </Typography>
                                        </TableCell>

                                        {/* Commission */}
                                        <TableCell align="right">
                                            <Typography variant="body2" color="info.light">
                                                {fmt(payment.commission)}
                                            </Typography>
                                        </TableCell>

                                        {/* Versement */}
                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary">
                                                {fmt(payment.providerPayout)}
                                            </Typography>
                                        </TableCell>

                                        {/* Statut paiement */}
                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 0.75,
                                                }}
                                            >
                                                <Chip
                                                    label={paymentChip.label}
                                                    size="small"
                                                    color={paymentChip.color}
                                                    variant="outlined"
                                                    sx={chipSx}
                                                />

                                                <SimulateMenu
                                                    payment={payment}
                                                    onChange={handlePaymentStatus}
                                                />
                                            </Box>
                                        </TableCell>

                                        {/* Versement prestataire */}
                                        <TableCell align="center">
                                            {isClosedPayment ? (
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    sx={chipSx}
                                                    label="Annulé"
                                                    color="error"
                                                />
                                            ) : isCard ? (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 0.75,
                                                    }}
                                                >
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        sx={chipSx}
                                                        label={payment.payoutStatus === "verse" ? "Versé" : "À verser"}
                                                        color={payment.payoutStatus === "verse" ? "success" : "warning"}
                                                    />

                                                    {canMarkPayout && (
                                                        <Tooltip title="Marquer comme versé">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleMarkPayout(payment)}
                                                                sx={{ color: "#38bdf8" }}
                                                            >
                                                                <AccountBalanceIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    sx={chipSx}
                                                    label={isPaidPayment ? "Payé au prestataire" : "En attente"}
                                                    color={isPaidPayment ? "success" : "warning"}
                                                />
                                            )}
                                        </TableCell>


                                        {/* Commission */}
                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 0.75,
                                                }}
                                            >
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    sx={chipSx}
                                                    label={commissionLabel}
                                                    color={commissionColor}
                                                />

                                                {canMarkCommission && (
                                                    <Tooltip title="Marquer commission collectée">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleMarkCommission(payment)}
                                                            sx={{ color: "#f59e0b" }}
                                                        >
                                                            <MonetizationOnIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {!loadingPayments && paginatedRows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        sx={{
                                            py: 5,
                                            color: "text.secondary",
                                            textAlign: "center",
                                        }}
                                    >
                                        Aucune transaction trouvée
                                    </TableCell>
                                </TableRow>
                            )}
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


            </Box>



        </Box>

    );
}
