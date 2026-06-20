import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { CityStats } from "./Cityrankingcard";

type Props = {
    open: boolean;
    onClose: () => void;
    cities: CityStats[];
};

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

export default function CityRankingDrawer({ open, onClose, cities }: Props) {
    const max = cities[0]?.interventions ?? 1;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "rgba(8,18,40,0.97)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    borderRadius: 3,
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 24px 80px rgba(2,6,23,0.7)",
                    color: "#e2e8f0",
                    backgroundImage: "none",
                },
            }}
            slotProps={{
                backdrop: {
                    sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(2,6,23,0.6)" },
                },
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 3,
                        pt: 2.5,
                        pb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                bgcolor: "rgba(56,189,248,0.1)",
                                border: "1px solid rgba(56,189,248,0.25)",
                                display: "grid",
                                placeItems: "center",
                            }}
                        >
                            <LocationOnIcon sx={{ fontSize: 18, color: "#38bdf8" }} />
                        </Box>
                        <Box>
                            <Typography
                                sx={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}
                            >
                                Classement des villes
                            </Typography>
                            <Typography
                                sx={{ fontSize: 11, color: "rgba(226,232,240,0.45)" }}
                            >
                                {cities.length} villes · interventions complétées
                            </Typography>
                        </Box>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: "rgba(226,232,240,0.5)",
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.08)",
                                color: "#e2e8f0",
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                {/* Top 3 podium */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        gap: 2,
                        px: 3,
                        pt: 3,
                        pb: 2,
                    }}
                >
                    {[cities[1], cities[0], cities[2]].map((item, idx) => {
                        if (!item) return null;
                        const realRank = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                        const heights = [100, 130, 80];
                        const color = medalColors[realRank];

                        return (
                            <Box
                                key={item.city}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 0.8,
                                    flex: 1,
                                }}
                            >
                                <EmojiEventsIcon sx={{ fontSize: 20, color }} />
                                <Typography
                                    sx={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}
                                >
                                    {item.city}
                                </Typography>
                                <Typography
                                    sx={{ fontSize: 11, fontWeight: 700, color }}
                                >
                                    {item.interventions}
                                </Typography>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: heights[idx],
                                        bgcolor: `${color}18`,
                                        border: `1px solid ${color}44`,
                                        borderRadius: "6px 6px 0 0",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "center",
                                        pt: 1,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color,
                                        }}
                                    >
                                        #{realRank + 1}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mx: 3 }} />

                {/* Full ranked list */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        maxHeight: 320,
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: 6 },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(148,163,184,0.25)",
                            borderRadius: 10,
                        },
                    }}
                >
                    {cities.map((item, i) => {
                        const color =
                            i < 3 ? medalColors[i] : "rgba(147,181,218,0.6)";
                        const pct = Math.round((item.interventions / max) * 100);

                        return (
                            <Box
                                key={item.city}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    py: 1,
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    "&:last-child": { borderBottom: "none" },
                                }}
                            >
                                {/* Rank number */}
                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: i < 3 ? color : "rgba(226,232,240,0.3)",
                                        minWidth: 22,
                                        textAlign: "center",
                                    }}
                                >
                                    #{i + 1}
                                </Typography>

                                {/* City */}
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#e2e8f0",
                                        minWidth: 90,
                                    }}
                                >
                                    {item.city}
                                </Typography>

                                {/* Bar */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        height: 5,
                                        borderRadius: 999,
                                        bgcolor: "rgba(147,181,218,0.08)",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: "100%",
                                            borderRadius: 999,
                                            width: `${pct}%`,
                                            bgcolor: color,
                                            opacity: 0.75,
                                        }}
                                    />
                                </Box>

                                {/* Stats */}
                                <Box sx={{ textAlign: "right", minWidth: 80 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color,
                                            display: "block",
                                        }}
                                    >
                                        {item.interventions}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: 10,
                                            color: "rgba(226,232,240,0.35)",
                                        }}
                                    >
                                        {item.providerCount} presta.
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography sx={{ fontSize: 11, color: "rgba(226,232,240,0.3)" }}>
                        Total ·{" "}
                        {cities.reduce((s, c) => s + c.interventions, 0)} interventions
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(226,232,240,0.3)" }}>
                        {cities.reduce((s, c) => s + c.providerCount, 0)} prestataires
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}