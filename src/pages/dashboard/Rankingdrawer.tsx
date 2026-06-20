import { useState, useMemo } from "react";
import {
    Box, Typography, Avatar, TextField,
    InputAdornment, MenuItem, Select, IconButton,
    Divider,Dialog,
    DialogContent
} from "@mui/material";

import EmojiEventsIcon  from "@mui/icons-material/EmojiEvents";
import StarIcon         from "@mui/icons-material/Star";
import BuildIcon        from "@mui/icons-material/Build";
import SearchIcon       from "@mui/icons-material/Search";
import CloseIcon        from "@mui/icons-material/Close";
import SortIcon         from "@mui/icons-material/Sort";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";

import { useProviders } from "../context/ProviderContext";
import type { Provider } from "../../Data/Provider";

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeScore(p: Provider, maxInterventions: number): number {
    const iScore = maxInterventions > 0 ? p.completedInterventions / maxInterventions : 0;
    const rScore = p.averageRating / 5;
    return iScore * 0.6 + rScore * 0.4;
}

const MEDAL: Record<number, { color: string; bg: string; border: string }> = {
    0: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)" },
    1: { color: "#94A3B8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
    2: { color: "#CD7C3A", bg: "rgba(205,124,58,0.12)", border: "rgba(205,124,58,0.3)" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    approved:  { bg: "rgba(74,222,128,0.12)",  color: "#4ade80", label: "Approuvé"   },
    pending:   { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "En attente" },
    suspended: { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Suspendu"   },
    rejected:  { bg: "rgba(148,163,184,0.1)",  color: "#94a3b8", label: "Rejeté"     },
};

type SortKey = "score" | "interventions" | "rating" | "name";

// ── Component ─────────────────────────────────────────────────────────────────

interface RankingDrawerProps {
    open:    boolean;
    onClose: () => void;
}

export default function RankingDrawer({ open, onClose }: RankingDrawerProps) {
    const { providers } = useProviders();

    const [search,   setSearch]   = useState("");
    const [sortBy,   setSortBy]   = useState<SortKey>("score");
    const [statusFilter, setStatusFilter] = useState("all");

    const maxInterventions = useMemo(
        () => Math.max(...providers.map((p) => p.completedInterventions), 1),
        [providers]
    );

    // Build ranked list (score always computed for rank badge, sort applied separately)
    const allScored = useMemo(
        () =>
            [...providers]
                .map((p) => ({ ...p, score: computeScore(p, maxInterventions) }))
                .sort((a, b) => b.score - a.score)          // stable rank order
                .map((p, i) => ({ ...p, rank: i + 1 })),    // assign rank by score
        [providers, maxInterventions]
    );

    const displayed = useMemo(() => {
        let list = [...allScored];

        // Filter
        if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((p) =>
                `${p.firstName} ${p.lastName} ${p.businessName ?? ""}`.toLowerCase().includes(q)
            );
        }

        // Sort
        switch (sortBy) {
            case "interventions": list.sort((a, b) => b.completedInterventions - a.completedInterventions); break;
            case "rating":        list.sort((a, b) => b.averageRating - a.averageRating); break;
            case "name":          list.sort((a, b) => a.firstName.localeCompare(b.firstName)); break;
            case "score":
            default:              list.sort((a, b) => b.score - a.score);
        }

        return list;
    }, [allScored, search, sortBy, statusFilter]);

    // Summary stats
    const totalInterventions = providers.reduce((s, p) => s + p.completedInterventions, 0);
    const activeProviders    = providers.filter((p) => p.status === "approved").length;
    const avgRating = (() => {
        const rated = providers.filter((p) => p.averageRating > 0);
        return rated.length ? (rated.reduce((s, p) => s + p.averageRating, 0) / rated.length).toFixed(1) : "—";
    })();

    return (
        <Dialog

            open={open}

            onClose={onClose}

            maxWidth="lg"

            fullWidth

            PaperProps={{

                sx: {

                    width: "900px",

                    maxWidth: "95vw",

                    borderRadius: 4,

                    backdropFilter: "blur(10px)",

                    background:

                        "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",

                    border:

                        "1px solid rgba(148,163,184,0.15)"

                }

            }}

        >

            <DialogContent>

            {/* ── Header ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{
                            width: 34, height: 34, borderRadius: "10px",
                            bgcolor: "rgba(245,158,11,0.15)",
                            border:  "1px solid rgba(245,158,11,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <EmojiEventsIcon sx={{ fontSize: 17, color: "#F59E0B" }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                Classement Prestataires
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Score · 60% interventions + 40% note
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Summary chips */}
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {[
                        { icon: <BuildIcon sx={{ fontSize: 11 }} />,                               label: `${totalInterventions.toLocaleString("fr-FR")} interventions` },
                        { icon: <StarIcon  sx={{ fontSize: 11, color: "#F59E0B" }} />,              label: `${avgRating}★ moyenne`                                        },
                        { icon: <TrendingUpIcon sx={{ fontSize: 11, color: "#4ade80" }} />,         label: `${activeProviders} actifs`                                    },
                    ].map((chip) => (
                        <Box
                            key={chip.label}
                            sx={{
                                display: "flex", alignItems: "center", gap: 0.5,
                                px: 1.25, py: 0.4,
                                bgcolor: "rgba(147,181,218,0.07)",
                                border:  "1px solid rgba(147,181,218,0.15)",
                                borderRadius: "20px",
                            }}
                        >
                            <Box sx={{ color: "primary.light", opacity: 0.7 }}>{chip.icon}</Box>
                            <Typography variant="caption" fontWeight={600} sx={{ color: "text.secondary", fontSize: "0.68rem" }}>
                                {chip.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Search + Sort + Status */}
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Rechercher…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(147,181,218,0.06)",
                                fontSize: "0.82rem",
                                "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                                "&:hover fieldset":  { borderColor: "rgba(147,181,218,0.35)" },
                                "&.Mui-focused fieldset": { borderColor: "rgba(147,181,218,0.5)" },
                            },
                        }}
                    />
                    <Select
                        size="small"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                        startAdornment={<SortIcon sx={{ fontSize: 15, mr: 0.5, color: "text.secondary" }} />}
                        sx={{
                            fontSize: "0.78rem", minWidth: 130,
                            bgcolor: "rgba(147,181,218,0.06)",
                            "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                            "&:hover fieldset":      { borderColor: "rgba(147,181,218,0.35)" },
                            "&.Mui-focused fieldset": { borderColor: "rgba(147,181,218,0.5)" },
                        }}
                    >
                        <MenuItem value="score">Score global</MenuItem>
                        <MenuItem value="interventions">Interventions</MenuItem>
                        <MenuItem value="rating">Note</MenuItem>
                        <MenuItem value="name">Nom (A→Z)</MenuItem>
                    </Select>
                </Box>

                {/* Status filter pills */}
                <Box sx={{ display: "flex", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
                    {["all", "approved", "pending", "suspended", "rejected"].map((s) => {
                        const style   = s === "all" ? null : STATUS_STYLE[s];
                        const isActive = statusFilter === s;
                        return (
                            <Box
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                sx={{
                                    px: 1.25, py: 0.35,
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    border: `1px solid ${isActive ? (style?.color ?? "rgba(147,181,218,0.5)") : "rgba(147,181,218,0.15)"}`,
                                    bgcolor: isActive ? (style?.bg ?? "rgba(147,181,218,0.12)") : "transparent",
                                    color:   isActive ? (style?.color ?? "primary.light") : "text.secondary",
                                    transition: "all 0.15s ease",
                                    "&:hover": {
                                        bgcolor: style?.bg ?? "rgba(147,181,218,0.08)",
                                        borderColor: style?.color ?? "rgba(147,181,218,0.35)",
                                    },
                                }}
                            >
                                {s === "all" ? "Tous" : STATUS_STYLE[s].label}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(147,181,218,0.1)", flexShrink: 0 }} />

            {/* ── Results count ── */}
            <Box sx={{ px: 2.5, py: 1, flexShrink: 0 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {displayed.length} prestataire{displayed.length !== 1 ? "s" : ""}
                </Typography>
            </Box>

            {/* ── Scrollable list ── */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, pb: 3,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(147,181,218,0.2)", borderRadius: 2 },
            }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {displayed.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Aucun prestataire trouvé
                            </Typography>
                        </Box>
                    ) : (
                        displayed.map((provider, visualIndex) => {
                            const realRank  = provider.rank;         // rank by score always
                            const medal     = MEDAL[realRank - 1];   // only top 3
                            const isTop3    = realRank <= 3;
                            const status    = STATUS_STYLE[provider.status];
                            const scoreP    = Math.round(provider.score * 100);

                            return (
                                <Box
                                    key={provider.id}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.5,
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: isTop3
                                            ? medal.bg
                                            : visualIndex % 2 === 0
                                                ? "rgba(147,181,218,0.04)"
                                                : "transparent",
                                        border: `1px solid ${isTop3 ? medal.border : "rgba(147,181,218,0.08)"}`,
                                        transition: "background 0.15s ease",
                                        "&:hover": {
                                            bgcolor: isTop3 ? medal.bg : "rgba(147,181,218,0.08)",
                                        },
                                    }}
                                >
                                    {/* Rank badge */}
                                    <Box sx={{
                                        minWidth: 28, height: 28,
                                        borderRadius: "8px",
                                        bgcolor: isTop3 ? medal.bg : "rgba(147,181,218,0.07)",
                                        border: `1px solid ${isTop3 ? medal.border : "rgba(147,181,218,0.15)"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}>
                                        <Typography sx={{
                                            fontSize: "0.65rem", fontWeight: 800,
                                            color: isTop3 ? medal.color : "text.secondary",
                                        }}>
                                            #{realRank}
                                        </Typography>
                                    </Box>

                                    {/* Avatar */}
                                    <Avatar
                                        src={provider.avatar}
                                        sx={{
                                            width: 36, height: 36,
                                            fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
                                            bgcolor: isTop3 ? `${medal.color}33` : "rgba(147,181,218,0.15)",
                                            color:   isTop3 ? medal.color : "text.secondary",
                                        }}
                                    >
                                        {`${provider.firstName[0]}${provider.lastName[0]}`.toUpperCase()}
                                    </Avatar>

                                    {/* Info */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        {/* Name + status */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.4 }}>
                                            <Typography
                                                variant="body2" fontWeight={700} noWrap
                                                sx={{ color: isTop3 && realRank === 1 ? "#F59E0B" : "text.primary" }}
                                            >
                                                {provider.firstName} {provider.lastName}
                                            </Typography>
                                            <Box sx={{
                                                px: 0.75, py: 0.1,
                                                borderRadius: "10px",
                                                bgcolor: status.bg,
                                                border: `1px solid ${status.color}44`,
                                                flexShrink: 0,
                                            }}>
                                                <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: status.color }}>
                                                    {status.label}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Business + categories */}
                                        {provider.businessName && (
                                            <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block", mb: 0.5, fontSize: "0.68rem" }}>
                                                {provider.businessName} · {provider.serviceCategories.slice(0, 2).join(", ")}
                                            </Typography>
                                        )}

                                        {/* Score bar */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ flex: 1, height: 3, borderRadius: 999, bgcolor: "rgba(147,181,218,0.1)", overflow: "hidden" }}>
                                                <Box sx={{
                                                    height: "100%", borderRadius: 999,
                                                    width: `${scoreP}%`,
                                                    bgcolor: isTop3 ? medal.color : "rgba(147,181,218,0.4)",
                                                    transition: "width 0.4s ease",
                                                }} />
                                            </Box>
                                            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: isTop3 ? medal.color : "text.secondary", minWidth: 28, textAlign: "right" }}>
                                                {scoreP}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Stats */}
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                            <BuildIcon sx={{ fontSize: 11, color: "text.secondary" }} />
                                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.primary" }}>
                                                {provider.completedInterventions}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                            <StarIcon sx={{ fontSize: 11, color: "#F59E0B" }} />
                                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: provider.averageRating > 0 ? "text.primary" : "text.secondary" }}>
                                                {provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "—"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Box>
            </DialogContent>

        </Dialog>

    );
}