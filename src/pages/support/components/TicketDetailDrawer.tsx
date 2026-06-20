import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import type { Ticket, TicketStatus, TicketCategory } from "../../context/SupportContext";
import { useNavigate } from "react-router-dom";
import { fetchAdminProviders, type AdminProvider } from "../../../api/providers";

const statusConfig: Record<
    TicketStatus,
    { label: string; color: "warning" | "info" | "success" | "default" }
> = {
    ouvert: { label: "Ouvert", color: "warning" },
    en_cours: { label: "En cours", color: "info" },
    resolu: { label: "Resolu", color: "success" },
    ferme: { label: "Ferme", color: "default" },
};

const avatarColor: Record<string, string> = {
    client: "#2F7CC9",
    prestataire: "#F08A2F",
    admin: "#9c27b0",
};

const litigeActions = [
    { value: "REFUND_CLIENT", label: "Rembourser le client" },
    { value: "REASSIGN_PROVIDER", label: "Reassigner un prestataire" },
    { value: "PROVIDER_WARNING", label: "Avertir le prestataire" },
    { value: "CLIENT_WARNING", label: "Avertir le client" },
    { value: "NO_ACTION", label: "Clore sans action" },
];

type Props = {
    ticket: Ticket | null;
    onClose: () => void;
    onReply: (id: string, msg: string) => Promise<void>;
    onStatusChange: (id: string, status: TicketStatus) => Promise<void>;
    onCategoryChange: (id: string, category: TicketCategory) => Promise<void>;
    onToggleLitige: (id: string) => Promise<void>;
    onAdminNote: (id: string, note: string) => Promise<void>;
    onResolve: (id: string, action: string, note: string, newPrestataireId?: string) => Promise<void>;
};

export default function TicketDetailDrawer({
                                               ticket,
                                               onClose,
                                               onReply,
                                               onStatusChange,
                                               onCategoryChange,
                                               onToggleLitige,
                                               onAdminNote,
                                               onResolve,
                                           }: Props) {
    const [msg, setMsg] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [resolutionNote, setResolutionNote] = useState("");
    const [resolutionAct, setResolutionAct] = useState("");
    const [newPrestataireId, setNewPrestataireId] = useState("");
    const [providers, setProviders] = useState<AdminProvider[]>([]);
    const [providersLoading, setProvidersLoading] = useState(false);
    const [providersLoaded, setProvidersLoaded] = useState(false);
    const [providersError, setProvidersError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (resolutionAct !== "REASSIGN_PROVIDER" || providersLoaded) return;

        let cancelled = false;

        const loadProviders = async () => {
            try {
                setProvidersLoading(true);
                setProvidersError("");
                const response = await fetchAdminProviders()
                if (!cancelled) {
                    setProviders(response);
                    setProvidersLoaded(true);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setProvidersError(err?.response?.data?.message || "Erreur chargement prestataires");
                    setProvidersLoaded(true);
                }
            } finally {
                if (!cancelled) setProvidersLoading(false);
            }
        };

        void loadProviders();

        return () => {
            cancelled = true;
        };
    }, [providersLoaded, resolutionAct]);

    const eligibleProviders = useMemo(
        () =>
            providers.filter((provider) => {
                const status = String(provider.status ?? "").toLowerCase();
                const isRejectedOrSuspended = status === "rejected" || status === "suspended";
                return !isRejectedOrSuspended && provider.active !== false && provider.available !== false;
            }),
        [providers]
    );

    const formatProviderName = (provider: AdminProvider) => {
        const personalName = `${provider.firstName ?? ""} ${provider.lastName ?? ""}`.trim();
        return provider.businessName || provider.name || personalName || provider.email || `Prestataire #${provider.id}`;
    };

    if (!ticket) return null;
    const sc = statusConfig[ticket.status];

    const handleReply = async () => {
        if (!msg.trim()) return;
        setSubmitting(true);
        try {
            await onReply(ticket.id, msg.trim());
            setMsg("");
        } catch {
            return;
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveNote = async () => {
        if (!adminNote.trim()) return;
        setSubmitting(true);
        try {
            await onAdminNote(ticket.id, adminNote.trim());
            setAdminNote("");
        } catch {
            return;
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolve = async () => {
        if (!resolutionAct) return;
        if (resolutionAct === "REASSIGN_PROVIDER" && !newPrestataireId.trim()) return;

        setSubmitting(true);
        try {
            await onResolve(
                ticket.id,
                resolutionAct,
                resolutionNote.trim(),
                resolutionAct === "REASSIGN_PROVIDER" ? newPrestataireId.trim() : undefined
            );
            setResolutionNote("");
            setResolutionAct("");
            setNewPrestataireId("");
        } catch {
            return;
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (status: TicketStatus) => {
        setSubmitting(true);
        try {
            await onStatusChange(ticket.id, status);
        } catch {
            return;
        } finally {
            setSubmitting(false);
        }
    };

    const handleCategoryChange = async (category: TicketCategory) => {
        setSubmitting(true);
        try {
            await onCategoryChange(ticket.id, category);
        } catch {
            return;
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleLitige = async () => {
        setSubmitting(true);
        try {
            await onToggleLitige(ticket.id);
        } catch {
            return;
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={Boolean(ticket)}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 480,
                    bgcolor: "rgba(8,20,50,0.98)",
                    borderLeft: "1px solid rgba(147,181,218,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                },
            }}
        >
            <Box
                sx={{
                    p: 2.5,
                    borderBottom: "1px solid rgba(147,181,218,0.15)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <Box sx={{ flex: 1, pr: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {ticket.isLitige && <GavelIcon sx={{ fontSize: 18, color: "error.main" }} />}
                        <Typography variant="h6" fontWeight={700}>
                            {ticket.subject}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        #{ticket.id}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": {
                        bgcolor: "rgba(148,163,184,0.3)",
                        borderRadius: 10,
                    },
                }}
            >
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                        label={sc.label}
                        size="small"
                        color={sc.color}
                        variant="outlined"
                        sx={{ fontSize: "0.72rem" }}
                    />
                    {ticket.isLitige && (
                        <Chip
                            label="Litige"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: "0.72rem" }}
                        />
                    )}
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Statut</InputLabel>
                        <Select
                            value={ticket.status}
                            label="Statut"
                            onChange={(e) => void handleStatusChange(e.target.value as TicketStatus)}
                            disabled={submitting}
                        >
                            <MenuItem value="ouvert">Ouvert</MenuItem>
                            <MenuItem value="en_cours">En cours</MenuItem>
                            <MenuItem value="resolu">Resolu</MenuItem>
                            <MenuItem value="ferme">Ferme</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                        <InputLabel>Categorie</InputLabel>
                        <Select
                            value={ticket.category}
                            label="Categorie"
                            onChange={(e) => void handleCategoryChange(e.target.value as TicketCategory)}
                            disabled={submitting}
                        >
                            <MenuItem value="incident">Incident</MenuItem>
                            <MenuItem value="question_generale">Question generale</MenuItem>
                            <MenuItem value="demande_remboursement">Remboursement</MenuItem>
                            <MenuItem value="litige">Litige</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                        >
                            De
                        </Typography>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary.light"
                            sx={{ cursor: "pointer", mt: 0.5, "&:hover": { textDecoration: "underline" } }}
                            onClick={() =>
                                navigate(`/${ticket.fromType === "client" ? "clients" : "providers"}/${ticket.fromId}`)
                            }
                        >
                            {ticket.fromName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {ticket.fromType === "client" ? "Client" : "Prestataire"}
                        </Typography>
                    </Box>

                    {ticket.reservationId && (
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                            >
                                Reservation
                            </Typography>
                            <Typography
                                variant="body2"
                                color="primary.light"
                                sx={{ cursor: "pointer", mt: 0.5, "&:hover": { textDecoration: "underline" } }}
                                onClick={() => navigate("/reservations")}
                            >
                                {ticket.reservationTitle}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}
                    >
                        Conversation ({ticket.messages.length})
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {ticket.messages.map((m, i) => {
                            const color = avatarColor[m.from] ?? "#60a5fa";
                            const Icon =
                                m.from === "admin"
                                    ? AdminPanelSettingsIcon
                                    : m.from=== "prestataire"
                                        ? EngineeringIcon
                                        : PersonIcon;

                            return (
                                <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                                    <Avatar
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            bgcolor: `${color}22`,
                                            border: `1px solid ${color}55`,
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 14, color }} />
                                    </Avatar>

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.25 }}>
                                            <Typography variant="caption" fontWeight={700} sx={{ color }}>
                                                {m.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(m.date).toLocaleDateString("fr-FR")}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                            {m.message}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Repondre au ticket..."
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && void handleReply()}
                        disabled={submitting}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(0,0,0,0.2)",
                                "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                            },
                        }}
                    />
                    <IconButton
                        onClick={() => void handleReply()}
                        disabled={!msg.trim() || submitting}
                        sx={{
                            color: "primary.light",
                            bgcolor: "rgba(47,124,201,0.15)",
                            borderRadius: 1.5,
                            "&:hover": { bgcolor: "rgba(47,124,201,0.25)" },
                        }}
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}
                    >
                        Note interne (non visible par l'utilisateur)
                    </Typography>

                    {ticket.adminNote && (
                        <Box
                            sx={{
                                p: 1.5,
                                mb: 1,
                                bgcolor: "rgba(156,39,176,0.1)",
                                border: "1px solid rgba(156,39,176,0.25)",
                                borderRadius: 1.5,
                            }}
                        >
                            <Typography variant="body2" color="secondary.light" sx={{ fontStyle: "italic" }}>
                                {ticket.adminNote}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ajouter une note interne..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            disabled={submitting}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "rgba(0,0,0,0.2)",
                                    "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                                },
                            }}
                        />
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => void handleSaveNote()}
                            disabled={!adminNote.trim() || submitting}
                        >
                            Sauvegarder
                        </Button>
                    </Box>
                </Box>

                {ticket.isLitige && ticket.status !== "resolu" && ticket.status !== "ferme" && (
                    <>
                        <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />
                        <Box>
                            <Typography
                                variant="caption"
                                color="error.main"
                                sx={{
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    display: "block",
                                    mb: 1.5,
                                    fontWeight: 700,
                                }}
                            >
                                Resolution du litige
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Action de resolution</InputLabel>
                                    <Select
                                        value={resolutionAct}
                                        label="Action de resolution"
                                        onChange={(e) => setResolutionAct(e.target.value)}
                                        disabled={submitting}
                                    >
                                        {litigeActions.map((a) => (
                                            <MenuItem key={a.value} value={a.value}>
                                                {a.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {resolutionAct === "REASSIGN_PROVIDER" && (
                                    <FormControl size="small" fullWidth disabled={submitting}>
                                        <InputLabel>Nouveau prestataire</InputLabel>
                                        <Select
                                            value={newPrestataireId}
                                            label="Nouveau prestataire"
                                            onChange={(e) => setNewPrestataireId(e.target.value)}
                                        >
                                            {providersLoading && (
                                                <MenuItem value="" disabled>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <CircularProgress size={14} />
                                                        Chargement...
                                                    </Box>
                                                </MenuItem>
                                            )}
                                            {!providersLoading &&
                                                eligibleProviders.map((provider) => (
                                                    <MenuItem key={provider.id} value={String(provider.id)}>
                                                        {formatProviderName(provider)}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                        {providersError && (
                                            <Typography variant="caption" color="error.main" sx={{ mt: 0.75 }}>
                                                {providersError}
                                            </Typography>
                                        )}
                                        {!providersLoading && !providersError && eligibleProviders.length === 0 && (
                                            <Typography variant="caption" color="warning.main" sx={{ mt: 0.75 }}>
                                                Aucun prestataire disponible.
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}

                                <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    placeholder="Note de resolution (optionnel)..."
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                    disabled={submitting}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "rgba(0,0,0,0.2)",
                                            "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                                        },
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => void handleResolve()}
                                    disabled={
                                        !resolutionAct ||
                                        submitting ||
                                        (resolutionAct === "REASSIGN_PROVIDER" && !newPrestataireId.trim())
                                    }
                                >
                                    Appliquer la resolution
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}

                {ticket.resolutionAction && (
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            borderRadius: 1.5,
                        }}
                    >
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                            Resolution appliquee
                        </Typography>
                        <Typography variant="body2" color="success.light" sx={{ mt: 0.25 }}>
                            {litigeActions.find((a) => a.value === ticket.resolutionAction)?.label ?? ticket.resolutionAction}
                        </Typography>
                        {ticket.resolutionNote && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: "italic" }}>
                                "{ticket.resolutionNote}"
                            </Typography>
                        )}
                    </Box>
                )}

                <Button
                    size="small"
                    variant="outlined"
                    color={ticket.isLitige ? "warning" : "error"}
                    startIcon={<GavelIcon />}
                    onClick={() => void handleToggleLitige()}
                    disabled={submitting}
                >
                    {ticket.isLitige ? "Retirer le flag litige" : "Marquer comme litige"}
                </Button>
            </Box>
        </Drawer>
    );
}
