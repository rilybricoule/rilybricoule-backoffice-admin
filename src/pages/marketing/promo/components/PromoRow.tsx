import { Box, Chip, IconButton, LinearProgress, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import EditIcon        from "@mui/icons-material/Edit";
import DeleteIcon      from "@mui/icons-material/Delete";
import ToggleOnIcon    from "@mui/icons-material/ToggleOn";
import ToggleOffIcon   from "@mui/icons-material/ToggleOff";
import type { Promo, PromoStatus } from "../../../../Data/Promo";

const statusConfig: Record<PromoStatus, { label: string; color: "success" | "default" | "error" }> = {
    active:   { label: "Active",   color: "success" },
    inactive: { label: "Inactive", color: "default" },
    expired:  { label: "Expirée",  color: "error"   },
};

type Props = {
    promo:    Promo;
    onEdit:   () => void;
    onDelete: () => void;
    onToggle: () => void;
};

export default function PromoRow({ promo, onEdit, onDelete, onToggle }: Props) {
    const sc           = statusConfig[promo.status];
    const usagePct     = Math.min((promo.usageCount / promo.maxUsage) * 100, 100);
    const isExpired    = promo.status === "expired";
    const isMaxed      = promo.usageCount >= promo.maxUsage;

    return (
        <TableRow sx={{ opacity: isExpired ? 0.6 : 1 }}>

            {/* Code */}
            <TableCell>
                <Typography variant="body2" fontWeight={700} sx={{
                    color: "primary.light", fontFamily: "monospace",
                    letterSpacing: 1, fontSize: "0.85rem",
                }}>
                    {promo.code}
                </Typography>
                {promo.description && (
                    <Typography variant="caption" color="text.secondary">{promo.description}</Typography>
                )}
            </TableCell>

            {/* Discount */}
            <TableCell align="center">
                <Typography variant="body2" fontWeight={700} color="warning.main">
                    -{promo.discount}%
                </Typography>
            </TableCell>

            {/* Validity */}
            <TableCell>
                <Typography variant="body2">
                    {new Date(promo.startDate).toLocaleDateString("fr-FR")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    → {new Date(promo.endDate).toLocaleDateString("fr-FR")}
                </Typography>
            </TableCell>

            {/* Usage */}
            <TableCell sx={{ minWidth: 140 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color={isMaxed ? "error.main" : "text.secondary"}>
                        {promo.usageCount} / {promo.maxUsage}
                    </Typography>
                    <Typography variant="caption" color={isMaxed ? "error.main" : "text.secondary"}>
                        {Math.round(usagePct)}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={usagePct}
                    color={usagePct >= 100 ? "error" : usagePct >= 75 ? "warning" : "success"}
                    sx={{ height: 5, borderRadius: 99, bgcolor: "rgba(147,181,218,0.15)" }}
                />
            </TableCell>

            {/* Status */}
            <TableCell align="center">
                <Chip label={sc.label} size="small" color={sc.color} variant="outlined"
                      sx={{ fontSize: "0.7rem", height: 20, "& .MuiChip-label": { px: 0.8 } }} />
            </TableCell>

            {/* Actions */}
            <TableCell align="right">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                    {!isExpired && (
                        <Tooltip title={promo.status === "active" ? "Désactiver" : "Activer"}>
                            <IconButton size="small" onClick={onToggle}
                                        sx={{ color: promo.status === "active" ? "success.main" : "text.secondary" }}>
                                {promo.status === "active"
                                    ? <ToggleOnIcon fontSize="small" />
                                    : <ToggleOffIcon fontSize="small" />
                                }
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Modifier">
                        <IconButton size="small" onClick={onEdit} sx={{ color: "primary.light" }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={onDelete} sx={{ color: "error.main" }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </TableCell>
        </TableRow>
    );
}
