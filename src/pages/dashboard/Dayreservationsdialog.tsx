import {
    Box, Chip, Dialog, DialogContent,
    DialogTitle, IconButton, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { type Reservation } from "../context/Reservationcontext";
import { resStatusConfig } from "../../config/Reservationconfig";

interface Props {
    reservations: Reservation[] | null;
    label:        string;
    onClose:      () => void;
    onSelect:     (r: Reservation) => void;
}

export default function DayReservationsDialog({ reservations, label, onClose, onSelect }: Props) {
    return (
        <Dialog
            open={Boolean(reservations)}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { bgcolor: "rgba(10,37,77,0.98)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ textTransform: "capitalize" }}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {reservations?.length} réservation{(reservations?.length ?? 0) > 1 ? "s" : ""}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {reservations?.map((r) => {
                        const sc = resStatusConfig[r.status];
                        return (
                            <Box
                                key={r.id}
                                onClick={() => onSelect(r)}
                                sx={{
                                    p: 1.5,
                                    bgcolor: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(147,181,218,0.12)",
                                    borderRadius: 1.5,
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)", borderColor: "rgba(147,181,218,0.3)" },
                                    transition: "all 0.15s ease",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={600} color="primary.light">{r.offerTitle}</Typography>
                                    <Typography variant="caption" color="text.secondary">{r.scheduledTime}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                                    {r.clientName} → {r.providerName}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Chip label={sc.label} size="small" color={sc.color} variant="outlined"
                                          sx={{ fontSize: "0.65rem", height: 18, "& .MuiChip-label": { px: 0.75 } }} />
                                    <Typography variant="caption" fontWeight={600} color="primary.light">{r.amount} MAD</Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>
        </Dialog>
    );
}