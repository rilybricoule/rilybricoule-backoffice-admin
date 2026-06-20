import {Box, Card, CardContent, Collapse, Typography} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {useState} from "react";


interface StatCardProps {
    label: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    change?: number;
    changeLabel?: string;
    onClick?: () => void;
    expandContent?: React.ReactNode;
    live?: boolean;
    accentColor?: string;
    updatedLabel?: string;
}

const colorMap = {
    blue: {
        gradient: "linear-gradient(135deg, #1a2f4e 0%, #1e3a5f 40%, #243b6a 70%, #1a3358 100%)",
        glow: "radial-gradient(ellipse at 70% 20%, rgba(82,145,220,0.25) 0%, transparent 65%)",
        iconBg: "linear-gradient(145deg, #4a90d9 0%, #2d6fc4 50%, #1a52a8 100%)",
        iconShadow: "0 4px 20px rgba(56,140,250,0.55), 0 2px 8px rgba(30,80,180,0.4)",
        iconHighlight: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
        border: "rgba(82,145,220,0.25)",
        accentBlur: "rgba(60,130,240,0.18)",
    },
    green: {
        gradient: "linear-gradient(135deg, #122f20 0%, #173d28 40%, #1c4a30 70%, #133525 100%)",
        glow: "radial-gradient(ellipse at 70% 20%, rgba(74,222,128,0.2) 0%, transparent 65%)",
        iconBg: "linear-gradient(145deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)",
        iconShadow: "0 4px 20px rgba(74,222,128,0.5), 0 2px 8px rgba(22,163,74,0.35)",
        iconHighlight: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
        border: "rgba(74,222,128,0.2)",
        accentBlur: "rgba(74,222,128,0.15)",
    },
    amber: {
        gradient: "linear-gradient(135deg, #2e1f05 0%, #3d2a08 40%, #4a340a 70%, #351f06 100%)",
        glow: "radial-gradient(ellipse at 70% 20%, rgba(251,191,36,0.2) 0%, transparent 65%)",
        iconBg: "linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
        iconShadow: "0 4px 20px rgba(251,191,36,0.5), 0 2px 8px rgba(217,119,6,0.35)",
        iconHighlight: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
        border: "rgba(251,191,36,0.2)",
        accentBlur: "rgba(251,191,36,0.15)",
    },
    purple: {
        gradient: "linear-gradient(135deg, #1e1030 0%, #261540 40%, #2d1a50 70%, #201238 100%)",
        glow: "radial-gradient(ellipse at 70% 20%, rgba(167,139,250,0.22) 0%, transparent 65%)",
        iconBg: "linear-gradient(145deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
        iconShadow: "0 4px 20px rgba(167,139,250,0.5), 0 2px 8px rgba(109,40,217,0.35)",
        iconHighlight: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
        border: "rgba(167,139,250,0.2)",
        accentBlur: "rgba(167,139,250,0.15)",
    },
    teal: {
        gradient: "linear-gradient(135deg, #082d2d 0%, #0d3b3b 40%, #114545 70%, #0a3232 100%)",
        glow: "radial-gradient(ellipse at 70% 20%, rgba(45,212,191,0.22) 0%, transparent 65%)",
        iconBg: "linear-gradient(145deg, #2dd4bf 0%, #0d9488 50%, #0f766e 100%)",
        iconShadow: "0 4px 20px rgba(45,212,191,0.5), 0 2px 8px rgba(15,118,110,0.35)",
        iconHighlight: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
        border: "rgba(45,212,191,0.2)",
        accentBlur: "rgba(45,212,191,0.15)",
    },
} as const;

type AccentKey = keyof typeof colorMap;

export default function StatCard({
                                     label, value, subtitle, change, icon,
                                     changeLabel, onClick, expandContent, live, accentColor, updatedLabel,
                                 }: StatCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isPositive = (change ?? 0) >= 0;
    const clickable = Boolean(onClick);

    const resolvedKey: AccentKey =
        accentColor && accentColor in colorMap
            ? (accentColor as AccentKey)
            : "blue";

    const scheme = colorMap[resolvedKey];


    const resolvedExpandContent = expandContent ?? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
            <Typography variant="caption" color="text.secondary">
                Aucune statistique détaillée disponible.
            </Typography>
        </Box>
    );





    return (
        <Card sx={{
            position: "relative",
            overflow: "hidden",
            background: scheme.gradient,
            backdropFilter: "blur(20px)",
            border: `1px solid ${scheme.border}`,
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            minWidth: 300,
            "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${scheme.border}`,
            }
        }}>

            {/* Radial glow overlay */}
            <Box sx={{
                position: "absolute",
                inset: 0,
                background: scheme.glow,
                pointerEvents: "none",
            }}/>

            {/* Subtle noise/grain texture overlay */}
            <Box sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "150px",
                pointerEvents: "none",
            }}/>

            {/* Frosted glass shine on top edge */}
            <Box sx={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                pointerEvents: "none",
            }}/>

            <CardContent sx={{p: "22px 22px 18px", "&:last-child": {pb: "18px"}, position: "relative"}}>

                {/* ── Header row: label + icon ── */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 0.15,
                    cursor: clickable ? "pointer" : "default",
                }}
                     onClick={clickable ? onClick : undefined}
                >
                    <Typography sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "rgba(180,205,235,0.65)",
                        mt: 1,
                    }}>
                        {label}
                    </Typography>

                    {/* 3D Glossy icon button */}
                    <Box sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "14px",
                        background: scheme.iconBg,
                        boxShadow: `${scheme.iconShadow}, ${scheme.iconHighlight}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.95)",
                        flexShrink: 0,
                        "& svg": { fontSize: 26 },
                    }}>
                        {icon}
                    </Box>
                </Box>

                {/* ── Value block ── */}
                <Box
                    onClick={clickable ? onClick : undefined}
                    sx={{cursor: clickable ? "pointer" : "default", mb: 1.5}}
                >
                    <Typography sx={{
                        fontSize: 38,
                        fontWeight: 600,   // more reliable than 800
                        letterSpacing: -0.3,
                        lineHeight: 1.05,

                        color: "#f1f5f9",
                        textShadow:"none",
                        fontVariantNumeric: "tabular-nums",

                        mb: 0.2
                    }}>
                        {value}
                    </Typography>
                    <Typography sx={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: "rgba(180,210,245,0.55)",
                        letterSpacing: 0.2,
                    }}>
                        {subtitle}
                    </Typography>
                </Box>

                {/* ── Divider ── */}
                <Box sx={{
                    height: "1px",
                    background: "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04), transparent)",
                    mb: 1.6,
                }}/>

                {/* ── Footer row ── */}
                <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    {resolvedExpandContent ?  (
                        <Box
                            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                            sx={{
                                display: "flex", alignItems: "center", gap: 0.8,
                                cursor: "pointer",
                                "&:hover .expand-label": {color: "rgba(180,210,255,0.9)"},
                                "&:hover .expand-icon": {color: "rgba(180,210,255,0.9)"},
                                "&:hover .chart-icon": {color: "rgba(180,210,255,0.9)"},
                            }}
                        >
                            <ExpandMoreIcon
                                className="expand-icon"
                                sx={{
                                    fontSize: 15,
                                    color: "rgba(148,163,184,0.55)",
                                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.22s ease",
                                }}
                            />
                            <Typography className="expand-label" sx={{
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 1.8,
                                textTransform: "uppercase",
                                color: "rgba(148,163,184,0.55)",
                                transition: "color 0.15s ease",
                            }}>
                                Statistiques
                            </Typography>
                            <ShowChartIcon className="chart-icon" sx={{
                                fontSize: 16,
                                color: "rgba(148,163,184,0.45)",
                                ml: 0.3,
                                transition: "color 0.15s ease",
                            }}/>
                        </Box>
                    ) : change !== undefined ? (
                        <Box sx={{display: "flex", alignItems: "center", gap: 0.6}}>
                            {isPositive
                                ? <TrendingUpIcon sx={{fontSize: 15, color: "#4ade80"}}/>
                                : <TrendingDownIcon sx={{fontSize: 15, color: "#f87171"}}/>
                            }
                            <Typography sx={{
                                fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
                                color: isPositive ? "#4ade80" : "#f87171",
                            }}>
                                {isPositive ? "+" : ""}{change.toFixed(0)}%
                                {changeLabel && ` ${changeLabel}`}
                            </Typography>
                        </Box>
                    ) : live ? (
                        <Box sx={{display: "flex", alignItems: "center", gap: 0.8}}>
                            <Box sx={{position: "relative", width: 8, height: 8, flexShrink: 0}}>
                                <Box sx={{
                                    position: "absolute", inset: 0, borderRadius: "50%",
                                    bgcolor: "#4ade80", opacity: 0.4,
                                    animation: "livepulse 1.6s ease-out infinite",
                                    "@keyframes livepulse": {
                                        "0%": {transform: "scale(1)", opacity: 0.4},
                                        "70%": {transform: "scale(2.4)", opacity: 0},
                                        "100%": {transform: "scale(2.4)", opacity: 0},
                                    },
                                }}/>
                                <Box sx={{
                                    position: "absolute", inset: "1px",
                                    borderRadius: "50%", bgcolor: "#4ade80",
                                    boxShadow: "0 0 6px rgba(74,222,128,0.85)",
                                }}/>
                            </Box>
                            <Typography sx={{fontSize: 11, fontWeight: 600, color: "#86efac"}}>
                                En temps réel
                            </Typography>
                        </Box>
                    ) : <Box />}

                    {/* Updated timestamp — bottom right */}
                    {updatedLabel && (
                        <Typography sx={{
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: 1.2,
                            textTransform: "uppercase",
                            color: "rgba(148,163,184,0.3)",
                        }}>
                            Updated: {updatedLabel}
                        </Typography>
                    )}
                </Box>

                {/* ── Expanded content ── */}
                {resolvedExpandContent && (
                    <Collapse in={expanded} timeout="auto">
                        <Box sx={{ mt: 1.6, pt: 1.4, borderTop: "1px solid rgba(147,181,218,0.1)" }}>
                            {resolvedExpandContent}
                        </Box>
                    </Collapse>
                )}


            </CardContent>
        </Card>
    );
}