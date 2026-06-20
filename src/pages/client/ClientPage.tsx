import { useState, useMemo,useEffect, type MouseEvent } from "react";
import {
    Alert,
    Avatar, Box, Button, Card, Chip, IconButton,
    InputAdornment, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    Toolbar, Tooltip, Typography,
} from "@mui/material";
import Navbar                  from "../../components/Navbar";
import Sidebar                 from "../../components/Sidebar";
import OpenArtBg               from "../../assets/openart.png";
import {
    activateClient,
    createClient,
    deactivateClient,
    getClientReservations,
    getClients,
    updateClient,
    type ClientApi,
} from "../../api/client.ts";

import SearchIcon              from "@mui/icons-material/Search";
import AddIcon                 from "@mui/icons-material/Add";
import VisibilityIcon          from "@mui/icons-material/Visibility";
import EditIcon                from "@mui/icons-material/Edit";
import ChatIcon                from "@mui/icons-material/Chat";
import BlockIcon               from "@mui/icons-material/Block";
import CheckCircleIcon         from "@mui/icons-material/CheckCircle";
import EventNoteIcon           from "@mui/icons-material/EventNote";
import StarIcon                from "@mui/icons-material/Star";
import LocationOnIcon          from "@mui/icons-material/LocationOn";
import ArrowUpwardIcon         from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon       from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon          from "@mui/icons-material/UnfoldMore";
import type { Client }         from "../../Data/Client";
import ClientFormModal         from "./ClientFormModel";
import ConfirmDeactivateDialog from "./ConfirmDeactiveDialog";
import { navigateTo }          from "../../utiles/Navigation";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../hooks/usePagination";
import AppPagination from "../../components/AppPagination";
import { useMessages } from "../context/MessagesContext";
import { getCurrentAdminUser } from "../../api/auth";
import { openAdminChat } from "../../api/chats";

// ── types ─────────────────────────────────────────────────────────────────────

type SortField = "nom" | "reservations" | "annulations" | "note" | "activite" | null;
type SortDir   = "asc" | "desc";
type StatusFilter = "all" | "actif" | "desactive";

// ── helpers ───────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function avatarBg(id: string) {
    const palette = [
        "rgba(47,124,201,0.85)", "rgba(99,102,241,0.85)",
        "rgba(16,185,129,0.85)", "rgba(245,158,11,0.85)",
        "rgba(239,68,68,0.85)",  "rgba(236,72,153,0.85)",
    ];
    return palette[id.charCodeAt(id.length - 1) % palette.length];
}

function formatLastActivity(dateStr?: string): string {
    if (!dateStr) return "—";
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7)   return `Il y a ${days}j`;
    if (days < 30)  return `Il y a ${Math.floor(days / 7)}sem`;
    if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
    return `Il y a ${Math.floor(days / 365)}an`;
}

function ActivityDot({ dateStr }: { dateStr?: string }) {
    if (!dateStr) return <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "rgba(148,163,184,0.25)", flexShrink: 0 }} />;
    const days  = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    const color = days <= 7 ? "#22c55e" : days <= 30 ? "#f59e0b" : "#ef4444";
    return <Box sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, bgcolor: color, boxShadow: `0 0 5px ${color}99` }} />;
}

// ── Sortable header cell ──────────────────────────────────────────────────────

function SortableCell({ field, label, currentField, currentDir, align = "left", onSort}: {
    field: SortField; label: string; currentField: SortField; currentDir: SortDir;
    align?: "left" | "center" | "right";
    onSort: (f: SortField) => void;
    onClear: () => void;
}) {
    const active = currentField === field;
    const Icon   = active
        ? (currentDir === "asc" ? ArrowUpwardIcon : ArrowDownwardIcon)
        : UnfoldMoreIcon;

    return (
        <TableCell align={align} sx={{ userSelect: "none" }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                <Box
                    onClick={() => onSort(field)}
                    sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer",
                        "&:hover .sort-icon": { opacity: 1 } }}
                >
                    <span>{label}</span>
                    <Icon className="sort-icon" sx={{
                        fontSize: 13,
                        opacity: active ? 1 : 0.3,
                        color: active ? "primary.light" : "text.secondary",
                        transition: "opacity 0.15s",
                    }} />
                </Box>

            </Box>
        </TableCell>
    );
}

function mapApiClient(c: ClientApi): Client {
    return {
        id: String(c.id),
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        isActive: c.active ?? true,
        ville: c.address?.split(",")[0]?.trim() || c.address || "—",
    };
}

function toClientPayload(client: Client) {
    return {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        address: client.ville,
        active: client.isActive,
    };
}


// ── Component ─────────────────────────────────────────────────────────────────

export default function ClientsPage() {
    const [sidebarOpen,   setSidebarOpen]   = useState(true);
    const [selected,      setSelected]      = useState("clients");
    const [search,        setSearch]        = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientsError, setClientsError] = useState("");

    const [editClient,    setEditClient]    = useState<Client | null>(null);
    const [formOpen,      setFormOpen]      = useState(false);
    const [confirmClient, setConfirmClient] = useState<Client | null>(null);
    const [sortField,     setSortField]     = useState<SortField>(null);
    const [sortDir,       setSortDir]       = useState<SortDir>("desc");
    const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
    const [resByClientState, setResByClientState] = useState<Record<string, number>>({});
    const [cancelByClientState, setCancelByClientState] = useState<Record<string, number>>({});
    const { openChat, refreshMessages } = useMessages();




    const resByClient = resByClientState;
    const cancelByClient = cancelByClientState;



    const cancelRateByClient = useMemo(() => {
        const map: Record<string, number> = {};
        Object.keys(resByClient).forEach((id) => {
            const total    = resByClient[id] ?? 0;
            const cancelled = cancelByClient[id] ?? 0;
            map[id] = total > 0 ? Math.round((cancelled / total) * 100) : 0;
        });
        return map;
    }, [resByClient, cancelByClient]);

    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoadingClients(true);
                setClientsError("");

                const apiClients = await getClients();

                const mappedClients: Client[] = apiClients.map(mapApiClient);

                const stats = await Promise.all(
                    mappedClients.map(async (c) => {
                        const reservations = await getClientReservations(Number(c.id));
                        const total = reservations.length;
                        const cancelled = reservations.filter((r) =>
                            ["CANCELLED", "annulee", "cancelled"].includes(r.status)
                        ).length;

                        const lastReservationRaw = reservations
                            .map((r) => r.reservationDate ?? r.date)
                            .filter(Boolean)
                            .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0];

                        return {
                            clientId: c.id,
                            total,
                            cancelled,
                            lastActivityAt: lastReservationRaw,
                        };
                    })
                );

                const totalMap: Record<string, number> = {};
                const cancelMap: Record<string, number> = {};
                const lastMap: Record<string, string | undefined> = {};

                stats.forEach((s) => {
                    totalMap[s.clientId] = s.total;
                    cancelMap[s.clientId] = s.cancelled;
                    lastMap[s.clientId] = s.lastActivityAt;
                });

                const withActivity = mappedClients.map((c) => ({
                    ...c,
                    lastActivityAt: lastMap[c.id],
                }));

                if (!mounted) return;

                setClients(withActivity);
                setResByClientState(totalMap);
                setCancelByClientState(cancelMap);
            } catch {
                if (mounted) setClientsError("Erreur chargement clients");
            } finally {
                if (mounted) setLoadingClients(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);




    const avgRatingByClient = useMemo(() => ({} as Record<string, number>), []);


    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const handleSelect = (id: string) => { setSelected(id); navigateTo(id, navigate); };

    const handleToggleActive = async (client: Client) => {
        try {
            if (client.isActive) {
                setConfirmClient(client);
                return;
            }

            const updated = await activateClient(Number(client.id));
            const mapped = mapApiClient(updated);

            setClients((prev) =>
                prev.map((c) =>
                    c.id === client.id
                        ? { ...c, ...mapped, lastActivityAt: c.lastActivityAt }
                        : c
                )
            );
        } catch {
            setClientsError("Erreur activation client");
        }
    };


    const handleConfirmDeactivate = async () => {
        if (!confirmClient) return;

        try {
            const updated = await deactivateClient(Number(confirmClient.id));
            const mapped = mapApiClient(updated);

            setClients((prev) =>
                prev.map((c) =>
                    c.id === confirmClient.id
                        ? { ...c, ...mapped, lastActivityAt: c.lastActivityAt }
                        : c
                )
            );

            setConfirmClient(null);
        } catch {
            setClientsError("Erreur désactivation client");
        }
    };


    const handleSaveClient = async (updated: Client) => {
        try {
            setClientsError("");

            const saved = editClient
                ? await updateClient(Number(editClient.id), toClientPayload(updated))
                : await createClient(toClientPayload(updated));

            const mapped = mapApiClient(saved);

            setClients((prev) =>
                prev.some((c) => c.id === mapped.id)
                    ? prev.map((c) =>
                        c.id === mapped.id
                            ? { ...c, ...mapped, lastActivityAt: c.lastActivityAt }
                            : c
                    )
                    : [...prev, mapped]
            );

            setResByClientState((prev) => ({
                ...prev,
                [mapped.id]: prev[mapped.id] ?? 0,
            }));

            setCancelByClientState((prev) => ({
                ...prev,
                [mapped.id]: prev[mapped.id] ?? 0,
            }));

            setEditClient(null);
            setFormOpen(false);
        } catch (error: any) {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            console.error("Erreur enregistrement client", {
                status,
                data: error?.response?.data,
                message: error?.message,
            });

            if (status === 409) {
                setClientsError("Cet email existe déjà");
                return;
            }

            setClientsError(message || "Erreur enregistrement client");
        }


    };

    const handleMessageClient = async (event: MouseEvent, client: Client) => {
        event.stopPropagation();

        const admin = getCurrentAdminUser();
        if (!admin?.id) {
            console.error("Cannot open client chat because admin id is missing");
            return;
        }

        try {
            const chat = await openAdminChat({
                adminId: admin.id,
                clientId: Number(client.id),
            });

            openChat({
                id: String(chat.chatId),
                providerName: `${client.firstName} ${client.lastName}`.trim(),
                avatar: getInitials(client.firstName, client.lastName) || "C",
                providerId: String(client.id),
                receiverId: String(client.id),
            });

            void refreshMessages();
        } catch (error) {
            console.error("Failed to open client chat", error);
            setClientsError("Impossible d'ouvrir la conversation client");
        }
    };


    const handleSort = (field: SortField) => {
        if (sortField === field && sortDir === "asc") {
            // third click → clear sort
            setSortField(null);
        } else if (sortField === field) {
            setSortDir("asc");
        } else {
            setSortField(field);
            setSortDir("desc");
        }
    };


    const clearSort = () => setSortField(null);

    const displayedClients = useMemo(() => {
        let list = [...clients];

        // 1. status filter
        if (statusFilter === "actif")     list = list.filter((c) => c.isActive);
        if (statusFilter === "desactive") list = list.filter((c) => !c.isActive);

        // 2. search
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter((c) =>
                c.firstName.toLowerCase().includes(q) ||
                c.lastName.toLowerCase().includes(q)  ||
                c.email.toLowerCase().includes(q)     ||
                (c.phone?.includes(q) ?? false)        ||
                ((c as any).ville?.toLowerCase().includes(q) ?? false)
            );
        }

        // 3. sort
        if (sortField) {
            list.sort((a, b) => {
                let valA: number | string = 0;
                let valB: number | string = 0;

                if (sortField === "nom") {
                    valA = `${a.firstName} ${a.lastName}`.toLowerCase();
                    valB = `${b.firstName} ${b.lastName}`.toLowerCase();
                }
                if (sortField === "reservations") {
                    valA = resByClient[a.id] ?? 0;
                    valB = resByClient[b.id] ?? 0;
                }
                if (sortField === "activite") {
                    valA = (a as any).lastActivityAt ? new Date((a as any).lastActivityAt).getTime() : 0;
                    valB = (b as any).lastActivityAt ? new Date((b as any).lastActivityAt).getTime() : 0;
                }
                if (sortField === "annulations") {
                    valA = cancelRateByClient[a.id] ?? 0;
                    valB = cancelRateByClient[b.id] ?? 0;
                }
                if (sortField === "note") {
                    valA = avgRatingByClient[a.id] ?? 0;
                    valB = avgRatingByClient[b.id] ?? 0;
                }

                if (valA < valB) return sortDir === "asc" ? -1 : 1;
                if (valA > valB) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }

        return list;
    }, [clients, search, statusFilter, sortField, sortDir, resByClient, cancelRateByClient, avgRatingByClient]);


    const {
        paginated: paginatedRows,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        total
    } = usePagination(displayedClients);

    const activeCount = clients.filter((c) => c.isActive).length;

    const statusFilterOptions: { value: StatusFilter; label: string }[] = [
        { value: "all",       label: "Tous"      },
        { value: "actif",     label: "Actifs"    },
        { value: "desactive", label: "Désactivés"},
    ];

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />

            <Box component="main" sx={{
                flexGrow: 1, p: 3, minHeight: "100vh", minWidth: 0, overflowX: "auto",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat",
            }}>
                <Toolbar />

                {/* ── Page header ── */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{
                        fontWeight: 800, letterSpacing: 0.2,
                        background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                        Gestion des clients
                    </Typography>

                </Box>

                {/* ── Search + filters + create ── */}

                <Card sx={{ p: 2, mb: 2, bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                        <TextField
                            placeholder="Rechercher par nom, email, téléphone, ville..."
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
                                flex: 1, minWidth: 250,
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "rgba(0,0,0,0.2)",
                                    "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                                },
                            }}
                        />

                        {/* Status filter chips */}
                        <Box sx={{ display: "flex", gap: 0.75 }}>
                            {statusFilterOptions.map((opt) => {
                                const active = statusFilter === opt.value;
                                return (
                                    <Chip
                                        key={opt.value}
                                        label={opt.value === "all" ? `${opt.label} (${clients.length})` : opt.value === "actif" ? `${opt.label} (${activeCount})` : `${opt.label} (${clients.length - activeCount})`}
                                        size="small"
                                        onClick={() => setStatusFilter(opt.value)}
                                        sx={{
                                            height: 28, fontSize: "0.75rem", fontWeight: 600,
                                            cursor: "pointer",
                                            bgcolor: active ? "rgba(47,124,201,0.2)"    : "rgba(255,255,255,0.04)",
                                            color:   active ? "primary.light"           : "text.secondary",
                                            border:  `1px solid ${active ? "rgba(147,181,218,0.4)" : "rgba(147,181,218,0.12)"}`,
                                            "&:hover": { bgcolor: "rgba(47,124,201,0.15)" },
                                            transition: "all 0.15s ease",
                                        }}
                                    />
                                );
                            })}
                        </Box>

                        <Button variant="contained" startIcon={<AddIcon />}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                                onClick={() => { setEditClient(null); setFormOpen(true); }}>
                            Créer un client
                        </Button>
                    </Box>
                </Card>

                {/* ── Table ── */}
                {clientsError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {clientsError}
                    </Alert>
                )}
                {loadingClients && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Chargement des clients...
                    </Alert>
                )}
                <TableContainer component={Paper} sx={{
                    bgcolor: "rgba(10,37,77,0.6)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    borderRadius: 2,
                    maxHeight: 560,
                    overflowX: "auto",
                    "& .MuiTableHead-root .MuiTableCell-root": {
                        fontWeight: 700, color: "text.secondary", fontSize: "0.72rem",
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        borderBottom: "1px solid rgba(147,181,218,0.25)", py: 1.5,
                        bgcolor: "rgba(15,45,90,0.95)",
                    },

                    "& .MuiTableBody-root .MuiTableRow-root": {
                        transition: "background 0.15s ease",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                    },
                    "& .MuiTableCell-root": {
                        borderBottom: "1px solid rgba(147,181,218,0.1)",
                        color: "text.primary",
                        px: 1.5, py: 1,
                    },
                }}>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow>
                                <SortableCell field="nom" label="Client" currentField={sortField} currentDir={sortDir} onSort={handleSort} onClear={clearSort} />
                                <TableCell sx={{ width: 90 }}>Ville</TableCell>
                                <SortableCell field="reservations" label="Réserv." currentField={sortField} currentDir={sortDir} onSort={handleSort} onClear={clearSort} align="center" />
                                <SortableCell field="annulations" label="Annul." currentField={sortField} currentDir={sortDir} onSort={handleSort} onClear={clearSort} align="center" />
                                <SortableCell field="note" label="Note" currentField={sortField} currentDir={sortDir} onSort={handleSort} onClear={clearSort} align="center" />
                                <SortableCell field="activite" label="Activité" currentField={sortField} currentDir={sortDir} onSort={handleSort} onClear={clearSort} />
                                <TableCell sx={{ width: 80 }}>Statut</TableCell>
                                <TableCell align="right" sx={{ width: 100 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRows.map((client) => {
                                const resCount = resByClient[client.id] ?? 0;
                                return (
                                    <TableRow key={client.id}>

                                        {/* Avatar + name + email */}
                                        <TableCell sx={{ py: 1.25 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Avatar src={client.avatar} sx={{
                                                    width: 36, height: 36, bgcolor: avatarBg(client.id),
                                                    fontSize: "0.78rem", fontWeight: 700,
                                                    border: "1px solid rgba(147,181,218,0.18)",
                                                }}>
                                                    {!client.avatar && getInitials(client.firstName, client.lastName)}
                                                </Avatar>
                                                <Box>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                                                            {client.firstName} {client.lastName}
                                                        </Typography>
                                                        <Tooltip title="Envoyer un message">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(event) => void handleMessageClient(event, client)}
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
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                                        {client.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Ville */}
                                        <TableCell>
                                            {(client as any).ville ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <LocationOnIcon sx={{ fontSize: 13, color: "rgba(148,163,184,0.45)" }} />
                                                    <Typography variant="body2" color="text.secondary">{(client as any).ville}</Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled">—</Typography>
                                            )}
                                        </TableCell>

                                        {/* Réservations */}
                                        <TableCell align="center">
                                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1, py: 0.25,
                                                borderRadius: "20px", bgcolor: resCount >= 5 ? "rgba(47,124,201,0.12)" : "transparent" }}>
                                                <EventNoteIcon sx={{ fontSize: 13, color: "rgba(148,163,184,0.45)" }} />
                                                <Typography variant="body2" fontWeight={600} sx={{
                                                    color: resCount >= 10 ? "primary.light" : resCount >= 3 ? "text.primary" : "text.secondary",
                                                }}>
                                                    {resCount}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        {/* Annulations */}
                                        <TableCell align="center">
                                            {(() => {
                                                const total     = resByClient[client.id] ?? 0;
                                                const cancelled = cancelByClient[client.id] ?? 0;
                                                const rate      = cancelRateByClient[client.id] ?? 0;
                                                if (total === 0) return <Typography variant="body2" color="text.disabled">—</Typography>;
                                                return (
                                                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "20px",
                                                        bgcolor: rate >= 50 ? "rgba(239,68,68,0.1)" : rate >= 25 ? "rgba(245,158,11,0.1)" : "transparent" }}>
                                                        <Typography variant="body2" fontWeight={600} sx={{
                                                            color: rate >= 50 ? "error.main" : rate >= 25 ? "warning.main" : "text.secondary"
                                                        }}>
                                                            {rate}%
                                                        </Typography>
                                                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                                                            ({cancelled}/{total})
                                                        </Typography>
                                                    </Box>
                                                );
                                            })()}
                                        </TableCell>

                                        {/* Note moyenne */}
                                        <TableCell align="center">
                                            {(() => {
                                                const avg = avgRatingByClient[client.id];
                                                if (avg === undefined) return <Typography variant="body2" color="text.disabled">—</Typography>;
                                                return (
                                                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                                                        <StarIcon sx={{ fontSize: 13, color: "#f59e0b" }} />
                                                        <Typography variant="body2" fontWeight={600} sx={{
                                                            color: avg >= 4 ? "#f59e0b" : avg >= 3 ? "text.primary" : "error.main"
                                                        }}>
                                                            {avg.toFixed(1)}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })()}
                                        </TableCell>

                                        {/* Dernière activité */}
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.85 }}>
                                                <ActivityDot dateStr={(client as any).lastActivityAt} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                                                        {formatLastActivity((client as any).lastActivityAt)}
                                                    </Typography>
                                                    {(client as any).lastActivityAt && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.67rem" }}>
                                                            {new Date((client as any).lastActivityAt).toLocaleDateString("fr-FR")}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {/* Statut */}
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                icon={client.isActive ? <CheckCircleIcon style={{ fontSize: 12 }} /> : <BlockIcon style={{ fontSize: 12 }} />}
                                                label={client.isActive ? "Actif" : "Désactivé"}
                                                sx={{
                                                    height: 22, fontSize: "0.7rem", fontWeight: 600,
                                                    bgcolor: client.isActive ? "rgba(34,197,94,0.1)"  : "rgba(148,163,184,0.08)",
                                                    color:   client.isActive ? "success.main"         : "text.disabled",
                                                    border:  `1px solid ${client.isActive ? "rgba(34,197,94,0.28)" : "rgba(148,163,184,0.18)"}`,
                                                    "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
                                                }}
                                            />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                            <Tooltip title="Voir profil">
                                                <IconButton size="small" sx={{ color: "primary.light" }}
                                                            onClick={() => navigate(`/clients/${client.id}`)}>
                                                    <VisibilityIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Modifier">
                                                <IconButton size="small" sx={{ color: "text.secondary" }}
                                                            onClick={() => { setEditClient(client); setFormOpen(true); }}>
                                                    <EditIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={client.isActive ? "Désactiver" : "Activer"}>
                                                <IconButton size="small"
                                                            sx={{ color: client.isActive ? "warning.main" : "success.main" }}
                                                            onClick={() => handleToggleActive(client)}>
                                                    {client.isActive ? <BlockIcon sx={{ fontSize: 17 }} /> : <CheckCircleIcon sx={{ fontSize: 17 }} />}
                                                </IconButton>
                                            </Tooltip>
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

                {paginatedRows.length === 0 && (
                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Typography color="text.secondary">Aucun client trouvé</Typography>
                    </Box>
                )}

                <ClientFormModal
                    open={formOpen}
                    client={editClient}
                    onClose={() => { setEditClient(null); setFormOpen(false); }}
                    onSave={handleSaveClient}
                />
                <ConfirmDeactivateDialog
                    open={Boolean(confirmClient)}
                    client={confirmClient}
                    onConfirm={handleConfirmDeactivate}
                    onCancel={() => setConfirmClient(null)}
                />
            </Box>
        </Box>
    );
}
