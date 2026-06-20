// src/pages/security/Auditlog.tsx
// ═══════════════════════════════════════════════════════════════════
// Composant Journal d'audit — Affiche l'historique des actions admin
//
// AVANT : utilisait des données MOCK hardcodées (tableau LOGS)
// APRÈS : appelle le backend GET /api/admin/audit pour récupérer
//         les vrais logs depuis PostgreSQL
//
// Fonctionnalités :
//   - Chargement depuis le backend avec pagination
//   - Recherche par texte (action, détails, nom admin)
//   - Filtres par module, sévérité
//   - Export CSV et PDF
//   - Modal de détails au clic
// ═══════════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect, useCallback } from "react";
// ↑ useEffect  = exécuter du code quand le composant apparaît (fetch data)
//   useCallback = mémoriser une fonction pour éviter les re-rendus inutiles
//   useMemo     = mémoriser un résultat de calcul (filtrage)
//   useState    = stocker l'état local du composant

import {
    Box, Typography, Chip, TextField, Select, MenuItem,
    FormControl, InputLabel, InputAdornment, IconButton,
    Dialog, DialogContent, DialogTitle, Divider, Tooltip,
    Button, Badge, CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { fetchAuditLogs, type AuditLogEntry } from "../../api/auditLog.ts";
// ↑ On importe la fonction API et le type qu'on vient de créer

// ── Types pour le composant ───────────────────────────────────────
// On garde les mêmes types de sévérité et modules pour le UI
type Severity = "critical" | "warning" | "info" | "success";

// ── Mapping : action du backend → sévérité pour le UI ─────────────
// Le backend ne renvoie pas de "sévérité", c'est le FRONTEND qui décide
// quel niveau de criticité attribuer à chaque type d'action
function getSeverity(action: string): Severity {
    const lower = action.toLowerCase();
    // ↑ On met en minuscule pour que "Suppression" et "suppression" marchent

    // Actions critiques (rouge) — suppressions, suspensions, modifications sensibles
    if (lower.includes("supprim") || lower.includes("suspendu") ||
        lower.includes("commission") || lower.includes("rejet"))
        return "critical";

    // Actions d'attention (jaune) — créations, masquages, modifications
    if (lower.includes("créé") || lower.includes("masqué") ||
        lower.includes("modifié") || lower.includes("2fa") ||
        lower.includes("statut"))
        return "warning";

    // Actions de succès (vert) — approbations, résolutions
    if (lower.includes("approuvé") || lower.includes("résolu") ||
        lower.includes("activé") || lower.includes("réactivé"))
        return "success";

    // Tout le reste (bleu) — consultations, réponses, notifications
    return "info";
}

// ── Config des sévérités (couleurs, icônes) ───────────────────────
// Exactement le même design que avant
const severityConfig: Record<Severity, {
    label: string; color: string; bg: string; border: string; icon: React.ReactNode
}> = {
    critical: {
        label: "Critique", color: "#f87171",
        bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)",
        icon: <ErrorOutlineIcon sx={{ fontSize: 13 }} />,
    },
    warning: {
        label: "Attention", color: "#fbbf24",
        bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)",
        icon: <WarningAmberIcon sx={{ fontSize: 13 }} />,
    },
    info: {
        label: "Info", color: "#38bdf8",
        bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.3)",
        icon: <InfoOutlinedIcon sx={{ fontSize: 13 }} />,
    },
    success: {
        label: "Succès", color: "#4ade80",
        bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.3)",
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
    },
};

// ── Couleurs par module ───────────────────────────────────────────
const moduleColors: Record<string, string> = {
    "Authentification": "#f87171",
    "Sécurité":         "#f87171",
    "ADMINS":           "#f87171",
    "Prestataires":     "#a78bfa",
    "PROVIDERS":        "#a78bfa",
    "Clients":          "#38bdf8",
    "CLIENTS":          "#38bdf8",
    "Paiements":        "#4ade80",
    "PAYMENTS":         "#4ade80",
    "Support":          "#fbbf24",
    "TICKETS":          "#fbbf24",
    "Offres":           "#fb923c",
    "PROMOS":           "#fb923c",
    "Paramètres":       "#94a3b8",
    "SETTINGS":         "#94a3b8",
    "AUTH":             "#c084fc",
    "Catégories":       "#2dd4bf",
    "CATEGORIES":       "#2dd4bf",
    "Contenu":          "#e879f9",
    "CONTENT":          "#e879f9",
    "Notifications":    "#fb7185",
    "NOTIFICATIONS":    "#fb7185",
};
// ↑ On met les deux formats (français du AuditModule.java ET anglais)
//   parce que le backend pourrait envoyer "ADMINS" ou "Sécurité"
//   selon ce que tu as mis dans les constantes

// ── Liste des modules pour le filtre ──────────────────────────────
const MODULES = [
    "Authentification", "Sécurité", "Clients", "Prestataires",
    "Support", "Offres", "Paramètres", "Catégories",
    "Paiements", "Contenu", "Notifications",
];

const SEVERITIES: Severity[] = ["critical", "warning", "info", "success"];

// ── Structure interne pour le composant ───────────────────────────
// On transforme AuditLogEntry (backend) en LogEntry (UI)
interface LogEntry {
    id:        string;
    adminId:   string;     // ← AJOUTÉ pour le filtre "Voir l'activité"
    action:    string;
    module:    string;
    admin:     string;
    adminRole: string;
    details:   string;
    date:      string;
    severity:  Severity;
    ip:        string;
}



// ── Convertir les données backend → format UI ─────────────────────
function mapToLogEntry(entry: AuditLogEntry): LogEntry {
    return {
        id:        String(entry.id),
        // ↑ Le backend envoie un number, le UI utilise un string

        action:    entry.action,
        // ↑ Ex: "Admin créé", "Prestataire suspendu"

        module:    entry.module,
        // ↑ Ex: "Sécurité", "Clients"

        admin:     entry.adminName,
        // ↑ Ex: "Super Admin"

        adminRole: "",
        // ↑ Le backend ne renvoie pas le rôle dans l'audit log
        //   On pourrait l'ajouter plus tard si besoin

        details:   entry.details || "",
        // ↑ Ex: "Nouveau compte admin: sara@rilybricoule.com"

        date: entry.createdAt
            ? new Date(entry.createdAt).toLocaleDateString("fr-FR")
            : "—",
        // ↑ Le backend envoie "2026-03-20T14:30:00"
        //   On le transforme en "20/03/2026" (format français)

        severity: getSeverity(entry.action),
        // ↑ On calcule la sévérité à partir du nom de l'action

        ip: entry.ipAddress || "—",
        // ↑ L'IP peut être null, on met "—" si c'est le cas

        adminId:   String(entry.adminId),
    };
}

// ── Export CSV ────────────────────────────────────────────────────
function exportCSV(data: LogEntry[]) {
    const headers = ["Date", "Action", "Module", "Admin", "Sévérité", "Détails", "IP"];
    const rows = data.map(l => [
        l.date, l.action, l.module, l.admin,
        severityConfig[l.severity].label,
        `"${l.details}"`, l.ip,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `journal-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

// ── Export PDF ────────────────────────────────────────────────────
function exportPDF(data: LogEntry[]) {
    const win = window.open("", "_blank")!;
    win.document.write(`<html><head><title>Journal des actions</title><style>
        body{font-family:sans-serif;padding:24px;color:#111}
        h1{font-size:18px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#1e293b;color:#fff;padding:8px;text-align:left}
        td{padding:7px 8px;border-bottom:1px solid #e2e8f0}
        tr:nth-child(even){background:#f8fafc}
    </style></head><body>
        <h1>Journal des actions administrateur — RiLyBricoule</h1>
        <p style="font-size:11px;color:#64748b">Exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
        <table><thead><tr><th>Date</th><th>Action</th><th>Module</th><th>Admin</th><th>Sévérité</th><th>Détails</th></tr></thead><tbody>
        ${data.map(l => `<tr><td>${l.date}</td><td>${l.action}</td><td>${l.module}</td><td>${l.admin}</td><td>${severityConfig[l.severity].label}</td><td>${l.details}</td></tr>`).join("")}
        </tbody></table></body></html>`);
    win.document.close();
    win.print();
}

// ══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════
type AuditLogProps = {
    adminFilter?: string | null;
    // ↑ L'ID de l'admin à filtrer (vient de "Voir l'activité")
    //   null ou undefined = pas de filtre = tous les logs
    onClearFilter?: () => void;
    // ↑ Fonction pour retirer le filtre (bouton "×")
};


export default function AuditLog({ adminFilter, onClearFilter }: AuditLogProps) {
    // ── State ─────────────────────────────────────────────────────
    const [logs,     setLogs]     = useState<LogEntry[]>([]);
    // ↑ Les logs transformés en format UI (vide au début)

    const [loading,  setLoading]  = useState(true);
    // ↑ true pendant le chargement depuis le backend

    const [error,    setError]    = useState<string | null>(null);
    // ↑ Message d'erreur si le fetch échoue

    const [search,         setSearch]   = useState("");
    const [moduleFilter,   setModule]   = useState<string>("all");
    const [severityFilter, setSeverity] = useState<string>("all");
    const [selected,       setSelected] = useState<LogEntry | null>(null);
    const [filtersOpen,    setFiltersOpen] = useState(false);

    // ── Charger les logs depuis le backend ────────────────────────
    const loadLogs = useCallback(async () => {
        // ↑ useCallback mémorise cette fonction
        //   Elle ne sera recréée que si ses dépendances changent (aucune ici)
        try {
            setLoading(true);
            setError(null);

            const response = await fetchAuditLogs(0, 200);
            // ↑ On récupère les 200 premiers logs (page 0, taille 200)
            //   fetchAuditLogs appelle GET /api/admin/audit?page=0&size=200
            //   Le backend retourne un objet Page<AuditLogDTO>

            const mapped = response.content.map(mapToLogEntry);
            // ↑ response.content = le tableau d'AuditLogEntry
            //   .map(mapToLogEntry) transforme chaque entrée backend
            //   en format LogEntry pour le UI

            setLogs(mapped);
            // ↑ On met à jour le state avec les données transformées
            //   React re-rend le composant avec les nouvelles données

        } catch (err: any) {
            console.error("Failed to fetch audit logs:", err);
            setError("Impossible de charger le journal d'audit");
            // ↑ Si le backend est down ou retourne une erreur,
            //   on affiche un message à l'utilisateur
        } finally {
            setLoading(false);
            // ↑ finally s'exécute toujours (succès ou erreur)
            //   On arrête le spinner de chargement
        }
    }, []);

    // ── Appeler loadLogs au montage du composant ──────────────────
    useEffect(() => {
        loadLogs();
    }, [loadLogs]);
    // ↑ useEffect avec [loadLogs] = "exécute loadLogs quand le composant
    //   apparaît à l'écran pour la première fois"
    //   C'est l'équivalent de componentDidMount en React classes

    // ── Filtrage côté frontend ────────────────────────────────────
    const filtered = useMemo(() => {
        return logs.filter(l => {
            // Filtre par admin spécifique (vient de "Voir l'activité")
            if (adminFilter && l.adminId !== adminFilter) return false;

            // Filtre recherche texte
            if (search) {
                const q = search.toLowerCase();
                if (!l.action.toLowerCase().includes(q) &&
                    !l.details.toLowerCase().includes(q) &&
                    !l.admin.toLowerCase().includes(q))
                    return false;
            }
            // Filtre module
            if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
            // Filtre sévérité
            if (severityFilter !== "all" && l.severity !== severityFilter) return false;
            return true;
        });
    }, [logs, search, moduleFilter, severityFilter, adminFilter]);


    // ↑ useMemo recalcule le filtrage SEULEMENT quand logs, search,
    //   moduleFilter ou severityFilter changent. Pas à chaque rendu.

    const activeFilters = [moduleFilter, severityFilter].filter(v => v !== "all").length;

    // ── État de chargement ────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                <CircularProgress size={32} />
                <Typography sx={{ ml: 2, color: "text.secondary" }}>
                    Chargement du journal...
                </Typography>
            </Box>
        );
    }

    // ── État d'erreur ─────────────────────────────────────────────
    if (error) {
        return (
            <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography sx={{ color: "#f87171", mb: 2 }}>{error}</Typography>
                <Button variant="outlined" onClick={loadLogs}
                        sx={{ color: "#38bdf8", borderColor: "rgba(56,189,248,0.3)" }}>
                    Réessayer
                </Button>
            </Box>
        );
    }

    // ── Rendu principal ───────────────────────────────────────────
    return (
        <Box sx={{ fontFamily: "'DM Sans', sans-serif", bgcolor: "transparent", width: "100%" }}>

            {/* ── Toolbar ── */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                    size="small"
                    placeholder="Rechercher dans le journal..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "rgba(148,163,184,0.6)" }} /></InputAdornment>,
                    }}
                    sx={{
                        flex: 1, minWidth: 220,
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(15,23,42,0.6)", borderRadius: "12px",
                            color: "#e2e8f0", fontSize: 13,
                            "& fieldset": { borderColor: "rgba(148,163,184,0.15)" },
                            "&:hover fieldset": { borderColor: "rgba(56,189,248,0.3)" },
                            "&.Mui-focused fieldset": { borderColor: "rgba(56,189,248,0.5)" },
                        },
                        "& input::placeholder": { color: "rgba(148,163,184,0.5)", opacity: 1 },
                    }}
                />

                <Tooltip title="Filtres avancés">
                    <Badge badgeContent={activeFilters} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: 10, minWidth: 16, height: 16 } }}>
                        <IconButton
                            onClick={() => setFiltersOpen(v => !v)}
                            sx={{
                                bgcolor: filtersOpen ? "rgba(56,189,248,0.15)" : "rgba(15,23,42,0.6)",
                                border: `1px solid ${filtersOpen ? "rgba(56,189,248,0.4)" : "rgba(148,163,184,0.15)"}`,
                                borderRadius: "12px", color: filtersOpen ? "#38bdf8" : "rgba(148,163,184,0.7)",
                                "&:hover": { bgcolor: "rgba(56,189,248,0.1)" },
                            }}
                        >
                            <FilterListIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Badge>
                </Tooltip>

                <Button size="small" startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
                        onClick={() => exportCSV(filtered)}
                        sx={{
                            bgcolor: "rgba(15,23,42,0.6)", color: "#4ade80",
                            border: "1px solid rgba(74,222,128,0.2)", borderRadius: "12px",
                            fontSize: 12, fontWeight: 600, textTransform: "none", px: 2,
                            "&:hover": { bgcolor: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.4)" },
                        }}>Excel</Button>

                <Button size="small" startIcon={<PictureAsPdfIcon sx={{ fontSize: 15 }} />}
                        onClick={() => exportPDF(filtered)}
                        sx={{
                            bgcolor: "rgba(15,23,42,0.6)", color: "#f87171",
                            border: "1px solid rgba(248,113,113,0.2)", borderRadius: "12px",
                            fontSize: 12, fontWeight: 600, textTransform: "none", px: 2,
                            "&:hover": { bgcolor: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.4)" },
                        }}>PDF</Button>

                {/* Refresh button */}
                <Button size="small" onClick={loadLogs}
                        sx={{
                            bgcolor: "rgba(15,23,42,0.6)", color: "#38bdf8",
                            border: "1px solid rgba(56,189,248,0.2)", borderRadius: "12px",
                            fontSize: 12, fontWeight: 600, textTransform: "none", px: 2,
                            "&:hover": { bgcolor: "rgba(56,189,248,0.1)" },
                        }}>Actualiser</Button>
            </Box>

            {/* ── Filter Panel ── */}
            {filtersOpen && (
                <Box sx={{
                    display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap",
                    p: "14px 16px", borderRadius: "14px",
                    bgcolor: "rgba(15,23,42,0.5)",
                    border: "1px solid rgba(148,163,184,0.1)",
                    animation: "fadeSlide 0.2s ease",
                    "@keyframes fadeSlide": { from: { opacity: 0, transform: "translateY(-6px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel sx={{ color: "rgba(148,163,184,0.6)", fontSize: 12 }}>Module</InputLabel>
                        <Select value={moduleFilter} onChange={e => setModule(e.target.value)} label="Module"
                                sx={selectSx}>
                            <MenuItem value="all">Tous</MenuItem>
                            {MODULES.map(m => <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel sx={{ color: "rgba(148,163,184,0.6)", fontSize: 12 }}>Sévérité</InputLabel>
                        <Select value={severityFilter} onChange={e => setSeverity(e.target.value)} label="Sévérité"
                                sx={selectSx}>
                            <MenuItem value="all">Toutes</MenuItem>
                            {SEVERITIES.map(s => (
                                <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ color: severityConfig[s].color, display: "flex" }}>{severityConfig[s].icon}</Box>
                                        {severityConfig[s].label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {activeFilters > 0 && (
                        <Button size="small" onClick={() => { setModule("all"); setSeverity("all"); }}
                                sx={{ color: "rgba(148,163,184,0.6)", fontSize: 11, textTransform: "none", ml: "auto", "&:hover": { color: "#f87171" } }}>
                            Réinitialiser
                        </Button>
                    )}
                </Box>
            )}

            {/* ── Results count ── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.45)", letterSpacing: 0.5 }}>
                    {filtered.length} entrée{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
                </Typography>

                {adminFilter && (
                    <Chip
                        label={`Filtré par : ${logs.find(l => l.adminId === adminFilter)?.admin || "Admin #" + adminFilter}`}
                        size="small"
                        onDelete={onClearFilter}
                        sx={{
                            height: 22, fontSize: 11, fontWeight: 600,
                            color: "#38bdf8",
                            bgcolor: "rgba(56,189,248,0.1)",
                            border: "1px solid rgba(56,189,248,0.3)",
                            borderRadius: "8px",
                            "& .MuiChip-deleteIcon": {
                                color: "rgba(56,189,248,0.5)",
                                fontSize: 16,
                                "&:hover": { color: "#f87171" },
                            },
                        }}
                    />
                )}
            </Box>


            {/* ── Table ── */}
            <Box sx={{
                borderRadius: "16px", overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.1)",
                bgcolor: "rgba(15,23,42,0.55)",
            }}>
                {/* Header */}
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.2fr 1.4fr 2fr 1fr 40px",
                    px: 2, py: 1.2,
                    bgcolor: "rgba(15,23,42,0.8)",
                    borderBottom: "1px solid rgba(148,163,184,0.08)",
                }}>
                    {["Action", "Module", "Admin", "Détails", "Date", ""].map((h, i) => (
                        <Typography key={i} sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: "rgba(148,163,184,0.45)" }}>
                            {h}
                        </Typography>
                    ))}
                </Box>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography sx={{ color: "rgba(148,163,184,0.4)", fontSize: 13 }}>
                            {logs.length === 0 ? "Aucune action enregistrée pour le moment" : "Aucun résultat trouvé"}
                        </Typography>
                    </Box>
                ) : filtered.map((log, idx) => {
                    const sev = severityConfig[log.severity];
                    const modColor = moduleColors[log.module] || "#94a3b8";
                    return (
                        <Box
                            key={log.id}
                            onClick={() => setSelected(log)}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1.2fr 1.4fr 2fr 1fr 40px",
                                px: 2, py: 1.5, alignItems: "center", cursor: "pointer",
                                borderBottom: idx < filtered.length - 1 ? "1px solid rgba(148,163,184,0.06)" : "none",
                                transition: "background 0.15s ease",
                                "&:hover": { bgcolor: "rgba(56,189,248,0.05)" },
                                "&:hover .row-expand": { opacity: 1 },
                            }}
                        >
                            {/* Action + severity badge */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
                                <Chip
                                    icon={<Box sx={{ color: sev.color, display: "flex", ml: "6px !important" }}>{sev.icon}</Box>}
                                    label={sev.label} size="small"
                                    sx={{
                                        height: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                                        color: sev.color, bgcolor: sev.bg,
                                        border: `1px solid ${sev.border}`,
                                        borderRadius: "6px", flexShrink: 0,
                                        "& .MuiChip-label": { px: 0.8 }, "& .MuiChip-icon": { mr: 0 },
                                    }}
                                />
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#38bdf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {log.action}
                                </Typography>
                            </Box>

                            {/* Module */}
                            <Box>
                                <Chip label={log.module} size="small" sx={{
                                    height: 22, fontSize: 11, fontWeight: 600,
                                    color: modColor,
                                    bgcolor: `${modColor}18`,
                                    border: `1px solid ${modColor}33`,
                                    borderRadius: "8px",
                                    "& .MuiChip-label": { px: 1 },
                                }} />
                            </Box>

                            {/* Admin */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                <Box sx={{
                                    width: 24, height: 24, borderRadius: "8px",
                                    bgcolor: "rgba(56,189,248,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    <PersonIcon sx={{ fontSize: 13, color: "#38bdf8" }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.2 }}>{log.admin}</Typography>
                                    {log.adminRole && (
                                        <Typography sx={{ fontSize: 10, color: "rgba(148,163,184,0.5)" }}>{log.adminRole}</Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Details */}
                            <Typography sx={{ fontSize: 12, color: "rgba(148,163,184,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: 1 }}>
                                {log.details}
                            </Typography>

                            {/* Date */}
                            <Typography sx={{ fontSize: 11, color: "rgba(148,163,184,0.5)", fontVariantNumeric: "tabular-nums" }}>
                                {log.date}
                            </Typography>

                            {/* Expand icon */}
                            <Box className="row-expand" sx={{ opacity: 0, transition: "opacity 0.15s", display: "flex", justifyContent: "center" }}>
                                <OpenInFullIcon sx={{ fontSize: 13, color: "rgba(56,189,248,0.6)" }} />
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* ── Detail Modal ── */}
            <Dialog
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
                maxWidth="sm" fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: "#0d1829",
                        backgroundImage: "linear-gradient(135deg, #0f1e35 0%, #0d1829 100%)",
                        border: "1px solid rgba(56,189,248,0.2)",
                        borderRadius: "20px",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                    }
                }}
            >
                {selected && (() => {
                    const sev = severityConfig[selected.severity];
                    const modColor = moduleColors[selected.module] || "#94a3b8";
                    return (
                        <>
                            <DialogTitle sx={{ p: "20px 24px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <Chip icon={<Box sx={{ color: sev.color, display: "flex", ml: "6px !important" }}>{sev.icon}</Box>}
                                              label={sev.label} size="small"
                                              sx={{ height: 20, fontSize: 10, fontWeight: 700, color: sev.color, bgcolor: sev.bg, border: `1px solid ${sev.border}`, borderRadius: "6px", "& .MuiChip-label": { px: 0.8 }, "& .MuiChip-icon": { mr: 0 } }} />
                                        <Chip label={selected.module} size="small"
                                              sx={{ height: 20, fontSize: 10, fontWeight: 700, color: modColor, bgcolor: `${modColor}18`, border: `1px solid ${modColor}33`, borderRadius: "6px", "& .MuiChip-label": { px: 0.8 } }} />
                                    </Box>
                                    <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0" }}>{selected.action}</Typography>
                                </Box>
                                <IconButton onClick={() => setSelected(null)} size="small"
                                            sx={{ color: "rgba(148,163,184,0.5)", "&:hover": { color: "#f87171", bgcolor: "rgba(248,113,113,0.1)" }, mt: -0.5 }}>
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent sx={{ px: 3, pb: 3 }}>
                                <Divider sx={{ borderColor: "rgba(148,163,184,0.1)", mb: 2.5 }} />
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2.5 }}>
                                    {[
                                        { label: "Admin", value: selected.admin, sub: selected.adminRole || undefined },
                                        { label: "Date", value: selected.date },
                                        { label: "Module", value: selected.module },
                                        { label: "Adresse IP", value: selected.ip },
                                    ].map((item, i) => (
                                        <Box key={i} sx={{ p: "12px 14px", bgcolor: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.08)" }}>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(148,163,184,0.45)", mb: 0.4 }}>
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.value}</Typography>
                                            {item.sub && <Typography sx={{ fontSize: 10, color: "rgba(148,163,184,0.5)" }}>{item.sub}</Typography>}
                                        </Box>
                                    ))}
                                </Box>

                                <Box sx={{ p: "14px 16px", bgcolor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.08)" }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "rgba(148,163,184,0.45)", mb: 1 }}>
                                        Détails complets
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: "rgba(203,213,225,0.85)", lineHeight: 1.7 }}>
                                        {selected.details}
                                    </Typography>
                                </Box>
                            </DialogContent>
                        </>
                    );
                })()}
            </Dialog>
        </Box>
    );
}

// ── Shared select styles ──────────────────────────────────────────
const selectSx = {
    bgcolor: "rgba(15,23,42,0.6)", borderRadius: "12px", color: "#e2e8f0", fontSize: 13,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(148,163,184,0.15)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(56,189,248,0.3)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(56,189,248,0.5)" },
    "& .MuiSvgIcon-root": { color: "rgba(148,163,184,0.5)" },
};
