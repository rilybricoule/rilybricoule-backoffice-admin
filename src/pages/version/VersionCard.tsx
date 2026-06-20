import { Box, Chip, IconButton, Typography } from "@mui/material";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import LanguageIcon from "@mui/icons-material/Language";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { AppVersion, NoteType, Platform, VersionStatus } from "../../Data/AppVersion";

const platformConfig: Record<Platform, { label: string; icon: React.ReactNode; color: string }> = {
    android: { label: "Android", icon: <AndroidIcon sx={{ fontSize: 16 }} />, color: "#3DDC84" },
    ios: { label: "iOS", icon: <AppleIcon sx={{ fontSize: 16 }} />, color: "#A2AAAD" },
    web: { label: "Web", icon: <LanguageIcon sx={{ fontSize: 16 }} />, color: "#4A90D9" },
};

const statusConfig: Record<VersionStatus, { label: string; color: string; bg: string }> = {
    upcoming: { label: "À venir", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
    beta: { label: "Bêta en cours", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
    live: { label: "Live", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
    deprecated: { label: "Obsolète", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
};

const noteConfig: Record<NoteType, { label: string; color: string; bg: string }> = {
    new: { label: "Nouveauté", color: "#22c55e", bg: "rgba(34,197,94,0.18)" },
    improvement: { label: "Amélioration", color: "#60a5fa", bg: "rgba(96,165,250,0.18)" },
    fix: { label: "Correction", color: "#f97316", bg: "rgba(249,115,22,0.18)" },
    security: { label: "Sécurité", color: "#eab308", bg: "rgba(234,179,8,0.18)" },
};

type Props = {
    version: AppVersion;
    onEdit: (v: AppVersion) => void;
    onDelete: (id: string) => void;
};

export default function VersionCard({ version, onEdit, onDelete }: Props) {
    const platform = platformConfig[version.platform];
    const status = statusConfig[version.status];

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <Box
            sx={{
                bgcolor: "rgba(10, 37, 77, 0.60)",
                border: "1px solid rgba(147,181,218,0.18)",
                borderRadius: 3,
                p: 2.5,
                mb: 2,
                transition: "border-color 0.2s",
                "&:hover": { borderColor: "rgba(147,181,218,0.35)" },
            }}
        >
            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Box
                        sx={{
                            width: 38, height: 38, borderRadius: 2,
                            bgcolor: `${platform.color}22`,
                            border: `1px solid ${platform.color}44`,
                            display: "grid", placeItems: "center",
                            color: platform.color, flexShrink: 0,
                        }}
                    >
                        {platform.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ color: "#f8fafc", letterSpacing: 0.3 }}>
                        v{version.version}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.3 }}>
                        build #{version.build}
                    </Typography>
                    <Chip label={status.label} size="small"
                          sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: "0.72rem", border: `1px solid ${status.color}55` }} />
                    <Chip
                        icon={<Box sx={{ color: `${platform.color} !important`, display: "flex" }}>{platform.icon}</Box>}
                        label={platform.label} size="small"
                        sx={{ bgcolor: `${platform.color}18`, color: platform.color, fontWeight: 600, fontSize: "0.72rem", border: `1px solid ${platform.color}44` }}
                    />
                    {version.forcedUpdate && (
                        <Chip
                            icon={<WarningAmberIcon sx={{ fontSize: "14px !important", color: "#fbbf24 !important" }} />}
                            label="Mise à jour forcée" size="small"
                            sx={{ bgcolor: "rgba(251,191,36,0.15)", color: "#fbbf24", fontWeight: 600, fontSize: "0.72rem", border: "1px solid rgba(251,191,36,0.35)" }}
                        />
                    )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => onEdit(version)} sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(version.id)} sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* Meta row */}
            <Box sx={{ display: "flex", gap: 3, mt: 1, mb: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "text.secondary" }}>
                    <CalendarTodayIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption">{formatDate(version.releaseDate)}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Min supportée: <strong style={{ color: "#94a3b8" }}>v{version.minSupported}</strong>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "text.secondary" }}>
                    <UpdateIcon sx={{ fontSize: 13 }} />
                    <Typography variant="caption">Mis à jour: {formatDate(version.updatedAt)}</Typography>
                </Box>
            </Box>

            {/* Release notes */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {version.notes.map((note, i) => {
                    const nc = noteConfig[note.type];
                    return (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: nc.color, flexShrink: 0 }} />
                            <Chip label={nc.label} size="small"
                                  sx={{ bgcolor: nc.bg, color: nc.color, fontWeight: 700, fontSize: "0.65rem", height: 20, border: `1px solid ${nc.color}44` }} />
                            <Typography variant="body2" sx={{ color: "#cbd5e1" }}>{note.text}</Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Forced update banner */}
            {version.forcedUpdate && (
                <Box sx={{ mt: 2, p: 1.2, borderRadius: 2, bgcolor: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.28)", display: "flex", alignItems: "center", gap: 1 }}>
                    <WarningAmberIcon sx={{ fontSize: 16, color: "#fbbf24" }} />
                    <Typography variant="caption" sx={{ color: "#fbbf24" }}>
                        Mise à jour obligatoire — les utilisateurs &lt; {version.minSupported} seront forcés à mettre à jour.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
