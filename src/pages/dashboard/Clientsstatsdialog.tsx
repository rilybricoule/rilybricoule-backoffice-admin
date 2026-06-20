import {
    Box, Dialog, DialogContent,
    DialogTitle, Divider, IconButton, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { statsByPeriod, getChange } from "../../Data/dashboardStats";

interface Props {
    open:    boolean;
    onClose: () => void;
}

export default function ClientsStatsDialog({ open, onClose }: Props) {
    const now         = new Date();
    const dayOfWeek   = now.getDay() === 0 ? 7 : now.getDay();
    const dayOfMonth  = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfYear   = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const daysInYear  = now.getFullYear() % 4 === 0 ? 366 : 365;

    const current = statsByPeriod.month.current;

    const rows = [
        {
            label:   "Cette semaine",
            value:   statsByPeriod.week.current.newClients,
            change:  getChange(statsByPeriod.week.current.newClients, statsByPeriod.week.previous.newClients),
            elapsed: dayOfWeek,
            total:   7,
            vsLabel: "semaine précédente",
        },
        {
            label:   "Ce mois",
            value:   statsByPeriod.month.current.newClients,
            change:  getChange(statsByPeriod.month.current.newClients, statsByPeriod.month.previous.newClients),
            elapsed: dayOfMonth,
            total:   daysInMonth,
            vsLabel: "mois précédent",
        },
        {
            label:   "Cette année",
            value:   statsByPeriod.year.current.newClients,
            change:  getChange(statsByPeriod.year.current.newClients, statsByPeriod.year.previous.newClients),
            elapsed: dayOfYear,
            total:   daysInYear,
            vsLabel: "année précédente",
        },
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { bgcolor: "rgba(10,37,77,0.98)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Clients inscrits</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Total cumulé — {current.clientsCount.toLocaleString("fr-FR")} clients
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600}
                            sx={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", mb: 2 }}>
                    Nouveaux inscrits par période
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {rows.map((row) => {
                        const progressPct = Math.round((row.elapsed / row.total) * 100);
                        return (
                            <Box key={row.label}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">{row.label}</Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <Typography variant="body2" fontWeight={700} color="primary.light">
                                            {row.value.toLocaleString("fr-FR")} nouveaux
                                        </Typography>
                                        <Typography variant="caption" fontWeight={600}
                                                    sx={{ color: row.change >= 0 ? "success.main" : "error.main" }}>
                                            {row.change >= 0 ? "+" : ""}{row.change}% vs {row.vsLabel}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Progress bar */}
                                <Box sx={{ height: 6, borderRadius: 999, bgcolor: "rgba(147,181,218,0.1)", overflow: "hidden" }}>
                                    <Box sx={{
                                        height: "100%", borderRadius: 999, bgcolor: "primary.light",
                                        width: `${progressPct}%`, transition: "width 0.4s ease", opacity: 0.8,
                                    }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                    Jour {row.elapsed} / {row.total}
                                </Typography>

                                <Divider sx={{ borderColor: "rgba(147,181,218,0.1)", mt: 1.5 }} />
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>
        </Dialog>
    );
}