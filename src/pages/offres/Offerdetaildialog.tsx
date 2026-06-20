import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
    Divider,
    Chip,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import BuildIcon from "@mui/icons-material/Build";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import type { Offer } from "../../Data/Offer";

type Props = {
    offer: Offer | null;
    open: boolean;
    onClose: () => void;
    onEdit?: (offer: Offer) => void;
    onApprove?: (offer: Offer) => void;
    onReject?: (offer: Offer) => void;
};

const statusConfig = {
    active: {
        label: "Approuvée",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.3)",
        icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
    },
    en_attente: {
        label: "En attente",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.3)",
        icon: <AccessTimeIcon sx={{ fontSize: 13 }} />,
    },
    masquee: {
        label: "Rejetée",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.3)",
        icon: <VisibilityOffIcon sx={{ fontSize: 13 }} />,
    },
    en_attente_ajustement: {
        label: "Ajustement requis",
        color: "#a78bfa",
        bg: "rgba(167,139,250,0.12)",
        border: "rgba(167,139,250,0.3)",
        icon: <WarningAmberIcon sx={{ fontSize: 13 }} />,
    },
};

type QualityLevel = "good" | "warning" | "poor";

interface DescriptionAnalysis {
    wordCount: number;
    bullets: string[];
    hasBullets: boolean;
    quality: QualityLevel;
    qualityLabel: string;
    qualityColor: string;
    flags: { type: QualityLevel; text: string }[];
}

function analyzeDescription(text: string): DescriptionAnalysis {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let bullets: string[] = [];

    if (trimmed.includes(":")) {
        const parts = trimmed.split(/[.!?]/).filter(Boolean);
        parts.forEach(part => {
            if (part.includes(":")) {
                const [, rest] = part.split(":");
                if (rest) {
                    const items = rest.split(",").map(s => s.trim()).filter(s => s.length > 2);
                    if (items.length >= 2) bullets.push(...items);
                }
            }
        });
    }

    if (trimmed.match(/^[•\-–*]/m)) {
        bullets = trimmed
            .split(/\n/)
            .map(l => l.replace(/^[•\-–*]\s*/, "").trim())
            .filter(Boolean);
    }

    const hasBullets = bullets.length >= 2;
    const flags: { type: QualityLevel; text: string }[] = [];

    if (wordCount < 10) {
        flags.push({ type: "poor", text: "Description trop courte (moins de 10 mots)" });
    } else if (wordCount < 25) {
        flags.push({ type: "warning", text: "Description courte — plus de détails recommandés" });
    } else {
        flags.push({ type: "good", text: `Longueur correcte (${wordCount} mots)` });
    }

    if (hasBullets) {
        flags.push({ type: "good", text: "Contenu structuré avec points détaillés" });
    } else if (wordCount >= 25) {
        flags.push({ type: "warning", text: "Pas de liste — une structure en points aiderait" });
    }

    const hasPrice = /\d+\s*(mad|dh|€|\$|dirham)/i.test(trimmed);
    const hasGuarantee = /garant|certif|assur/i.test(trimmed);
    const hasZone = /zone|secteur|quartier|ville|région/i.test(trimmed);
    const hasDelay = /délai|sous\s*\d+|j\/j|24h|48h|jours/i.test(trimmed);

    if (hasGuarantee) flags.push({ type: "good", text: "Mentionne une garantie ou certification" });
    if (hasZone) flags.push({ type: "good", text: "Zone d'intervention précisée" });
    if (hasDelay) flags.push({ type: "good", text: "Délai d'intervention mentionné" });
    if (hasPrice) flags.push({ type: "warning", text: "Tarif mentionné dans la description (redondant)" });

    const upperRatio = (trimmed.match(/[A-ZÀÂÉÈÊËÎÏÔÙÛÜ]/g) ?? []).length / Math.max(wordCount, 1);

    if (upperRatio > 0.4 && wordCount > 5) {
        flags.push({ type: "warning", text: "Utilisation excessive de majuscules" });
    }

    const poorCount = flags.filter(f => f.type === "poor").length;
    const goodCount = flags.filter(f => f.type === "good").length;

    let quality: QualityLevel;
    let qualityLabel: string;
    let qualityColor: string;

    if (poorCount >= 1) {
        quality = "poor";
        qualityLabel = "Insuffisante";
        qualityColor = "#ef4444";
    } else if (goodCount >= 3) {
        quality = "good";
        qualityLabel = "Bonne qualité";
        qualityColor = "#22c55e";
    } else {
        quality = "warning";
        qualityLabel = "Correcte";
        qualityColor = "#f59e0b";
    }

    return { wordCount, bullets, hasBullets, quality, qualityLabel, qualityColor, flags };
}

function FlagIcon({ type }: { type: QualityLevel }) {
    if (type === "good") return <CheckIcon sx={{ fontSize: 13, color: "#22c55e" }} />;
    if (type === "warning") return <WarningAmberIcon sx={{ fontSize: 13, color: "#f59e0b" }} />;
    return <ErrorOutlineIcon sx={{ fontSize: 13, color: "#ef4444" }} />;
}

function InfoRow({ icon, label, value, valueColor }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueColor?: string;
}) {
    return (
        <Box sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            py: 1.1,
            borderBottom: "1px solid rgba(147,181,218,0.08)",
            "&:last-child": { borderBottom: "none" },
        }}>
            <Box sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.15)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                color: "#38bdf8",
            }}>
                {icon}
            </Box>
            <Box>
                <Typography sx={{ fontSize: 11, color: "rgba(226,232,240,0.45)", mb: 0.15 }}>
                    {label}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: valueColor ?? "#e2e8f0" }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default function OfferDetailsDialog({
                                               offer,
                                               open,
                                               onClose,
                                               onEdit,
                                               onApprove,
                                               onReject,
                                           }: Props) {
    if (!offer) return null;

    const status = statusConfig[offer.status];
    const analysis = analyzeDescription(offer.description);

    const initials = offer.providerName
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const formatDate = (date: string) =>
        new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "rgba(8,18,40,0.97)",
                    border: "1px solid rgba(56,189,248,0.18)",
                    borderRadius: 3,
                    backgroundImage: "none",
                    color: "#e2e8f0",
                    boxShadow: "0 24px 80px rgba(2,6,23,0.7)",
                },
            }}
            slotProps={{
                backdrop: { sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(2,6,23,0.55)" } },
            }}
        >
            <DialogContent sx={{ p: 0 }}>

                <Box sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                        <Typography sx={{
                            fontSize: 11,
                            color: "rgba(56,189,248,0.7)",
                            fontWeight: 700,
                            letterSpacing: 1,
                            mb: 0.5,
                        }}>
                            DÉTAILS DE L'OFFRE
                        </Typography>
                        <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", lineHeight: 1.3 }}>
                            {offer.title}
                        </Typography>
                    </Box>

                    <IconButton onClick={onClose} size="small" sx={{
                        color: "rgba(226,232,240,0.5)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#e2e8f0" },
                    }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ px: 3, pb: 2 }}>
                    <Box sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.6,
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 2,
                        bgcolor: status.bg,
                        border: `1px solid ${status.border}`,
                    }}>
                        {status.icon}
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: status.color }}>
                            {status.label}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                <Box sx={{
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: 520,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(148,163,184,0.25)", borderRadius: 10 },
                }}>

                    <Box sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: "rgba(56,189,248,0.05)",
                        border: "1px solid rgba(56,189,248,0.12)",
                    }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{
                                width: 42,
                                height: 42,
                                fontSize: 14,
                                fontWeight: 700,
                                bgcolor: "rgba(56,189,248,0.15)",
                                color: "#38bdf8",
                                border: "1px solid rgba(56,189,248,0.25)",
                            }}>
                                {initials || "P"}
                            </Avatar>

                            <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                                    {offer.providerName}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "rgba(226,232,240,0.4)" }}>
                                    ID prestataire · {offer.providerId || "—"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1.5 }}>
                            <Box sx={{
                                flex: 1,
                                minWidth: 110,
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: "rgba(56,189,248,0.06)",
                                border: "1px solid rgba(56,189,248,0.15)",
                            }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                                    <BuildIcon sx={{ fontSize: 13, color: "#38bdf8" }} />
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(226,232,240,0.45)", letterSpacing: 0.5 }}>
                                        OFFRE
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                                    {offer.category}
                                </Typography>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                minWidth: 110,
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: "rgba(245,158,11,0.07)",
                                border: "1px solid rgba(245,158,11,0.18)",
                            }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                                    <StarIcon sx={{ fontSize: 13, color: "#f59e0b" }} />
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(226,232,240,0.45)", letterSpacing: 0.5 }}>
                                        CONTRÔLE
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: status.color }}>
                                    {status.label}
                                </Typography>
                            </Box>

                            <Box sx={{
                                flex: 1,
                                minWidth: 90,
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: "rgba(147,181,218,0.05)",
                                border: "1px solid rgba(147,181,218,0.12)",
                            }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                                    <WorkspacesIcon sx={{ fontSize: 13, color: "#93c5fd" }} />
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(226,232,240,0.45)", letterSpacing: 0.5 }}>
                                        PRIX
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                                    {offer.price.toLocaleString("fr-FR")} MAD
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{
                        borderRadius: 2,
                        border: `1px solid ${
                            analysis.quality === "good" ? "rgba(34,197,94,0.2)" :
                                analysis.quality === "warning" ? "rgba(245,158,11,0.2)" :
                                    "rgba(239,68,68,0.2)"
                        }`,
                    }}>
                        <Box sx={{
                            px: 1.8,
                            py: 1.2,
                            bgcolor: analysis.quality === "good" ? "rgba(34,197,94,0.06)" :
                                analysis.quality === "warning" ? "rgba(245,158,11,0.06)" :
                                    "rgba(239,68,68,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                <DescriptionIcon sx={{ fontSize: 14, color: "#38bdf8" }} />
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "rgba(226,232,240,0.5)", letterSpacing: 0.5 }}>
                                    DESCRIPTION
                                </Typography>
                            </Box>

                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                px: 1,
                                py: 0.3,
                                borderRadius: 1.5,
                                bgcolor: analysis.quality === "good" ? "rgba(34,197,94,0.12)" :
                                    analysis.quality === "warning" ? "rgba(245,158,11,0.12)" :
                                        "rgba(239,68,68,0.12)",
                            }}>
                                <FlagIcon type={analysis.quality} />
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: analysis.qualityColor }}>
                                    {analysis.qualityLabel}
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: "rgba(226,232,240,0.35)", ml: 0.3 }}>
                                    · {analysis.wordCount} mots
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

                        <Box sx={{ px: 1.8, pt: 1.5, pb: analysis.hasBullets ? 1 : 1.8 }}>
                            <Typography sx={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8 }}>
                                {offer.description || "Aucune description fournie."}
                            </Typography>
                        </Box>

                        {analysis.hasBullets && (
                            <>
                                <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mx: 1.8 }} />
                                <Box sx={{ px: 1.8, py: 1.2 }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(226,232,240,0.35)", letterSpacing: 0.5, mb: 1 }}>
                                        POINTS CLÉS DÉTECTÉS
                                    </Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                                        {analysis.bullets.map((bullet, index) => (
                                            <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
                                                <Box sx={{
                                                    width: 5,
                                                    height: 5,
                                                    borderRadius: "50%",
                                                    bgcolor: "#38bdf8",
                                                    mt: 0.8,
                                                    flexShrink: 0,
                                                }} />
                                                <Typography sx={{ fontSize: 12, color: "#93c5fd", lineHeight: 1.6 }}>
                                                    {bullet}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </>
                        )}

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

                        <Box sx={{ px: 1.8, py: 1.2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(226,232,240,0.35)", letterSpacing: 0.5, mb: 0.4 }}>
                                ANALYSE QUALITÉ
                            </Typography>

                            {analysis.flags.map((flag, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    <FlagIcon type={flag.type} />
                                    <Typography sx={{
                                        fontSize: 12,
                                        color: flag.type === "good" ? "rgba(34,197,94,0.85)" :
                                            flag.type === "warning" ? "rgba(245,158,11,0.85)" :
                                                "rgba(239,68,68,0.85)",
                                    }}>
                                        {flag.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(147,181,218,0.04)", border: "1px solid rgba(147,181,218,0.1)" }}>
                            <InfoRow icon={<CategoryIcon sx={{ fontSize: 14 }} />} label="Catégorie" value={offer.category} />
                            <InfoRow icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />} label="Tarif" value={`${offer.price.toLocaleString("fr-FR")} MAD`} valueColor="#38bdf8" />
                        </Box>

                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(147,181,218,0.04)", border: "1px solid rgba(147,181,218,0.1)" }}>
                            <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} label="Créée le" value={formatDate(offer.createdAt)} />
                            <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} label="Mise à jour" value={formatDate(offer.updatedAt)} />
                        </Box>
                    </Box>

                    {(offer.status === "masquee" || offer.status === "en_attente_ajustement") && offer.maskReason && (
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: offer.status === "masquee" ? "rgba(239,68,68,0.06)" : "rgba(167,139,250,0.06)",
                            border: offer.status === "masquee" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(167,139,250,0.2)",
                        }}>
                            <Typography sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: offer.status === "masquee" ? "#ef4444" : "#a78bfa",
                                mb: 0.6,
                                letterSpacing: 0.5,
                            }}>
                                {offer.status === "masquee" ? "MOTIF DU REJET" : "AJUSTEMENTS DEMANDÉS"}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
                                {offer.maskReason}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5 }}>
                    {onEdit && offer.status !== "active" && (
                        <Box onClick={() => onEdit(offer)} sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.8,
                            py: 1,
                            borderRadius: 2,
                            border: "1px solid rgba(56,189,248,0.25)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: "rgba(56,189,248,0.08)" },
                        }}>
                            <EditIcon sx={{ fontSize: 15, color: "#38bdf8" }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#38bdf8" }}>
                                Demander ajustement
                            </Typography>
                        </Box>
                    )}

                    {onApprove && offer.status !== "active" && (
                        <Box onClick={() => onApprove(offer)} sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.8,
                            py: 1,
                            borderRadius: 2,
                            border: "1px solid rgba(34,197,94,0.25)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: "rgba(34,197,94,0.08)" },
                        }}>
                            <CheckCircleIcon sx={{ fontSize: 15, color: "#22c55e" }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>
                                Approuver
                            </Typography>
                        </Box>
                    )}

                    {onReject && offer.status !== "masquee" && (
                        <Box onClick={() => onReject(offer)} sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.8,
                            py: 1,
                            borderRadius: 2,
                            border: "1px solid rgba(239,68,68,0.25)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                        }}>
                            <VisibilityOffIcon sx={{ fontSize: 15, color: "#ef4444" }} />
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
                                Rejeter
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
