import {
    Box,
    Chip,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import PaymentsIcon from "@mui/icons-material/Payments";
import ChatIcon from "@mui/icons-material/Chat";
import TuneIcon from "@mui/icons-material/Tune";
import type { Reservation, ReservationStatus } from "../../../Data/Reservation";
import { useMessages } from "../../context/MessagesContext";
import { useNavigate } from "react-router-dom";
import { getCurrentAdminUser } from "../../../api/auth";
import { openAdminChat } from "../../../api/chats";


const statusConfig: Record<ReservationStatus, {
    label: string;
    color: "default" | "warning" | "success" | "error" | "info";
}> = {
    pending: {
        label: "en attente",
        color: "warning",
    },
    confirmed: {
        label: "Réservé",
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

function formatDuration(hours: number): string {
    const totalMinutes = Math.round(Math.abs(hours) * 60);
    const days = Math.floor(totalMinutes / (60 * 24));
    const remH = Math.floor((totalMinutes % (60 * 24)) / 60);
    const remM = totalMinutes % 60;

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}j`);
    if (remH > 0) parts.push(`${remH}h`);
    if (remM > 0 && days === 0) parts.push(`${remM}min`);

    return parts.join(" ") || "maintenant";
}

type Props = {
    reservation: Reservation;
    onView: () => void;
    onSimulateCompleted: () => void;
    onAnnulee: () => void;
};



export default function ReservationRow({
                                           reservation: r,
                                           onView,
                                           onSimulateCompleted,
                                           onAnnulee,
                                       }: Props) {
    const sc = statusConfig[r.status];
    const isCancelled = r.status === "cancelled";
    const canAct = r.status === "pending" || r.status === "confirmed";

    const { openChat, refreshMessages } = useMessages();

    const navigate = useNavigate();

    const reservationTitle = r.serviceName || `Réservation #${r.id}`;

    const handleMessageClient = async (event: React.MouseEvent) => {
        event.stopPropagation();

        const admin = getCurrentAdminUser();
        if (!admin?.id) {
            console.error("Cannot open client chat because admin id is missing");
            return;
        }

        try {
            const chat = await openAdminChat({
                adminId: admin.id,
                clientId: Number(r.clientId),
            });


            openChat({
                id: String(chat.chatId),
                providerName: r.clientName,
                avatar: r.clientName[0]?.toUpperCase() ?? "C",
                providerId: String(r.clientId),
                receiverId: String(r.clientId),
            });

            void refreshMessages();
        } catch (error) {
            console.error("Failed to open client chat", error);
        }
    };

    const handleMessageProvider = async (event: React.MouseEvent) => {
        event.stopPropagation();

        const admin = getCurrentAdminUser();
        if (!admin?.id) {
            console.error("Cannot open provider chat because admin id is missing");
            return;
        }

        try {
            const chat = await openAdminChat({
                adminId: admin.id,
                prestataireId: Number(r.providerId),
            });


            openChat({
                id: String(chat.chatId),
                providerName: r.providerName ?? "",
                avatar: r.providerName?.[0]?.toUpperCase() ?? "P",
                providerId: String(r.providerId),
                receiverId: String(r.providerId),
            });

            void refreshMessages();
        } catch (error) {
            console.error("Failed to open provider chat", error);
        }
    };


    return (
        <TableRow sx={{ opacity: isCancelled ? 0.6 : 1 }}>
            <TableCell sx={{ maxWidth: 200 }}>
                <Typography
                    variant="body2"
                    fontWeight={600}
                    onClick={onView}
                    sx={{
                        cursor: "pointer",
                        color: "primary.light",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 180,
                        textDecoration: isCancelled ? "line-through" : "none",
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    {reservationTitle}
                </Typography>

                {r.category && r.category !== "—" && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {r.category}
                    </Typography>
                )}
            </TableCell>

            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "primary.light",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() => navigate(`/clients/${r.clientId}`)}
                    >
                        {r.clientName}
                    </Typography>

                    <Tooltip title="Envoyer un message">
                        <IconButton
                            size="small"
                            onClick={handleMessageClient}
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

            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "primary.light",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() => navigate(`/providers/${r.providerId}`)}
                    >
                        {r.providerName}
                    </Typography>

                    <Tooltip title="Envoyer un message">
                        <IconButton
                            size="small"
                            onClick={handleMessageProvider}
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
            <TableCell>
                {(() => {
                    const now = new Date();
                    const scheduled = new Date(`${r.scheduledDate}T${r.scheduledTime}`);
                    const hoursUntil =
                        (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);

                    const isPending = r.status === "pending";
                    const isConfirmed = r.status === "confirmed";

                    const isPastReserved =
                        hoursUntil < 0 && isConfirmed;

                    const isSoon =
                        hoursUntil >= 0 &&
                        hoursUntil <= 2 &&
                        isConfirmed;

                    return (
                        <>
                            <Typography variant="body2">
                                {new Date(r.scheduledDate).toLocaleDateString("fr-FR")}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                                {r.scheduledTime}
                            </Typography>

                            {isPastReserved && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        mt: 0.25,
                                        fontSize: "0.62rem",
                                        fontWeight: 600,
                                        color: "text.secondary",
                                    }}
                                >
                                    RDV passé
                                </Typography>
                            )}

                            {isSoon && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        mt: 0.25,
                                        fontSize: "0.62rem",
                                        fontWeight: 600,
                                        color: "warning.main",
                                    }}
                                >
                                    Dans {formatDuration(hoursUntil)}
                                </Typography>
                            )}

                            {isPending && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        mt: 0.25,
                                        fontSize: "0.62rem",
                                        fontWeight: 600,
                                        color: "warning.main",
                                    }}
                                >
                                    En attente
                                </Typography>
                            )}
                        </>
                    );
                })()}
            </TableCell>



            <TableCell align="center">
                <Chip
                    label={methodLabel[r.paymentMethod] ?? r.paymentMethod}
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
                    sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        "& .MuiChip-label": { px: 0.8 },
                    }}
                />

                {r.status === "pending" && (() => {
                    const hoursWaiting =
                        (new Date().getTime() - new Date(r.createdAt).getTime()) /
                        (1000 * 60 * 60);

                    const color =
                        hoursWaiting > 48
                            ? "error.main"
                            : hoursWaiting > 24
                                ? "warning.main"
                                : "text.disabled";

                    return (
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mt: 0.4,
                                fontSize: "0.62rem",
                                fontWeight: 600,
                                color,
                            }}
                        >
                            En attente depuis {formatDuration(hoursWaiting)}
                        </Typography>
                    );
                })()}

            </TableCell>

            <TableCell align="center">
                <Tooltip title="Voir le paiement">
                    <IconButton
                        size="small"
                        onClick={() => navigate(`/payments?reservation=${r.id}`)}
                        sx={{ color: "primary.light" }}
                    >
                        <PaymentsIcon fontSize="small" />
                    </IconButton>

                </Tooltip>
            </TableCell>

            <TableCell align="right">
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                    }}
                >
                    <Tooltip title="Voir détails">
                        <IconButton
                            size="small"
                            onClick={onView}
                            sx={{ color: "primary.light" }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {(r.status === "confirmed" || r.status === "completed") && (
                        <Tooltip
                            title={
                                r.status === "completed"
                                    ? "Simulation : retour au statut réservé"
                                    : "Simulation prestataire : intervention terminée"
                            }
                        >
                            <IconButton
                                size="small"
                                onClick={onSimulateCompleted}
                                sx={{
                                    p: 0.4,
                                    borderRadius: 1,
                                    color: "#a78bfa",
                                    bgcolor: "rgba(167,139,250,0.1)",
                                    border: "1px solid rgba(167,139,250,0.25)",
                                    "&:hover": { bgcolor: "rgba(167,139,250,0.2)" },
                                }}
                            >
                                <TuneIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canAct && (
                        <>
                            <Tooltip title="Marquer terminée">
                                <IconButton
                                    size="small"
                                    onClick={onAnnulee}
                                    sx={{ display: "none" }}
                                >
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Annuler">
                                <IconButton
                                    size="small"
                                    onClick={onAnnulee}
                                    sx={{ color: "error.main" }}
                                >
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
