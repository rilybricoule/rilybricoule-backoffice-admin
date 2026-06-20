import { useState } from "react";
import {
    Avatar, Box, Chip, Divider, Drawer,
    IconButton, Typography,
} from "@mui/material";
import CloseIcon              from "@mui/icons-material/Close";
import PersonIcon             from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EngineeringIcon        from "@mui/icons-material/Engineering";
import SendIcon               from "@mui/icons-material/Send";
import BlockIcon              from "@mui/icons-material/Block";
import ReplayIcon             from "@mui/icons-material/Replay";
import { type Reservation } from "../context/Reservationcontext";
import { resStatusConfig, payStatusConfig, msgColor } from "../../config/Reservationconfig";

interface Props {
    reservation: Reservation | null;
    onClose:  () => void;
    onCancel: (r: Reservation) => void;
    onReset:  (r: Reservation) => void;
    onSend:   (id: string, msg: string) => void;
}

export default function ReservationDrawer({ reservation, onClose, onCancel, onReset, onSend }: Props) {
    const [msg, setMsg] = useState("");

    if (!reservation) return null;

    const sc = resStatusConfig[reservation.status];
    const ps = payStatusConfig[reservation.paymentStatus];
    const canCancel = reservation.status !== "annulee" && reservation.status !== "Réservé";
    const canReset  = reservation.status === "annulee" || reservation.status === "Réservé";

    const handleSend = () => {
        if (!msg.trim()) return;
        onSend(reservation.id, msg.trim());
        setMsg("");
    };

    return (
        <Drawer
            anchor="right"
            open={Boolean(reservation)}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 460,
                    bgcolor: "rgba(8,20,50,0.98)",
                    borderLeft: "1px solid rgba(147,181,218,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(147,181,218,0.15)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">{reservation.offerTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">#{reservation.id}</Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Scrollable body */}
            <Box sx={{
                flex: 1, overflowY: "auto", p: 2.5,
                display: "flex", flexDirection: "column", gap: 2,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(148,163,184,0.3)", borderRadius: 10 },
            }}>
                {/* Status chips */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip label={sc.label} size="small" color={sc.color} variant="outlined" sx={{ fontSize: "0.72rem" }} />
                    <Chip label={ps.label} size="small" color={ps.color} variant="outlined" sx={{ fontSize: "0.72rem" }} />
                    <Chip label={reservation.paymentMethod.toUpperCase()} size="small" variant="outlined"
                          sx={{ fontSize: "0.72rem", borderColor: "rgba(147,181,218,0.3)", color: "text.secondary" }} />
                    <Chip label={reservation.category} size="small" variant="outlined"
                          sx={{ fontSize: "0.72rem", borderColor: "rgba(147,181,218,0.3)", color: "text.secondary" }} />
                </Box>

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                {/* Client / Provider */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    {[
                        { label: "Client",      value: reservation.clientName,   href: `/clients/${reservation.clientId}`   },
                        { label: "Prestataire", value: reservation.providerName, href: `/providers/${reservation.providerId}` },
                    ].map((item) => (
                        <Box key={item.label}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                {item.label}
                            </Typography>
                            <Typography
                                variant="body2" fontWeight={600}
                                sx={{ color: "primary.light", cursor: "pointer", mt: 0.5, "&:hover": { textDecoration: "underline" } }}
                                onClick={() => window.location.href = item.href}
                            >
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Date / Time */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Date prévue</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                            {new Date(reservation.scheduledDate).toLocaleDateString("fr-FR")}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Heure</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>{reservation.scheduledTime}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                {/* Financier */}
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1 }}>
                        Financier
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
                        {[
                            { label: "Total client", value: `${reservation.amount} MAD`,        color: "primary.light" },
                            { label: "Commission",   value: `${reservation.commission} MAD`,     color: "warning.main"  },
                            { label: "Prestataire",  value: `${reservation.providerPayout} MAD`, color: "success.main"  },
                        ].map((item) => (
                            <Box key={item.label} sx={{ p: 1, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1, border: "1px solid rgba(147,181,218,0.1)" }}>
                                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                <Typography variant="body2" fontWeight={700} sx={{ color: item.color, mt: 0.25 }}>{item.value}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Cancel reason */}
                {reservation.cancelReason && (
                    <Box sx={{ p: 1.5, bgcolor: "rgba(211,47,47,0.1)", border: "1px solid rgba(211,47,47,0.25)", borderRadius: 1.5 }}>
                        <Typography variant="caption" color="error.main" fontWeight={600}>Raison d'annulation</Typography>
                        <Typography variant="body2" color="error.light" sx={{ mt: 0.25, fontStyle: "italic" }}>{reservation.cancelReason}</Typography>
                    </Box>
                )}

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                {/* Messages */}
                <Box>
                    <Typography variant="caption" color="text.secondary"
                                sx={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
                        Échanges ({reservation.messages.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {reservation.messages.map((m, i) => {
                            const color = msgColor[m.from] ?? "#60a5fa";
                            const Icon  = m.from === "admin"
                                ? AdminPanelSettingsIcon
                                : m.from === "prestataire"
                                    ? EngineeringIcon
                                    : PersonIcon;
                            return (
                                <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: `${color}22`, border: `1px solid ${color}55` }}>
                                        <Icon sx={{ fontSize: 14, color }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.25 }}>
                                            <Typography variant="caption" fontWeight={700} sx={{ color }}>{m.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(m.date).toLocaleDateString("fr-FR")}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>{m.message}</Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* Message input */}
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Box
                        component="input"
                        placeholder="Ajouter un message admin..."
                        value={msg}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMsg(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSend()}
                        sx={{
                            flex: 1, px: 1.5, py: 1,
                            bgcolor: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(147,181,218,0.2)",
                            borderRadius: 1.5,
                            color: "text.primary", fontSize: "0.875rem", outline: "none",
                            "&::placeholder": { color: "rgba(148,163,184,0.6)" },
                        }}
                    />
                    <IconButton onClick={handleSend} disabled={!msg.trim()}
                                sx={{ color: "primary.light", bgcolor: "rgba(47,124,201,0.15)", borderRadius: 1.5 }}>
                        <SendIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider sx={{ borderColor: "rgba(147,181,218,0.12)" }} />

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {canCancel && (
                        <Box component="button" onClick={() => onCancel(reservation)}
                             sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.75, border: "1px solid", borderColor: "error.main", borderRadius: 1.5, bgcolor: "transparent", color: "error.main", cursor: "pointer", fontSize: "0.8rem", "&:hover": { bgcolor: "rgba(211,47,47,0.1)" } }}>
                            <BlockIcon sx={{ fontSize: 16 }} /> Annuler
                        </Box>
                    )}
                    {canReset && (
                        <Box component="button" onClick={() => onReset(reservation)}
                             sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.75, border: "1px solid", borderColor: "warning.main", borderRadius: 1.5, bgcolor: "transparent", color: "warning.main", cursor: "pointer", fontSize: "0.8rem", "&:hover": { bgcolor: "rgba(255,170,0,0.1)" } }}>
                            <ReplayIcon sx={{ fontSize: 16 }} /> Remettre en attente
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}