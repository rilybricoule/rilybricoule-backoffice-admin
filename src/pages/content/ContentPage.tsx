import { useEffect, useState } from "react";
import {
    Box, Typography, Chip, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
    IconButton, Tooltip, Divider, Switch, Toolbar,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import AppPagination from "../../components/AppPagination";
import OpenArtBg from "../../assets/openart.png";
import { useNavigate } from "react-router-dom";
import { navigateTo } from "../../utiles/Navigation";
import AddIcon from "@mui/icons-material/Add";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import LanguageIcon from "@mui/icons-material/Language";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import {
    createContentAppVersion,
    deleteContentAppVersion,
    getContentAppVersions,
    updateContentAppVersion,
} from "../../api/contentAppVersions";

// ── Types ─────────────────────────────────────────────────────────────────
type Platform = "android" | "ios" | "web";
type ReleaseStatus = "live" | "beta" | "deprecated" | "upcoming";

interface ChangelogEntry {
    type: "feature" | "fix" | "improvement" | "security";
    text: string;
}

interface AppVersion {
    id: string;
    platform: Platform;
    version: string;
    buildNumber: string;
    releaseDate: string;
    lastUpdatedAt: string; // ISO date string — set on create/edit
    status: ReleaseStatus;
    forceUpdate: boolean;
    minSupportedVersion: string;
    changelog: ChangelogEntry[];
    note?: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────
// ── Config ────────────────────────────────────────────────────────────────
const platformConfig: Record<Platform, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    android: { label: "Android", icon: <AndroidIcon sx={{ fontSize: 16 }} />, color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    ios:     { label: "iOS",     icon: <AppleIcon sx={{ fontSize: 16 }} />,   color: "#e2e8f0", bg: "rgba(226,232,240,0.1)"  },
    web:     { label: "Web",     icon: <LanguageIcon sx={{ fontSize: 16 }} />,color: "#38bdf8", bg: "rgba(56,189,248,0.12)"  },
};

const statusConfig: Record<ReleaseStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    live:       { label: "En ligne",   color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)",  icon: <CheckCircleOutlineIcon sx={{ fontSize: 12 }} /> },
    beta:       { label: "Bêta",       color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  icon: <RocketLaunchIcon sx={{ fontSize: 12 }} /> },
    upcoming:   { label: "À venir",    color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", icon: <RocketLaunchIcon sx={{ fontSize: 12 }} /> },
    deprecated: { label: "Obsolète",   color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", icon: <ArchiveOutlinedIcon sx={{ fontSize: 12 }} /> },
};

const changelogTypeConfig = {
    feature:     { label: "Nouveauté",    color: "#a78bfa", dot: "●" },
    fix:         { label: "Correction",   color: "#f87171", dot: "●" },
    improvement: { label: "Amélioration", color: "#38bdf8", dot: "●" },
    security:    { label: "Sécurité",     color: "#fbbf24", dot: "●" },
};

const emptyVersion: Omit<AppVersion, "id" | "lastUpdatedAt"> = {
    platform: "android", version: "", buildNumber: "",
    releaseDate: new Date().toISOString().slice(0, 10),
    status: "upcoming", forceUpdate: false,
    minSupportedVersion: "", changelog: [], note: "",
};


// ── Helpers ───────────────────────────────────────────────────────────────
function formatLastUpdated(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ContentPage() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("content");
    const [versions, setVersions] = useState<AppVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(true);
    const [versionsError, setVersionsError] = useState("");
    const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
    const [statusFilter, setStatusFilter] = useState<ReleaseStatus | "all">("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AppVersion | null>(null);
    const [form, setForm] = useState<Omit<AppVersion, "id" | "lastUpdatedAt">>(emptyVersion);
    const [deleteTarget, setDeleteTarget] = useState<AppVersion | null>(null);
    const [newChangelogText, setNewChangelogText] = useState("");
    const [newChangelogType, setNewChangelogType] = useState<ChangelogEntry["type"]>("feature");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(4);



    const loadVersions = async () => {
        try {
            setLoadingVersions(true);
            setVersionsError("");

            const data = await getContentAppVersions();
            setVersions(data);
        } catch (err: any) {
            setVersionsError(err?.response?.data?.message || "Erreur chargement versions");
        } finally {
            setLoadingVersions(false);
        }
    };

    useEffect(() => {
        loadVersions();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const filtered = versions.filter(v => {
        if (platformFilter !== "all" && v.platform !== platformFilter) return false;
        if (statusFilter !== "all" && v.status !== statusFilter) return false;
        return true;
    }).sort((a, b) => {
        const da = new Date(a.releaseDate).getTime();
        const db = new Date(b.releaseDate).getTime();
        return sortOrder === "newest" ? db - da : da - db;
    });

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handlePlatformFilter = (p: Platform | "all") => { setPlatformFilter(p); setPage(0); };
    const handleStatusFilter = (s: ReleaseStatus | "all") => { setStatusFilter(s); setPage(0); };
    const handleSortOrder = (o: "newest" | "oldest") => { setSortOrder(o); setPage(0); };

    // Group by platform for the summary cards
    const summary = (["android", "ios", "web"] as Platform[]).map(p => ({
        platform: p,
        live: versions.find(v => v.platform === p && v.status === "live"),
        upcoming: versions.find(v => v.platform === p && v.status === "upcoming"),
        beta: versions.find(v => v.platform === p && v.status === "beta"),
    }));

    const openCreate = () => {
        setEditTarget(null);
        setForm(emptyVersion);
        setNewChangelogText("");
        setDialogOpen(true);
    };

    const openEdit = (v: AppVersion) => {
        setEditTarget(v);
        // Exclude lastUpdatedAt from the form — it's managed automatically
        const { lastUpdatedAt, id, ...rest } = v;
        setForm(rest);
        setNewChangelogText("");
        setDialogOpen(true);
    };

    const replaceVersion = (saved: AppVersion) => {
        setVersions((prev) =>
            prev.map((version) => version.id === saved.id ? saved : version)
        );
    };

    const handleSave = async () => {
        try {
            setVersionsError("");

            if (editTarget) {
                const saved = await updateContentAppVersion(editTarget.id, form);
                replaceVersion(saved);
            } else {
                const saved = await createContentAppVersion(form);
                setVersions((prev) => [saved, ...prev]);
            }

            setDialogOpen(false);
        } catch (err: any) {
            setVersionsError(err?.response?.data?.message || "Erreur sauvegarde version");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            setVersionsError("");

            await deleteContentAppVersion(deleteTarget.id);
            setVersions((prev) => prev.filter((version) => version.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err: any) {
            setVersionsError(err?.response?.data?.message || "Erreur suppression version");
        }
    };

    const addChangelog = () => {
        if (!newChangelogText.trim()) return;
        setForm(f => ({ ...f, changelog: [...f.changelog, { type: newChangelogType, text: newChangelogText.trim() }] }));
        setNewChangelogText("");
    };

    const removeChangelog = (i: number) => {
        setForm(f => ({ ...f, changelog: f.changelog.filter((_, idx) => idx !== i) }));
    };

    // ── Styles ──
    const cardSx = {
        bgcolor: "rgba(15,23,42,0.6)",
        border: "1px solid rgba(148,163,184,0.12)",
        borderRadius: "16px",
        p: "18px 20px",
        transition: "all 0.2s ease",
        "&:hover": { borderColor: "rgba(56,189,248,0.25)", bgcolor: "rgba(15,23,42,0.75)" },
    };

    const dialogSx = {
        bgcolor: "#0d1829",
        backgroundImage: "linear-gradient(135deg, #0f1e35 0%, #0d1829 100%)",
        border: "1px solid rgba(56,189,248,0.2)",
        borderRadius: "20px",
        minWidth: 560,
    };

    const fieldSx = {
        "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(255,255,255,0.04)", borderRadius: "10px", color: "#e2e8f0", fontSize: 13,
            "& fieldset": { borderColor: "rgba(148,163,184,0.15)" },
            "&:hover fieldset": { borderColor: "rgba(56,189,248,0.3)" },
            "&.Mui-focused fieldset": { borderColor: "rgba(56,189,248,0.5)" },
        },
        "& .MuiInputLabel-root": { color: "rgba(148,163,184,0.6)", fontSize: 13 },
        "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={(id) => { setSelected(id); navigateTo(id, navigate); }} />

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                minHeight: "100vh",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
                <Toolbar />

                {/* ── Page header ── */}
                <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                            Versions de l'application
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestion des versions iOS, Android et Web — release notes & mises à jour
                        </Typography>
                    </Box>
                </Box>

                {versionsError && (
                    <Typography sx={{ mb: 2, color: "error.main", fontWeight: 700 }}>
                        {versionsError}
                    </Typography>
                )}

                {loadingVersions && (
                    <Typography sx={{ mb: 2, color: "text.secondary" }}>
                        Chargement des versions...
                    </Typography>
                )}

                {/* ── Summary cards ── */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
                    {summary.map(({ platform, live, upcoming, beta }) => {
                        const pc = platformConfig[platform];
                        return (
                            <Box key={platform} sx={{ ...cardSx, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: pc.bg, display: "flex", alignItems: "center", justifyContent: "center", color: pc.color }}>
                                        {pc.icon}
                                    </Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{pc.label}</Typography>
                                </Box>
                                <Divider sx={{ borderColor: "rgba(148,163,184,0.08)" }} />
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                                    {live && (
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>Version live</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>v{live.version}</Typography>
                                        </Box>
                                    )}
                                    {beta && (
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>Bêta en cours</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>v{beta.version}</Typography>
                                        </Box>
                                    )}
                                    {upcoming && (
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>À venir</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>v{upcoming.version}</Typography>
                                        </Box>
                                    )}
                                    {!live && !beta && !upcoming && (
                                        <Typography sx={{ fontSize: 12, color: "rgba(148,163,184,0.35)", fontStyle: "italic" }}>Aucune version active</Typography>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* ── Toolbar ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                    {/* Platform filter */}
                    {(["all", "android", "ios", "web"] as const).map(p => (
                        <Chip key={p} label={p === "all" ? "Toutes plateformes" : platformConfig[p].label}
                              icon={p !== "all" ? <Box sx={{ color: platformFilter === p ? platformConfig[p].color : "rgba(148,163,184,0.5)", display: "flex", ml: "6px !important" }}>{platformConfig[p].icon}</Box> : undefined}
                              onClick={() => handlePlatformFilter(p)}
                              sx={{
                                  height: 30, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  color: platformFilter === p ? (p === "all" ? "#38bdf8" : platformConfig[p].color) : "rgba(148,163,184,0.6)",
                                  bgcolor: platformFilter === p ? (p === "all" ? "rgba(56,189,248,0.1)" : `${platformConfig[p].bg}`) : "rgba(15,23,42,0.5)",
                                  border: `1px solid ${platformFilter === p ? (p === "all" ? "rgba(56,189,248,0.3)" : `${platformConfig[p].color}44`) : "rgba(148,163,184,0.12)"}`,
                                  borderRadius: "10px",
                                  "& .MuiChip-label": { px: 1.2 },
                              }}
                        />
                    ))}

                    <Box sx={{ flex: 1 }} />

                    {/* Status filter */}
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel sx={{ color: "rgba(148,163,184,0.6)", fontSize: 12 }}>Statut</InputLabel>
                        <Select value={statusFilter} label="Statut" onChange={e => handleStatusFilter(e.target.value as any)}
                                sx={{
                                    bgcolor: "rgba(15,23,42,0.6)", borderRadius: "12px", color: "#e2e8f0", fontSize: 13,
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(148,163,184,0.15)" },
                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(56,189,248,0.3)" },
                                    "& .MuiSvgIcon-root": { color: "rgba(148,163,184,0.5)" },
                                }}>
                            <MenuItem value="all">Tous</MenuItem>
                            {(Object.keys(statusConfig) as ReleaseStatus[]).map(s => (
                                <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{statusConfig[s].label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Sort toggle */}
                    <Box sx={{ display: "flex", bgcolor: "rgba(15,23,42,0.5)", border: "1px solid rgba(148,163,184,0.12)", borderRadius: "12px", overflow: "hidden" }}>
                        {(["newest", "oldest"] as const).map(o => (
                            <Box key={o} onClick={() => handleSortOrder(o)} sx={{
                                px: 1.5, py: 0.6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                color: sortOrder === o ? "#38bdf8" : "rgba(148,163,184,0.5)",
                                bgcolor: sortOrder === o ? "rgba(56,189,248,0.12)" : "transparent",
                                transition: "all 0.15s ease",
                                userSelect: "none",
                            }}>
                                {o === "newest" ? "↓ Plus récent" : "↑ Plus ancien"}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ── Results count ── */}
                <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.4)", mb: 1.5, letterSpacing: 0.5 }}>
                    {filtered.length} version{filtered.length !== 1 ? "s" : ""}
                </Typography>

                {/* ── Version cards ── */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {paginated.map(v => {
                        const pc = platformConfig[v.platform];
                        const sc = statusConfig[v.status];
                        return (
                            <Box key={v.id} sx={{
                                ...cardSx,
                                borderLeft: `3px solid ${sc.color}`,
                                opacity: v.status === "deprecated" ? 0.65 : 1,
                            }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>

                                    {/* Left: version info */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                                        {/* Platform icon */}
                                        <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: pc.bg, display: "flex", alignItems: "center", justifyContent: "center", color: pc.color, flexShrink: 0 }}>
                                            {pc.icon}
                                        </Box>

                                        {/* Version number + meta */}
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>
                                                    v{v.version}
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>
                                                    build #{v.buildNumber}
                                                </Typography>
                                                {/* Status badge */}
                                                <Chip
                                                    icon={<Box sx={{ color: sc.color, display: "flex", ml: "6px !important" }}>{sc.icon}</Box>}
                                                    label={sc.label}
                                                    size="small"
                                                    sx={{
                                                        height: 20, fontSize: 10, fontWeight: 700,
                                                        color: sc.color, bgcolor: sc.bg,
                                                        border: `1px solid ${sc.border}`,
                                                        borderRadius: "6px",
                                                        "& .MuiChip-label": { px: 0.8 },
                                                        "& .MuiChip-icon": { mr: 0 },
                                                    }}
                                                />
                                                {/* Platform badge */}
                                                <Chip
                                                    icon={<Box sx={{ color: pc.color, display: "flex", ml: "6px !important" }}>{pc.icon}</Box>}
                                                    label={pc.label}
                                                    size="small"
                                                    sx={{
                                                        height: 20, fontSize: 10, fontWeight: 600,
                                                        color: pc.color, bgcolor: pc.bg,
                                                        border: `1px solid ${pc.color}33`,
                                                        borderRadius: "6px",
                                                        "& .MuiChip-label": { px: 0.8 },
                                                        "& .MuiChip-icon": { mr: 0 },
                                                    }}
                                                />
                                                {v.forceUpdate && (
                                                    <Chip
                                                        icon={<WarningAmberIcon sx={{ fontSize: 11, ml: "6px !important" }} />}
                                                        label="Mise à jour forcée"
                                                        size="small"
                                                        sx={{
                                                            height: 20, fontSize: 10, fontWeight: 700,
                                                            color: "#f87171", bgcolor: "rgba(248,113,113,0.1)",
                                                            border: "1px solid rgba(248,113,113,0.3)",
                                                            borderRadius: "6px",
                                                            "& .MuiChip-label": { px: 0.8 },
                                                            "& .MuiChip-icon": { mr: 0 },
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* ── Date row — release date + last updated ── */}
                                            <Box sx={{ display: "flex", gap: 2, mt: 0.4, flexWrap: "wrap" }}>
                                                <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.45)" }}>
                                                    📅 {new Date(v.releaseDate).toLocaleDateString("fr-FR")}
                                                </Typography>
                                                <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.45)" }}>
                                                    Min supportée: v{v.minSupportedVersion}
                                                </Typography>
                                                <Tooltip title="Dernière modification enregistrée" placement="top">
                                                    <Typography sx={{
                                                        fontSize: 11,
                                                        color: "rgba(148,163,184,0.45)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.4,
                                                        cursor: "default",
                                                    }}>
                                                        🕐 Mis à jour: {formatLastUpdated(v.lastUpdatedAt)}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                        <Tooltip title="Modifier">
                                            <IconButton size="small" onClick={() => openEdit(v)}
                                                        sx={{ color: "rgba(148,163,184,0.5)", "&:hover": { color: "#38bdf8", bgcolor: "rgba(56,189,248,0.1)" }, borderRadius: "8px" }}>
                                                <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton size="small" onClick={() => setDeleteTarget(v)}
                                                        sx={{ color: "rgba(148,163,184,0.5)", "&:hover": { color: "#f87171", bgcolor: "rgba(248,113,113,0.1)" }, borderRadius: "8px" }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {/* Changelog */}
                                {v.changelog.length > 0 && (
                                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid rgba(148,163,184,0.07)" }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                            {v.changelog.map((c, i) => {
                                                const ct = changelogTypeConfig[c.type];
                                                return (
                                                    <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                                        <Typography sx={{ fontSize: 10, color: ct.color, mt: "3px", flexShrink: 0 }}>{ct.dot}</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                                                            <Chip label={ct.label} size="small" sx={{
                                                                height: 16, fontSize: 9, fontWeight: 700,
                                                                color: ct.color, bgcolor: `${ct.color}18`,
                                                                border: `1px solid ${ct.color}33`, borderRadius: "4px",
                                                                "& .MuiChip-label": { px: 0.6 },
                                                            }} />
                                                            <Typography sx={{ fontSize: 12, color: "rgba(203,213,225,0.75)" }}>{c.text}</Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                )}

                                {/* Note */}
                                {v.note && (
                                    <Box sx={{ mt: 1.2, p: "8px 12px", bgcolor: "rgba(248,113,113,0.06)", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.15)", display: "flex", gap: 1, alignItems: "flex-start" }}>
                                        <WarningAmberIcon sx={{ fontSize: 14, color: "#f87171", mt: "1px", flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: 11, color: "rgba(248,113,113,0.85)", lineHeight: 1.5 }}>{v.note}</Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}

                    {filtered.length === 0 && (
                        <Box sx={{ py: 6, textAlign: "center" }}>
                            <Typography sx={{ color: "rgba(148,163,184,0.35)", fontSize: 13 }}>Aucune version trouvée</Typography>
                        </Box>
                    )}
                </Box>

                {/* ── Pagination ── */}
                <AppPagination
                    total={filtered.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPage={setRowsPerPage}
                    options={[4, 8, 12]}
                />

                {/* ── Create / Edit Dialog ── */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: dialogSx }} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5, fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
                        {editTarget ? "Modifier la version" : "Nouvelle version"}
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, pb: 0 }}>
                        <Divider sx={{ borderColor: "rgba(148,163,184,0.1)", mb: 2.5 }} />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Row 1 */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
                                <FormControl size="small" sx={fieldSx}>
                                    <InputLabel>Plateforme</InputLabel>
                                    <Select value={form.platform} label="Plateforme" onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}>
                                        <MenuItem value="android">Android</MenuItem>
                                        <MenuItem value="ios">iOS</MenuItem>
                                        <MenuItem value="web">Web</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField size="small" label="Version (ex: 1.4.0)" value={form.version}
                                           onChange={e => setForm(f => ({ ...f, version: e.target.value }))} sx={fieldSx} />
                                <TextField size="small" label="Build #" value={form.buildNumber}
                                           onChange={e => setForm(f => ({ ...f, buildNumber: e.target.value }))} sx={fieldSx} />
                            </Box>

                            {/* Row 2 */}
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
                                <FormControl size="small" sx={fieldSx}>
                                    <InputLabel>Statut</InputLabel>
                                    <Select value={form.status} label="Statut" onChange={e => setForm(f => ({ ...f, status: e.target.value as ReleaseStatus }))}>
                                        {(Object.keys(statusConfig) as ReleaseStatus[]).map(s => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{statusConfig[s].label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField size="small" label="Date de sortie" type="date" value={form.releaseDate}
                                           onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}
                                           InputLabelProps={{ shrink: true }} sx={fieldSx} />
                                <TextField size="small" label="Version min. supportée" value={form.minSupportedVersion}
                                           onChange={e => setForm(f => ({ ...f, minSupportedVersion: e.target.value }))} sx={fieldSx} />
                            </Box>

                            {/* Force update */}
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px 14px", bgcolor: "rgba(248,113,113,0.05)", borderRadius: "10px", border: "1px solid rgba(248,113,113,0.15)" }}>
                                <Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Mise à jour forcée</Typography>
                                    <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>Les utilisateurs en dessous de la version min. seront forcés</Typography>
                                </Box>
                                <Switch checked={form.forceUpdate} onChange={e => setForm(f => ({ ...f, forceUpdate: e.target.checked }))}
                                        sx={{ "& .MuiSwitch-thumb": { bgcolor: form.forceUpdate ? "#f87171" : undefined } }} />
                            </Box>

                            {/* Changelog entries */}
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(148,163,184,0.45)", mb: 1 }}>
                                    Changelog
                                </Typography>

                                {/* Existing entries */}
                                {form.changelog.length > 0 && (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, mb: 1.2 }}>
                                        {form.changelog.map((c, i) => {
                                            const ct = changelogTypeConfig[c.type];
                                            return (
                                                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", bgcolor: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(148,163,184,0.08)" }}>
                                                    <Chip label={ct.label} size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700, color: ct.color, bgcolor: `${ct.color}18`, border: `1px solid ${ct.color}33`, borderRadius: "4px", "& .MuiChip-label": { px: 0.6 }, flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: 12, color: "rgba(203,213,225,0.8)", flex: 1 }}>{c.text}</Typography>
                                                    <IconButton size="small" onClick={() => removeChangelog(i)} sx={{ color: "rgba(148,163,184,0.4)", "&:hover": { color: "#f87171" }, p: 0.3 }}>
                                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}

                                {/* Add entry */}
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <FormControl size="small" sx={{ ...fieldSx, minWidth: 140 }}>
                                        <InputLabel>Type</InputLabel>
                                        <Select value={newChangelogType} label="Type" onChange={e => setNewChangelogType(e.target.value as any)}>
                                            {(Object.keys(changelogTypeConfig) as ChangelogEntry["type"][]).map(t => (
                                                <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{changelogTypeConfig[t].label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField size="small" placeholder="Description de la modification..." value={newChangelogText}
                                               onChange={e => setNewChangelogText(e.target.value)}
                                               onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addChangelog(); } }}
                                               sx={{ ...fieldSx, flex: 1 }} />
                                    <Button onClick={addChangelog} sx={{ bgcolor: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "10px", minWidth: 40, px: 1.5, textTransform: "none", fontSize: 12, fontWeight: 700, "&:hover": { bgcolor: "rgba(56,189,248,0.2)" } }}>
                                        +
                                    </Button>
                                </Box>
                            </Box>

                            {/* Note */}
                            <TextField size="small" label="Note interne (optionnelle)" value={form.note ?? ""}
                                       onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                       multiline rows={2} sx={fieldSx} />

                            {/* Last updated info — read-only, shown only when editing */}
                            {editTarget && (
                                <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.35)", fontStyle: "italic" }}>
                                    🕐 Dernière modification: {formatLastUpdated(editTarget.lastUpdatedAt)} — sera mise à jour à la sauvegarde.
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2.5 }}>
                        <Button onClick={() => setDialogOpen(false)} sx={{ color: "rgba(148,163,184,0.6)", textTransform: "none", fontSize: 13 }}>Annuler</Button>
                        <Button onClick={handleSave} disabled={!form.version.trim() || !form.buildNumber.trim()}
                                sx={{ bgcolor: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, "&:hover": { bgcolor: "rgba(56,189,248,0.25)" }, "&:disabled": { opacity: 0.4 } }}>
                            {editTarget ? "Enregistrer" : "Créer"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Delete confirm ── */}
                <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { ...dialogSx, minWidth: 380 } }}>
                    <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1, fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>Supprimer cette version ?</DialogTitle>
                    <DialogContent sx={{ px: 3 }}>
                        <Typography sx={{ fontSize: 13, color: "rgba(148,163,184,0.7)" }}>
                            La version <strong style={{ color: "#e2e8f0" }}>v{deleteTarget?.version}</strong> ({deleteTarget && platformConfig[deleteTarget.platform].label}) sera définitivement supprimée.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => setDeleteTarget(null)} sx={{ color: "rgba(148,163,184,0.6)", textTransform: "none", fontSize: 13 }}>Annuler</Button>
                        <Button onClick={handleDelete} sx={{ bgcolor: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "10px", textTransform: "none", fontWeight: 700, fontSize: 13, px: 2.5, "&:hover": { bgcolor: "rgba(248,113,113,0.22)" } }}>
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>{/* end main */}
        </Box>
    );
}

