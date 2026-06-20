import { useState, useMemo } from "react";
import { Box, Collapse, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon   from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon  from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useReservations, type Reservation } from "../context/Reservationcontext";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface Props {
    onDayClick: (date: string, reservations: Reservation[]) => void;
}

export default function MiniCalendar({ onDayClick }: Props) {
    const { reservations } = useReservations();
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [expanded, setExpanded] = useState(false);

    const year        = viewDate.getFullYear();
    const month       = viewDate.getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay + 6) % 7;

    const cells: (number | null)[] = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const resByDay = useMemo(() => {
        const map: Record<string, Reservation[]> = {};
        reservations.forEach((r) => {
            if (!map[r.scheduledDate]) map[r.scheduledDate] = [];
            map[r.scheduledDate].push(r);
        });
        return map;
    }, [reservations]);

    const todayKey  = today.toISOString().split("T")[0];
    const formatKey = (day: number) =>
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const monthTotal = useMemo(() => {
        const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
        return Object.entries(resByDay)
            .filter(([k]) => k.startsWith(prefix))
            .reduce((sum, [, v]) => sum + v.length, 0);
    }, [resByDay, year, month]);

    const dayName   = today.toLocaleDateString("fr-FR", { weekday: "long" });
    const dayNum    = today.getDate();
    const monthName = MONTHS[today.getMonth()];
    const yearNum   = today.getFullYear();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0, alignSelf: "flex-start" }}>

            {/* ── Collapsed pill: full date + toggle ── */}
            <Box
                onClick={() => setExpanded((v) => !v)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    borderRadius: expanded ? "12px 12px 0 0" : "12px",
                    bgcolor: "rgba(10,37,77,0.6)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    borderBottom: expanded ? "1px solid rgba(147,181,218,0.08)" : "1px solid rgba(147,181,218,0.2)",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: "rgba(10,37,77,0.75)", borderColor: "rgba(147,181,218,0.35)" },
                    minWidth: 260,
                }}
            >
                {/* Icon with accent glow */}
                <Box sx={{
                    width: 36, height: 36,
                    borderRadius: "10px",
                    bgcolor: "rgba(47,124,201,0.15)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: "primary.light" }} />
                </Box>

                {/* Date text */}
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "rgba(148,163,184,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        lineHeight: 1,
                        mb: 0.35,
                    }}>
                        {dayName}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                        <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                            {dayNum}
                        </Typography>
                        <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "primary.light", lineHeight: 1 }}>
                            {monthName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 400, color: "rgba(148,163,184,0.55)", lineHeight: 1 }}>
                            {yearNum}
                        </Typography>
                    </Box>
                </Box>

                {/* Right side: badge + chevron */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {monthTotal > 0 && (
                        <Box sx={{
                            px: 0.9, py: 0.25,
                            bgcolor: "rgba(47,124,201,0.18)",
                            border: "1px solid rgba(147,181,218,0.25)",
                            borderRadius: "20px",
                        }}>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "primary.light", lineHeight: 1.5 }}>
                                {monthTotal}
                            </Typography>
                        </Box>
                    )}
                    <Box sx={{
                        width: 20, height: 20,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "rgba(148,163,184,0.5)",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                    }}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </Box>
                </Box>
            </Box>

            {/* ── Expanded panel ── */}
            <Collapse in={expanded} timeout={250}>
                <Box sx={{
                    bgcolor: "rgba(10,37,77,0.6)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    borderTop: "none",
                    borderRadius: "0 0 12px 12px",
                    px: 1.75,
                    pb: 1.5,
                    pt: 1,
                }}>
                    {/* Month nav */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => setViewDate(new Date(year, month - 1, 1))}
                            sx={{ color: "rgba(148,163,184,0.55)", p: 0.4, borderRadius: "7px",
                                "&:hover": { color: "primary.light", bgcolor: "rgba(47,124,201,0.12)" } }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: 16 }} />
                        </IconButton>

                        <Typography sx={{
                            fontSize: "0.75rem", fontWeight: 700,
                            color: "rgba(148,163,184,0.8)",
                            letterSpacing: "0.05em",
                        }}>
                            {MONTHS[month]} {year}
                        </Typography>

                        <IconButton
                            size="small"
                            onClick={() => setViewDate(new Date(year, month + 1, 1))}
                            sx={{ color: "rgba(148,163,184,0.55)", p: 0.4, borderRadius: "7px",
                                "&:hover": { color: "primary.light", bgcolor: "rgba(47,124,201,0.12)" } }}
                        >
                            <ChevronRightIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    {/* Thin divider */}
                    <Box sx={{ height: "1px", bgcolor: "rgba(147,181,218,0.1)", mb: 1 }} />

                    {/* Day headers */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
                        {DAYS.map((d) => (
                            <Typography key={d} sx={{
                                textAlign: "center",
                                fontSize: "0.56rem",
                                fontWeight: 600,
                                letterSpacing: "0.07em",
                                color: "rgba(148,163,184,0.4)",
                                textTransform: "uppercase",
                            }}>
                                {d}
                            </Typography>
                        ))}
                    </Box>

                    {/* Day cells */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                        {cells.map((day, i) => {
                            if (!day) return <Box key={i} />;
                            const key     = formatKey(day);
                            const count   = resByDay[key]?.length ?? 0;
                            const isToday = key === todayKey;
                            const hasRes  = count > 0;

                            return (
                                <Box
                                    key={i}
                                    onClick={() => hasRes && onDayClick(key, resByDay[key])}
                                    sx={{
                                        aspectRatio: "1",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center",
                                        borderRadius: "7px",
                                        cursor: hasRes ? "pointer" : "default",
                                        bgcolor: isToday ? "rgba(47,124,201,0.22)" : "transparent",
                                        border: isToday
                                            ? "1px solid rgba(147,181,218,0.4)"
                                            : "1px solid transparent",
                                        "&:hover": hasRes
                                            ? { bgcolor: "rgba(147,181,218,0.1)", borderColor: "rgba(147,181,218,0.25)" }
                                            : {},
                                        transition: "all 0.12s ease",
                                    }}
                                >
                                    <Typography sx={{
                                        fontSize: "0.67rem",
                                        fontWeight: isToday ? 700 : 400,
                                        lineHeight: 1,
                                        color: isToday
                                            ? "primary.light"
                                            : hasRes ? "#e2e8f0" : "rgba(148,163,184,0.55)",
                                    }}>
                                        {day}
                                    </Typography>
                                    {hasRes && (
                                        <Box sx={{ mt: "2px", display: "flex", gap: "2px" }}>
                                            {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                                                <Box key={di} sx={{
                                                    width: 3, height: 3, borderRadius: "50%",
                                                    bgcolor: isToday ? "primary.light" : "rgba(99,179,237,0.8)",
                                                }} />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
}