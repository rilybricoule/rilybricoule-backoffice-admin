import { Box, Chip, IconButton, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GavelIcon from "@mui/icons-material/Gavel";
import ChatIcon from "@mui/icons-material/Chat";
import type { Ticket, TicketStatus, TicketCategory } from "../../context/SupportContext";

const statusConfig: Record<TicketStatus, { label: string; color: "warning" | "info" | "success" | "default" }> = {
    ouvert: { label: "Ouvert", color: "warning" },
    en_cours: { label: "En cours", color: "info" },
    resolu: { label: "Resolu", color: "success" },
    ferme: { label: "Ferme", color: "default" },
};

const categoryConfig: Record<TicketCategory, { label: string }> = {
    incident: { label: "Incident" },
    question_generale: { label: "Question generale" },
    demande_remboursement: { label: "Remboursement" },
    litige: { label: "Litige" },
};

type Props = {
    ticket: Ticket;
    onView: () => void;
    onMessage: (event: React.MouseEvent) => void;
};

export default function TicketRow({ ticket: t, onView, onMessage }: Props) {
    const sc = statusConfig[t.status];
    const cc = categoryConfig[t.category];

    return (
        <TableRow sx={{ opacity: t.status === "ferme" ? 0.6 : 1 }}>
            <TableCell sx={{ maxWidth: 220 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {t.isLitige && (
                        <Tooltip title="Litige">
                            <GavelIcon sx={{ fontSize: 16, color: "error.main", flexShrink: 0 }} />
                        </Tooltip>
                    )}
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.light"
                        onClick={onView}
                        sx={{
                            cursor: "pointer",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 190,
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        {t.subject}
                    </Typography>
                </Box>
                {t.reservationTitle && (
                    <Typography variant="caption" color="text.secondary">
                        Res: {t.reservationTitle}
                    </Typography>
                )}
            </TableCell>
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2">{t.fromName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t.fromType !== "admin" && (
                                <Tooltip title="Envoyer un message">
                                    <IconButton
                                        size="small"
                                        onClick={onMessage}
                                        sx={{
                                            p: 0.25,
                                            color: "text.secondary",
                                            "&:hover": { color: "primary.light" },
                                        }}
                                    >
                                        <ChatIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Tooltip>
                            )}

                        </Typography>
                    </Box>

                </Box>
            </TableCell>
            <TableCell>
                <Chip
                    label={cc.label}
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
            <TableCell align="center">
                <Chip
                    label={sc.label}
                    size="small"
                    color={sc.color}
                    variant="outlined"
                    sx={{ fontSize: "0.7rem", height: 20, "& .MuiChip-label": { px: 0.8 } }}
                />
            </TableCell>
            <TableCell>
                <Typography variant="body2" color="text.secondary">
                    {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                </Typography>
            </TableCell>
            <TableCell align="right">
                <Tooltip title="Voir details">
                    <IconButton size="small" onClick={onView} sx={{ color: "primary.light" }}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
