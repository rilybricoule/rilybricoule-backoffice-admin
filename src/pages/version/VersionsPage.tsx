import { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Tab, Tabs, Typography } from "@mui/material";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";
import LanguageIcon from "@mui/icons-material/Language";
import AddIcon from "@mui/icons-material/Add";
import type { AppVersion, NoteType, Platform } from "../../Data/AppVersion";
import VersionCard from "./VersionCard";
import NewVersionDialog from "./NewVersionDialog";
import AdminLayout from "../../components/AdminLayout";
import {
    createContentAppVersion,
    deleteContentAppVersion,
    getContentAppVersions,
    updateContentAppVersion,
    type ContentAppVersion,
    type ContentAppVersionPayload,
    type ContentChangelogType,
} from "../../api/contentAppVersions";



const platformMeta = {
    android: { label: "Android", icon: <AndroidIcon />, color: "#3DDC84" },
    ios: { label: "iOS", icon: <AppleIcon />, color: "#A2AAAD" },
    web: { label: "Web", icon: <LanguageIcon />, color: "#4A90D9" },
};


function PlatformSummaryCard({ platform, liveVersion, upcomingVersion, upcomingStatus }: {
    platform: Platform; liveVersion: string | null;
    upcomingVersion: string | null; upcomingStatus: "upcoming" | "beta" | null;
}) {
    const meta = platformMeta[platform];
    return (
        <Box sx={{ flex: 1, minWidth: 220, bgcolor: "rgba(10,37,77,0.60)", border: "1px solid rgba(147,181,218,0.18)", borderRadius: 3, p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${meta.color}22`, border: `1px solid ${meta.color}44`, display: "grid", placeItems: "center", color: meta.color }}>
                    {meta.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#f8fafc" }}>{meta.label}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>Version live</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: "#22c55e" }}>{liveVersion ? `v${liveVersion}` : "—"}</Typography>
            </Box>
            {upcomingVersion && upcomingStatus && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {upcomingStatus === "beta" ? "Bêta en cours" : "À venir"}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: upcomingStatus === "beta" ? "#f97316" : "#60a5fa" }}>
                        v{upcomingVersion}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

type PlatformFilter = "all" | Platform;

function mapNoteType(type: ContentChangelogType): NoteType {
    if (type === "feature") return "new";
    return type;
}

function toChangelogType(type: NoteType): ContentChangelogType {
    if (type === "new") return "feature";
    return type;
}

function fromApiVersion(version: ContentAppVersion): AppVersion {
    return {
        id: version.id,
        version: version.version,
        build: Number(version.buildNumber || 0),
        platform: version.platform,
        status: version.status,
        releaseDate: version.releaseDate,
        minSupported: version.minSupportedVersion,
        updatedAt: version.lastUpdatedAt,
        forcedUpdate: version.forceUpdate,
        notes: version.changelog.map((entry) => ({
            type: mapNoteType(entry.type),
            text: entry.text,
        })),
    };
}

function toApiPayload(version: AppVersion): ContentAppVersionPayload {
    return {
        platform: version.platform,
        version: version.version,
        buildNumber: String(version.build),
        releaseDate: version.releaseDate,
        status: version.status,
        forceUpdate: version.forcedUpdate,
        minSupportedVersion: version.minSupported,
        changelog: version.notes.map((note) => ({
            type: toChangelogType(note.type),
            text: note.text,
        })),
    };
}

export default function VersionsPage() {
    const [versions, setVersions] = useState<AppVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(true);
    const [versionsError, setVersionsError] = useState("");
    const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
    const [tab, setTab] = useState<0 | 1>(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editVersion, setEditVersion] = useState<AppVersion | null>(null);

    const loadVersions = async () => {
        try {
            setLoadingVersions(true);
            setVersionsError("");

            const data = await getContentAppVersions();
            setVersions(data.map(fromApiVersion));
        } catch (err: any) {
            setVersionsError(err?.response?.data?.message || "Erreur chargement versions");
        } finally {
            setLoadingVersions(false);
        }
    };

    useEffect(() => {
        loadVersions();
    }, []);

    const platformSummary = useMemo(() => {
        const platforms: Platform[] = ["android", "ios", "web"];
        return platforms.map((p) => {
            const live = versions.find((v) => v.platform === p && v.status === "live");
            const upcoming = versions.find((v) => v.platform === p && (v.status === "upcoming" || v.status === "beta"));
            return { platform: p, liveVersion: live?.version ?? null, upcomingVersion: upcoming?.version ?? null, upcomingStatus: (upcoming?.status ?? null) as "upcoming" | "beta" | null };
        });
    }, [versions]);

    const upcomingList = useMemo(() =>
            versions.filter((v) => (v.status === "upcoming" || v.status === "beta") && (platformFilter === "all" || v.platform === platformFilter)),
        [versions, platformFilter]);

    const historicList = useMemo(() =>
            versions.filter((v) => (v.status === "live" || v.status === "deprecated") && (platformFilter === "all" || v.platform === platformFilter)),
        [versions, platformFilter]);

    const displayList = tab === 0 ? upcomingList : historicList;

    const handleSave = async (v: AppVersion) => {
        try {
            setVersionsError("");

            const exists = versions.some((item) => item.id === v.id);
            const saved = exists
                ? await updateContentAppVersion(v.id, toApiPayload(v))
                : await createContentAppVersion(toApiPayload(v));

            const mapped = fromApiVersion(saved);

            setVersions((prev) =>
                exists
                    ? prev.map((item) => item.id === mapped.id ? mapped : item)
                    : [mapped, ...prev]
            );

            setEditVersion(null);
            setDialogOpen(false);
        } catch (err: any) {
            setVersionsError(err?.response?.data?.message || "Erreur sauvegarde version");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setVersionsError("");

            await deleteContentAppVersion(id);
            setVersions((prev) => prev.filter((version) => version.id !== id));
        } catch (err: any) {
            setVersionsError(err?.response?.data?.message || "Erreur suppression version");
        }
    };

    const platformChips: { value: PlatformFilter; label: string; icon?: React.ReactNode; color: string }[] = [
        { value: "all", label: "Toutes plateformes", color: "#60a5fa" },
        { value: "android", label: "Android", icon: <AndroidIcon sx={{ fontSize: 15 }} />, color: "#3DDC84" },
        { value: "ios", label: "iOS", icon: <AppleIcon sx={{ fontSize: 15 }} />, color: "#A2AAAD" },
        { value: "web", label: "Web", icon: <LanguageIcon sx={{ fontSize: 15 }} />, color: "#4A90D9" },
    ];

    return (
        <AdminLayout selected="version">

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        Versions de l'application
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestion des versions iOS, Android et Web — release notes &amp; mises à jour
                    </Typography>
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

                {/* Platform summary cards */}
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                    {platformSummary.map((s) => <PlatformSummaryCard key={s.platform} {...s} />)}
                </Box>

                {/* Filter bar */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {platformChips.map((chip) => {
                            const active = platformFilter === chip.value;
                            return (
                                <Chip key={chip.value}
                                      icon={chip.icon ? <Box sx={{ display: "flex", color: `${chip.color} !important` }}>{chip.icon}</Box> : undefined}
                                      label={chip.label} onClick={() => setPlatformFilter(chip.value)}
                                      sx={{ fontWeight: active ? 700 : 500, bgcolor: active ? `${chip.color}22` : "rgba(255,255,255,0.06)", color: active ? chip.color : "text.secondary", border: active ? `1px solid ${chip.color}55` : "1px solid rgba(148,163,184,0.2)", cursor: "pointer", "&:hover": { bgcolor: `${chip.color}18` } }}
                                />
                            );
                        })}
                    </Box>
                </Box>

                {/* Tabs + list */}
                <Box sx={{ bgcolor: "rgba(10,37,77,0.60)", border: "1px solid rgba(147,181,218,0.18)", borderRadius: 3, overflow: "hidden" }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}
                          sx={{ borderBottom: "1px solid rgba(147,181,218,0.18)", px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: "text.secondary" }, "& .Mui-selected": { color: "#60a5fa" }, "& .MuiTabs-indicator": { backgroundColor: "#60a5fa" } }}>
                        <Tab label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                À venir
                                <Chip label={upcomingList.length} size="small"
                                      sx={{ height: 18, fontSize: "0.68rem", fontWeight: 700, bgcolor: tab === 0 ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.08)", color: tab === 0 ? "#60a5fa" : "text.secondary" }} />
                            </Box>
                        } />
                        <Tab label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                Historique
                                <Chip label={historicList.length} size="small"
                                      sx={{ height: 18, fontSize: "0.68rem", fontWeight: 700, bgcolor: tab === 1 ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.08)", color: tab === 1 ? "#60a5fa" : "text.secondary" }} />
                            </Box>
                        } />
                    </Tabs>

                    <Box sx={{ p: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
                            {displayList.length} version{displayList.length !== 1 ? "s" : ""}
                        </Typography>
                        {displayList.length === 0
                            ? <Typography sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>Aucune version trouvée</Typography>
                            : displayList.map((v) => (
                                <VersionCard key={v.id} version={v}
                                             onEdit={(v) => { setEditVersion(v); setDialogOpen(true); }}
                                             onDelete={handleDelete}
                                />
                            ))
                        }
                    </Box>
                </Box>

        <NewVersionDialog open={dialogOpen} version={editVersion}
                          onClose={() => { setDialogOpen(false); setEditVersion(null); }}
                          onSave={handleSave} />
        </AdminLayout>
    );
}
