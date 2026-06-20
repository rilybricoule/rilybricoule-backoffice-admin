import {
    Box, Button, Chip, Drawer, IconButton, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type {
    ReceivedNotification,
    NotificationChannel,
    NotificationType,
} from "../../Data/Notification";
import { useNavigate } from "react-router-dom";

// ── Config ────────────────────────────────────────────────────────────────────

const typeConfig: Record<NotificationType, {
    label: string;
    color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}> = {
    booking: { label: "Réservation", color: "primary"   },
    payment: { label: "Paiement",    color: "success"   },
    chat:    { label: "Message",     color: "info"      },
    review:  { label: "Avis",        color: "secondary" },
    dispute: { label: "Litige",      color: "error"     },
    account: { label: "Compte",      color: "warning"   },
    promo:   { label: "Promo",       color: "secondary" },
    system:  { label: "Système",     color: "default"   },
};

const channelConfig: Record<NotificationChannel, {
    label: string;
    color: "primary" | "success" | "warning";
}> = {
    push:  { label: "Push",  color: "primary" },
    email: { label: "Email", color: "success" },
    sms:   { label: "SMS",   color: "warning" },
};

const roleLabel: Record<"client" | "provider" | "system", string> = {
    client:   "Client",
    provider: "Prestataire",
    system:   "Système",
};

const chipSx = { fontSize: "0.7rem", height: 20, "& .MuiChip-label": { px: 0.8 } };

const sectionLabelSx = {
    fontSize: "0.65rem",
    color: "rgba(147,181,218,0.5)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontWeight: 600,
};

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
    notification: ReceivedNotification | null;
    onClose:      () => void;
    onDelete:     (id: string) => void;
    onMarkRead:   (id: string) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationDetailDrawer({
                                                     notification, onClose, onDelete, onMarkRead,
                                                 }: Props) {

    const isOpen = Boolean(notification);
    const navigate = useNavigate();

    const initials = notification
        ? notification.triggeredBy
            .split(" ")
            .map(w => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "";

    const formattedDate = notification
        ? new Date(notification.sentAt).toLocaleDateString("fr-FR", {
            day: "2-digit", month: "long", year: "numeric",
        })
        : "";

    const tc = notification ? typeConfig[notification.type]       : null;
    const cc = notification ? channelConfig[notification.channel] : null;

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 380,
                    bgcolor: "rgba(6,22,52,0.99)",
                    borderLeft: "1px solid rgba(147,181,218,0.18)",
                    boxShadow: "none",
                    p: 0,
                },
            }}
        >
            {notification && tc && cc && (
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

                    {/* ── Header ───────────────────────────────────────────── */}
                    <Box sx={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        px: 2.5, py: 2,
                        borderBottom: "1px solid rgba(147,181,218,0.12)",
                        flexShrink: 0,
                    }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>
                            Détail notification
                        </Typography>
                        <IconButton
                            size="small" onClick={onClose}
                            sx={{
                                color: "rgba(255,255,255,0.4)",
                                bgcolor: "rgba(255,255,255,0.06)",
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    {/* ── Scrollable body ───────────────────────────────────── */}
                    <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>

                        {/* Type + read status */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Chip label={tc.label} size="small" color={tc.color} variant="outlined" sx={chipSx} />
                            <Chip
                                label={notification.read ? "Lu" : "Non lu"}
                                size="small"
                                color={notification.read ? "success" : "warning"}
                                variant="outlined"
                                sx={chipSx}
                            />
                        </Box>

                        {/* Triggered by */}
                        <Box>
                            <Typography sx={{ ...sectionLabelSx, mb: 1 }}>Déclenché par</Typography>
                            <Box sx={{
                                p: 1.5,
                                bgcolor: "rgba(255,255,255,0.04)",
                                borderRadius: 2,
                                border: "1px solid rgba(147,181,218,0.1)",
                                display: "flex", alignItems: "center", gap: 1.5,
                            }}>
                                <Box sx={{
                                    width: 40, height: 40, borderRadius: "50%",
                                    bgcolor: notification.triggeredByRole === "system"
                                        ? "rgba(147,181,218,0.15)"
                                        : "rgba(59,139,212,0.2)",
                                    border: "1px solid rgba(59,139,212,0.3)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: 13, color: "#85b7eb",
                                    flexShrink: 0,
                                }}>
                                    {initials}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#fff", lineHeight: 1.3 }}>
                                        {notification.triggeredBy}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: "rgba(147,181,218,0.6)", mt: 0.3 }}>
                                        {roleLabel[notification.triggeredByRole]}
                                        {notification.triggeredByRole !== "system" && ` · ID : ${notification.triggeredById}`}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Content */}
                        <Box>
                            <Typography sx={{ ...sectionLabelSx, mb: 1 }}>Contenu</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#fff", mb: 1.5, lineHeight: 1.4 }}>
                                {notification.title}
                            </Typography>
                            <Box sx={{
                                p: 1.5,
                                bgcolor: "rgba(255,255,255,0.03)",
                                borderRadius: 2,
                                border: "1px solid rgba(147,181,218,0.08)",
                            }}>
                                <Typography sx={{ fontSize: "0.875rem", color: "rgba(200,220,240,0.75)", lineHeight: 1.7 }}>
                                    {notification.message}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Meta */}
                        <Box>
                            <Typography sx={{ ...sectionLabelSx, mb: 1.2 }}>Détails</Typography>
                            <Box sx={{
                                bgcolor: "rgba(255,255,255,0.03)",
                                borderRadius: 2,
                                border: "1px solid rgba(147,181,218,0.08)",
                                overflow: "hidden",
                            }}>
                                {[
                                    {
                                        label: "Canal",
                                        node: <Chip label={cc.label} size="small" color={cc.color} variant="outlined" sx={chipSx} />,
                                    },
                                    { label: "Reçue le",  node: formattedDate },
                                    { label: "Source",    node: roleLabel[notification.triggeredByRole] },
                                    { label: "Statut",    node: notification.read ? "Lu" : "Non lu" },
                                ].map((row, i, arr) => (
                                    <Box
                                        key={row.label}
                                        sx={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            px: 1.5, py: 1.2,
                                            borderBottom: i < arr.length - 1
                                                ? "1px solid rgba(147,181,218,0.07)"
                                                : "none",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.8rem", color: "rgba(147,181,218,0.55)" }}>
                                            {row.label}
                                        </Typography>
                                        {typeof row.node === "string"
                                            ? <Typography sx={{ fontSize: "0.8rem", color: "rgba(220,235,255,0.85)", fontWeight: 500 }}>
                                                {row.node}
                                            </Typography>
                                            : row.node
                                        }
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                    </Box>

                    {/* ── Footer ───────────────────────────────────────────── */}
                    {/* ── Footer ───────────────────────────────────────────── */}
                    <Box sx={{
                        px: 2.5, py: 2,
                        borderTop: "1px solid rgba(147,181,218,0.12)",
                        display: "flex", flexDirection: "column", gap: 1,
                        flexShrink: 0,
                    }}>
                        {/* Action button — only for types that require it */}
                        {notification.type === "account" && (
                            <Button
                                fullWidth variant="contained" size="small"
                                onClick={() => { onClose(); navigate(`/providers/${notification.triggeredById}`); }}
                                sx={{ bgcolor: "rgba(59,139,212,0.3)", "&:hover": { bgcolor: "rgba(59,139,212,0.5)" } }}
                            >
                                Voir le prestataire
                            </Button>
                        )}
                        {notification.type === "review" && (
                            <Button
                                fullWidth variant="contained" size="small"
                                onClick={() => { onClose(); navigate(`/providers/${notification.triggeredById}`); }}
                                sx={{ bgcolor: "rgba(59,139,212,0.3)", "&:hover": { bgcolor: "rgba(59,139,212,0.5)" } }}
                            >
                                Voir le prestataire
                            </Button>
                        )}
                        {notification.type === "dispute" && (
                            <Button
                                fullWidth variant="contained" size="small"
                                onClick={() => { onClose(); navigate("/reservations"); }}
                                sx={{ bgcolor: "rgba(239,83,80,0.2)", "&:hover": { bgcolor: "rgba(239,83,80,0.35)" } }}
                            >
                                Voir le litige
                            </Button>
                        )}
                        {notification.type === "payment" && (
                            <Button
                                fullWidth variant="contained" size="small"
                                onClick={() => { onClose(); navigate("/payments"); }}
                                sx={{ bgcolor: "rgba(111,207,151,0.2)", "&:hover": { bgcolor: "rgba(111,207,151,0.35)" } }}
                            >
                                Voir la transaction
                            </Button>
                        )}

                        {/* Always visible row — mark read + delete */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                fullWidth variant="outlined" size="small"
                                onClick={() => { onDelete(notification.id); onClose(); }}
                                sx={{
                                    borderColor: "rgba(239,83,80,0.35)",
                                    color: "rgba(239,83,80,0.8)",
                                    "&:hover": { borderColor: "rgba(239,83,80,0.6)", bgcolor: "rgba(239,83,80,0.06)" },
                                }}
                            >
                                Supprimer
                            </Button>
                            {!notification.read && (
                                <Button
                                    fullWidth variant="outlined" size="small"
                                    onClick={() => onMarkRead(notification.id)}
                                    sx={{
                                        borderColor: "rgba(147,181,218,0.3)",
                                        color: "rgba(147,181,218,0.85)",
                                        "&:hover": { borderColor: "rgba(147,181,218,0.5)", bgcolor: "rgba(147,181,218,0.06)" },
                                    }}
                                >
                                    Marquer lu
                                </Button>
                            )}
                        </Box>
                    </Box>

                </Box>
            )}
        </Drawer>
    );
}