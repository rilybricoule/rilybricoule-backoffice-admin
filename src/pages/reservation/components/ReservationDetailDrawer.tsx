import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import EngineeringIcon from "@mui/icons-material/Engineering";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PaymentsIcon from "@mui/icons-material/Payments";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import TuneIcon from "@mui/icons-material/Tune";
import { useNavigate } from "react-router-dom";
import type { Reservation, ReservationStatus } from "../../../Data/Reservation";

const statusConfig: Record<ReservationStatus, {
    label: string;
    color: "default" | "warning" | "success" | "error" | "info";
}> = {
    pending: {
        label: "Paiement en attente",
        color: "warning",
    },
    confirmed: {
        label: "Confirmée",
        color: "info",
    },
    completed: {
        label: "Terminée",
        color: "success",
    },
    cancelled: {
        label: "Annulée",
        color: "error",
    },
};

const methodLabel: Record<string, string> = {
    carte: "Carte",
    especes: "Espèces",
};

const avatarColor: Record<string, string> = {
    client: "#2F7CC9",
    prestataire: "#F08A2F",
    admin: "#9c27b0",
};

type Props = {
    reservation: Reservation | null;
    onClose: () => void;
    onCancel: (r: Reservation) => void;
    onSimulateCompleted: (r: Reservation) => void;
    onSendMessage: (id: string, msg: string) => void;
    onReschedule: (id: string, date: string, time: string) => void;
    onResetStatus: (r: Reservation) => void;
    onReassign: (r: Reservation) => void;
};

export default function ReservationDetailDrawer({
                                                    reservation,
                                                    onClose,
                                                    onCancel,
                                                    onSimulateCompleted,
                                                    onSendMessage,
                                                    onReschedule,
                                                }: Props) {
    const [msg, setMsg] = useState("");
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    const navigate = useNavigate();

    if (!reservation) return null;

    const r = reservation;

    const sc = statusConfig[r.status] ?? {
        label: String(r.status),
        color: "default" as const,
    };

    const reservationTitle = r.serviceName || `Réservation #${r.id}`;

    const canAct = r.status === "pending" || r.status === "confirmed";
    const canReschedule = r.status === "pending" || r.status === "confirmed";

    const handleSend = () => {
        if (!msg.trim()) return;

        onSendMessage(r.id, msg.trim());
        setMsg("");
    };

    const handleReschedule = () => {
        if (!newDate || !newTime) return;

        onReschedule(r.id, newDate, newTime);
        setRescheduleOpen(false);
    };

    return (
        <Drawer
            anchor="right"
            open={Boolean(reservation)}
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
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {reservationTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        #{r.id}
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

                    {r.category && r.category !== "—" && (
                        <Chip
                            label={r.category}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: "0.72rem",
                                borderColor: "rgba(147,181,218,0.3)",
                                color: "text.secondary",
                            }}
                        />
                    )}

                    <Chip
                        label={methodLabel[r.paymentMethod] ?? r.paymentMethod}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontSize: "0.72rem",
                            borderColor: "rgba(147,181,218,0.3)",
                            color: "text.secondary",
                        }}
                    />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                        >
                            Client
                        </Typography>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary.light"
                            sx={{
                                cursor: "pointer",
                                mt: 0.5,
                                "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={() => navigate(`/clients/${r.clientId}`)}
                        >
                            {r.clientName}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                        >
                            Prestataire
                        </Typography>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary.light"
                            sx={{
                                cursor: "pointer",
                                mt: 0.5,
                                "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={() => navigate(`/providers/${r.providerId}`)}
                        >
                            {r.providerName}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                        >
                            Date prévue
                        </Typography>

                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                            {new Date(r.scheduledDate).toLocaleDateString("fr-FR")} à{" "}
                            {r.scheduledTime}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                        >
                            Créée le
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: "rgba(47,124,201,0.08)",
                        border: "1px solid rgba(47,124,201,0.2)",
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PaymentsIcon sx={{ fontSize: 16, color: "primary.light" }} />
                        <Typography variant="body2" color="primary.light">
                            Voir le paiement associé
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            onClose();
                            navigate(`/payments?reservation=${r.id}`);



                        }}
                    >
                        Détails
                    </Button>
                </Box>

                {r.cancelReason && (
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: "rgba(211,47,47,0.1)",
                            border: "1px solid rgba(211,47,47,0.25)",
                            borderRadius: 1.5,
                        }}
                    >
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                            Raison d'annulation
                        </Typography>

                        <Typography
                            variant="body2"
                            color="error.light"
                            sx={{ mt: 0.25, fontStyle: "italic" }}
                        >
                            {r.cancelReason}
                        </Typography>
                    </Box>
                )}

                {r.adminNote && (
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: "rgba(156,39,176,0.1)",
                            border: "1px solid rgba(156,39,176,0.25)",
                            borderRadius: 1.5,
                        }}
                    >
                        <Typography variant="caption" color="secondary.main" fontWeight={600}>
                            Note admin
                        </Typography>

                        <Typography
                            variant="body2"
                            color="secondary.light"
                            sx={{ mt: 0.25, fontStyle: "italic" }}
                        >
                            {r.adminNote}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            display: "block",
                            mb: 1.5,
                        }}
                    >
                        Échanges ({r.messages.length})
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {r.messages.map((m, i) => {
                            const color = avatarColor[m.from] ?? "#60a5fa";

                            const Icon =
                                m.from === "admin"
                                    ? AdminPanelSettingsIcon
                                    : m.from === "prestataire"
                                        ? EngineeringIcon
                                        : PersonIcon;

                            return (
                                <Box
                                    key={i}
                                    sx={{
                                        display: "flex",
                                        gap: 1.5,
                                        alignItems: "flex-start",
                                    }}
                                >
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
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                alignItems: "center",
                                                mb: 0.25,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                fontWeight={700}
                                                sx={{ color }}
                                            >
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
                        placeholder="Ajouter une note admin..."
                        value={msg}
                        onChange={(event) => setMsg(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleSend()}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(0,0,0,0.2)",
                                "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                            },
                        }}
                    />

                    <IconButton
                        onClick={handleSend}
                        disabled={!msg.trim()}
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

                {canAct && (
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                display: "block",
                                mb: 1,
                            }}
                        >
                            Actions réservation
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<TuneIcon />}
                                sx={{
                                    display: r.status === "confirmed" || r.status === "completed" ? "inline-flex" : "none",
                                    borderColor: "rgba(167,139,250,0.45)",
                                    color: "#c4b5fd",
                                }}
                                onClick={() => {
                                    onSimulateCompleted(r);
                                    onClose();
                                }}
                            >
                                {r.status === "completed" ? "Retour a reserve" : "Simuler prestataire termine"}
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<BlockIcon />}
                                onClick={() => onCancel(r)}
                            >
                                Annuler
                            </Button>

                            {canReschedule && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    startIcon={<EditCalendarIcon />}
                                    onClick={() => {
                                        setNewDate(r.scheduledDate);
                                        setNewTime(r.scheduledTime);
                                        setRescheduleOpen(true);
                                    }}
                                >
                                    Replanifier
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}

                {rescheduleOpen && (
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: "rgba(47,124,201,0.1)",
                            border: "1px solid rgba(47,124,201,0.25)",
                            borderRadius: 1.5,
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="primary.light"
                            fontWeight={600}
                            sx={{ display: "block", mb: 1 }}
                        >
                            Nouvelle date et heure
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                type="date"
                                size="small"
                                value={newDate}
                                onChange={(event) => setNewDate(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    flex: 1,
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        "& fieldset": {
                                            borderColor: "rgba(147,181,218,0.2)",
                                        },
                                    },
                                }}
                            />

                            <TextField
                                type="time"
                                size="small"
                                value={newTime}
                                onChange={(event) => setNewTime(event.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    width: 110,
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        "& fieldset": {
                                            borderColor: "rgba(147,181,218,0.2)",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Button
                                size="small"
                                variant="contained"
                                color="info"
                                disabled={!newDate || !newTime}
                                onClick={handleReschedule}
                            >
                                Confirmer
                            </Button>

                            <Button size="small" onClick={() => setRescheduleOpen(false)}>
                                Annuler
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}
