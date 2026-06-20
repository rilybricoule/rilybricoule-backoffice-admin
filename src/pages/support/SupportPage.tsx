import { useState, useMemo, useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { navigateTo } from "../../utiles/Navigation";
import { useSupport, type TicketStatus } from "../context/SupportContext";
import TicketRow from "./components/TicketRow";
import TicketDetailDrawer from "./components/TicketDetailDrawer";
import { useNavigate } from "react-router-dom";
import { useMessages } from "../context/MessagesContext";
import { getCurrentAdminUser } from "../../api/auth";

import { openAdminChatFromTicket } from "../../api/chats";


const filterTabs: { key: "all" | TicketStatus; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "ouvert", label: "Ouverts" },
    { key: "en_cours", label: "En cours" },
    { key: "resolu", label: "Resolus" },
    { key: "ferme", label: "Fermes" },
];

export default function SupportPage() {
    const {
        tickets,
        loading,
        error,
        reloadTickets,
        replyTicket,
        updateStatus,
        updateCategory,
        toggleLitige,
        setAdminNote,
        resolveTicket,
    } = useSupport();
    const { openChat, refreshMessages } = useMessages();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("support");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
    const [litgeOnly, setLitgeOnly] = useState(false);
    const [detailTicketId, setDetailTicketId] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        void reloadTickets();
    }, [reloadTickets]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const handleSelect = (id: string) => {
        setSelected(id);
        navigateTo(id, navigate);
    };

    const counts = useMemo(
        () => ({
            all: tickets.length,
            ouvert: tickets.filter((t) => t.status === "ouvert").length,
            en_cours: tickets.filter((t) => t.status === "en_cours").length,
            resolu: tickets.filter((t) => t.status === "resolu").length,
            ferme: tickets.filter((t) => t.status === "ferme").length,
            litiges: tickets.filter((t) => t.isLitige).length,
        }),
        [tickets]
    );

    const filtered = useMemo(() => {
        let result = statusFilter === "all" ? tickets : tickets.filter((t) => t.status === statusFilter);

        if (litgeOnly) result = result.filter((t) => t.isLitige);

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) => t.subject.toLowerCase().includes(q) || t.fromName.toLowerCase().includes(q)
            );
        }

        return result;
    }, [tickets, statusFilter, litgeOnly, search]);

    const detailTicket = useMemo(
        () => tickets.find((ticket) => ticket.id === detailTicketId) ?? null,
        [detailTicketId, tickets]
    );

    const handleOpenTicketChat = async (event: React.MouseEvent, ticketId: string) => {
        event.stopPropagation();

        const admin = getCurrentAdminUser();
        if (!admin?.id) return;

        const numericTicketId = Number(ticketId);
        if (Number.isNaN(numericTicketId) || numericTicketId <= 0) return;

        const ticket = tickets.find((item) => item.id === ticketId);
        if (!ticket) return;

        try {
            const chat = await openAdminChatFromTicket(numericTicketId, admin.id);

            openChat({
                id: String(chat.chatId),
                providerName: ticket.fromName,
                avatar: ticket.fromName[0]?.toUpperCase() ?? "U",
                providerId: ticket.fromId,
                receiverId: ticket.fromId,
            });

            void refreshMessages();
        } catch (error) {
            console.error("Failed to open support chat", error, ticket);
        }
    };




    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    minHeight: "100vh",
                    minWidth: 0,
                    overflowX: "auto",
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Toolbar />

                <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                            Support & Litiges
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestion des tickets de support et des litiges
                        </Typography>
                    </Box>
                    {counts.litiges > 0 && (
                        <Chip
                            icon={<GavelIcon sx={{ fontSize: 16 }} />}
                            label={`${counts.litiges} litige(s) ouvert(s)`}
                            color="error"
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Box>

                <Box
                    sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: "rgba(10,37,77,0.6)",
                        border: "1px solid rgba(147,181,218,0.2)",
                        borderRadius: 2,
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <TextField
                        placeholder="Rechercher un ticket..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1,
                            minWidth: 240,
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(0,0,0,0.2)",
                                "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                            },
                        }}
                    />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {filterTabs.map((tab) => {
                            const active = statusFilter === tab.key && !litgeOnly;
                            return (
                                <Chip
                                    key={tab.key}
                                    label={`${tab.label} (${counts[tab.key]})`}
                                    onClick={() => {
                                        setStatusFilter(tab.key);
                                        setLitgeOnly(false);
                                    }}
                                    size="small"
                                    sx={{
                                        cursor: "pointer",
                                        fontWeight: active ? 700 : 400,
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
                        <Chip
                            icon={<GavelIcon sx={{ fontSize: 14 }} />}
                            label={`Litiges (${counts.litiges})`}
                            onClick={() => {
                                setLitgeOnly((v) => !v);
                                setStatusFilter("all");
                            }}
                            size="small"
                            sx={{
                                cursor: "pointer",
                                fontWeight: litgeOnly ? 700 : 400,
                                bgcolor: litgeOnly ? "error.main" : "rgba(147,181,218,0.1)",
                                color: litgeOnly ? "#fff" : "text.secondary",
                                border: litgeOnly ? "none" : "1px solid rgba(147,181,218,0.2)",
                                "&:hover": {
                                    bgcolor: litgeOnly ? "error.dark" : "rgba(147,181,218,0.2)",
                                },
                            }}
                        />
                    </Box>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={() => void reloadTickets()}>
                                Recharger
                            </Button>
                        }
                        sx={{ mb: 3 }}
                    >
                        {error}
                    </Alert>
                )}

                <TableContainer
                    component={Paper}
                    sx={{
                        bgcolor: "rgba(10,37,77,0.6)",
                        border: "1px solid rgba(147,181,218,0.2)",
                        borderRadius: 2,
                        "& .MuiTableHead-root .MuiTableCell-root": {
                            fontWeight: 600,
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
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Sujet</TableCell>
                                <TableCell>De</TableCell>
                                <TableCell>Categorie</TableCell>
                                <TableCell align="center">Statut</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
                                            <CircularProgress size={20} />
                                            <Typography variant="body2" color="text.secondary">
                                                Chargement des tickets...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((t) => (
                                    <TicketRow
                                        key={t.id}
                                        ticket={t}
                                        onView={() => setDetailTicketId(t.id)}
                                        onMessage={(event) => { void handleOpenTicketChat(event, t.id); }}
                                    />


                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!loading && filtered.length === 0 && (
                    <Typography sx={{ mt: 3, color: "text.secondary", textAlign: "center" }}>
                        Aucun ticket trouve
                    </Typography>
                )}
            </Box>

            <TicketDetailDrawer
                ticket={detailTicket}
                onClose={() => setDetailTicketId(null)}
                onReply={replyTicket}
                onStatusChange={updateStatus}
                onCategoryChange={updateCategory}
                onToggleLitige={toggleLitige}
                onAdminNote={setAdminNote}
                onResolve={resolveTicket}
            />
        </Box>
    );
}
