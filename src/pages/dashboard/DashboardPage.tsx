import { useState, useEffect } from "react";
import { Box, Grid, Typography, Tabs, Tab, Alert } from "@mui/material";
import AdminLayout from "../../components/AdminLayout";
import PeopleIcon from "@mui/icons-material/People";
import EngineeringIcon from "@mui/icons-material/Engineering";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PublicIcon from "@mui/icons-material/Public";

import {
    getDashboardOverview,
    getDashboardPerformance,
    getDashboardTrends,
    getDashboardExtraKpis,
    type DashboardOverview,
    type DashboardPerformance,
    type DashboardTrends,
    type DashboardExtraKpi, getDashboardQualityTrends, type DashboardQualityTrends,
} from "../../api/dashboard.ts";

import StatCard from "./StatCard";
import MiniCalendar from "./Minicalendar";
import PaymentStatusCard from "./Paymentsstatuscard";

import { useNavigate } from "react-router-dom";
import type { Reservation } from "../../Data/Reservation";

function formatMAD(value: number) {
    return `${Number(value || 0).toLocaleString("fr-FR")} MAD`;
}

type PeriodStat = {
    label: "Semaine" | "Mois" | "Année";
    current: number;
    previous: number;
    elapsed: number;
    total: number;
    unit?: string;
    compareLabel?: string;
};



function renderRankingBars(
    items: { name: string; count: number }[],
    emptyLabel: string
) {
    if (!items.length) {
        return <Typography variant="caption" color="text.secondary">{emptyLabel}</Typography>;
    }

    const max = Math.max(...items.map((i) => i.count), 1);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            {items.map((item) => (
                <Box key={item.name}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                        <Typography variant="caption" fontWeight={700}>{item.name}</Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.light">
                            {item.count}
                        </Typography>
                    </Box>
                    <Box sx={{ height: 5, borderRadius: 999, bgcolor: "rgba(147,181,218,0.12)", overflow: "hidden" }}>
                        <Box
                            sx={{
                                height: "100%",
                                borderRadius: 999,
                                bgcolor: "primary.light",
                                width: `${Math.max(8, Math.round((item.count / max) * 100))}%`,
                                opacity: 0.9,
                            }}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function getChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

function renderPeriodRow(p: PeriodStat) {
    const change = getChange(p.current, p.previous);

    return (
        <Box key={p.label}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {p.label} ({p.elapsed}/{p.total})
                </Typography>
                <Typography variant="caption" fontWeight={700} color="primary.light">
                    {p.current.toLocaleString("fr-FR")}
                    {p.unit ?? ""}
                </Typography>
            </Box>

            <Box sx={{ height: 4, borderRadius: 999, bgcolor: "rgba(147,181,218,0.12)", overflow: "hidden", mb: 0.5 }}>
                <Box
                    sx={{
                        height: "100%",
                        borderRadius: 999,
                        bgcolor: "primary.light",
                        width: `${Math.round((p.elapsed / p.total) * 100)}%`,
                        opacity: 0.8,
                    }}
                />
            </Box>

            <Typography variant="caption" sx={{ color: change >= 0 ? "success.main" : "error.main", fontWeight: 700 }}>
                {change >= 0 ? "+" : ""}
                {change}% {p.compareLabel ?? "vs même jour période précédente"}
            </Typography>
        </Box>
    );
}

function renderStatsBlock(rows: PeriodStat[]) {
    return <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>{rows.map(renderPeriodRow)}</Box>;
}

export default function DashboardPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0);
    const [_selectedDayRes, setSelectedDayRes] = useState<Reservation[] | null>(null);
    const [_selectedDayLabel, setSelectedDayLabel] = useState("");

    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [performance, setPerformance] = useState<DashboardPerformance | null>(null);
    const [trends, setTrends] = useState<DashboardTrends | null>(null);
    const [extraKpis, setExtraKpis] = useState<DashboardExtraKpi | null>(null);

    const [loadingKpi, setLoadingKpi] = useState(true);
    const [kpiError, setKpiError] = useState("");

    const [qualityTrends, setQualityTrends] = useState<DashboardQualityTrends | null>(null);


    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const daysInYear = now.getFullYear() % 4 === 0 ? 366 : 365;

    const handleDayClick = (date: string, res: Reservation[]) => {
        setSelectedDayLabel(
            new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
            })
        );
        setSelectedDayRes(res);
    };

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoadingKpi(true);
                setKpiError("");

                const [ovRes, perfRes, trRes, extraRes,qualityRes] = await Promise.allSettled([
                    getDashboardOverview(),
                    getDashboardPerformance(),
                    getDashboardTrends(),
                    getDashboardExtraKpis(),
                    getDashboardQualityTrends(),

                ]);

                if (!mounted) return;

                if (ovRes.status === "fulfilled") setOverview(ovRes.value);
                if (perfRes.status === "fulfilled") setPerformance(perfRes.value);
                if (trRes.status === "fulfilled") setTrends(trRes.value);
                if (extraRes.status === "fulfilled") setExtraKpis(extraRes.value);
                if (qualityRes.status === "fulfilled") setQualityTrends(qualityRes.value);


                if (ovRes.status === "rejected") {
                    setKpiError("Erreur chargement dashboard.");
                }

            } catch (e: any) {
                if (mounted) setKpiError(e?.response?.data?.message || "Erreur chargement dashboard");
            } finally {
                if (mounted) setLoadingKpi(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);
    const totalProviders = overview?.totalProviders ?? 0;
    const pendingProviders = overview?.pendingProviders ?? 0;
    const verifiedProviders = Math.max(totalProviders - pendingProviders, 0);
    const validationRate = totalProviders > 0 ? (verifiedProviders / totalProviders) * 100 : 0;


    const clientsExpandContent = renderStatsBlock([
        { label: "Semaine", current: trends?.clientsWeekCurrent ?? 0, previous: trends?.clientsWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: trends?.clientsMonthCurrent ?? 0, previous: trends?.clientsMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: trends?.clientsYearCurrent ?? 0, previous: trends?.clientsYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);

    const providersExpandContent = renderStatsBlock([
        { label: "Semaine", current: trends?.providersWeekCurrent ?? 0, previous: trends?.providersWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: trends?.providersMonthCurrent ?? 0, previous: trends?.providersMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: trends?.providersYearCurrent ?? 0, previous: trends?.providersYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);

    const reservationsExpandContent = renderStatsBlock([
        { label: "Semaine", current: trends?.reservationsWeekCurrent ?? 0, previous: trends?.reservationsWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: trends?.reservationsMonthCurrent ?? 0, previous: trends?.reservationsMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: trends?.reservationsYearCurrent ?? 0, previous: trends?.reservationsYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);

    const revenueExpandContent = renderStatsBlock([
        { label: "Semaine", current: trends?.revenueWeekCurrent ?? 0, previous: trends?.revenueWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7, unit: " MAD" },
        { label: "Mois", current: trends?.revenueMonthCurrent ?? 0, previous: trends?.revenueMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth, unit: " MAD" },
        { label: "Année", current: trends?.revenueYearCurrent ?? 0, previous: trends?.revenueYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear, unit: " MAD" },
    ]);

    const verifiedExpandContent = renderStatsBlock([
        { label: "Semaine", current: qualityTrends?.verifiedWeekCurrent ?? 0, previous: qualityTrends?.verifiedWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: qualityTrends?.verifiedMonthCurrent ?? 0, previous: qualityTrends?.verifiedMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: qualityTrends?.verifiedYearCurrent ?? 0, previous: qualityTrends?.verifiedYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);

    const pendingExpandContent = renderStatsBlock([
        { label: "Semaine", current: qualityTrends?.pendingWeekCurrent ?? 0, previous: qualityTrends?.pendingWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: qualityTrends?.pendingMonthCurrent ?? 0, previous: qualityTrends?.pendingMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: qualityTrends?.pendingYearCurrent ?? 0, previous: qualityTrends?.pendingYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);





    const providerBars = [...(performance?.providerRanking ?? [])].sort((a, b) => b.count - a.count);
    const zoneBars = [...(performance?.zoneRanking ?? [])].sort((a, b) => b.count - a.count);




    const topProviderExpandContent = renderRankingBars(providerBars, "Aucun prestataire");
    const topZoneExpandContent = renderRankingBars(zoneBars, "Aucune zone");



    const completedExpandContent = renderStatsBlock([
        { label: "Semaine", current: performance?.completedWeekCurrent ?? 0, previous: performance?.completedWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: performance?.completedMonthCurrent ?? 0, previous: performance?.completedMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: performance?.completedYearCurrent ?? 0, previous: performance?.completedYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);

    const completionRateExpandContent = renderStatsBlock([
        { label: "Semaine", current: performance?.completionRateWeekCurrent ?? 0, previous: performance?.completionRateWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7, unit: "%" },
        { label: "Mois", current: performance?.completionRateMonthCurrent ?? 0, previous: performance?.completionRateMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth, unit: "%" },
        { label: "Année", current: performance?.completionRateYearCurrent ?? 0, previous: performance?.completionRateYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear, unit: "%" },
    ]);

    const avgRevenueExpandContent = renderStatsBlock([
        { label: "Semaine", current: performance?.avgRevenueWeekCurrent ?? 0, previous: performance?.avgRevenueWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7, unit: " MAD" },
        { label: "Mois", current: performance?.avgRevenueMonthCurrent ?? 0, previous: performance?.avgRevenueMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth, unit: " MAD" },
        { label: "Année", current: performance?.avgRevenueYearCurrent ?? 0, previous: performance?.avgRevenueYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear, unit: " MAD" },
    ]);

    const activeReservationsExpandContent = renderStatsBlock([
        { label: "Semaine", current: extraKpis?.activeReservationsWeekCurrent ?? 0, previous: extraKpis?.activeReservationsWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7 },
        { label: "Mois", current: extraKpis?.activeReservationsMonthCurrent ?? 0, previous: extraKpis?.activeReservationsMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth },
        { label: "Année", current: extraKpis?.activeReservationsYearCurrent ?? 0, previous: extraKpis?.activeReservationsYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear },
    ]);

    const cancellationExpandContent = renderStatsBlock([
        { label: "Semaine", current: extraKpis?.cancellationRateWeekCurrent ?? 0, previous: extraKpis?.cancellationRateWeekPrevious ?? 0, elapsed: dayOfWeek, total: 7, unit: "%" },
        { label: "Mois", current: extraKpis?.cancellationRateMonthCurrent ?? 0, previous: extraKpis?.cancellationRateMonthPrevious ?? 0, elapsed: dayOfMonth, total: daysInMonth, unit: "%" },
        { label: "Année", current: extraKpis?.cancellationRateYearCurrent ?? 0, previous: extraKpis?.cancellationRateYearPrevious ?? 0, elapsed: dayOfYear, total: daysInYear, unit: "%" },
    ]);


    const paymentFailureExpandContent = renderStatsBlock([
        {
            label: "Semaine",
            current: extraKpis?.paymentFailureRateWeekCurrent ?? 0,
            previous: extraKpis?.paymentFailureRateWeekPrevious ?? 0,
            elapsed: dayOfWeek,
            total: 7,
            unit: "%",
        },
        {
            label: "Mois",
            current: extraKpis?.paymentFailureRateMonthCurrent ?? 0,
            previous: extraKpis?.paymentFailureRateMonthPrevious ?? 0,
            elapsed: dayOfMonth,
            total: daysInMonth,
            unit: "%",
        },
        {
            label: "Année",
            current: extraKpis?.paymentFailureRateYearCurrent ?? 0,
            previous: extraKpis?.paymentFailureRateYearPrevious ?? 0,
            elapsed: dayOfYear,
            total: daysInYear,
            unit: "%",
        },
    ]);





    const cardsConfig = [
        {
            label: "Clients inscrits",
            value: (overview?.totalClients ?? 0).toLocaleString("fr-FR"),
            subtitle: "Total cumulé",
            icon: <PeopleIcon fontSize="small" />,
            accentColor: "blue" as const,
            expandContent: clientsExpandContent,
        },
        {
            label: "Prestataires inscrits",
            value: (overview?.totalProviders ?? 0).toLocaleString("fr-FR"),
            subtitle: `${(overview?.pendingProviders ?? 0).toLocaleString("fr-FR")} en attente`,
            icon: <EngineeringIcon fontSize="small" />,
            onClick: () => navigate("/providers"),
            accentColor: "purple" as const,
            expandContent: providersExpandContent,
        },
        {
            label: "Réservations en cours",
            value: (overview?.activeReservations ?? 0).toLocaleString("fr-FR"),
            subtitle: "Temps réel (statut actif)",
            icon: <EventAvailableIcon fontSize="small" />,
            onClick: () => navigate("/reservations"),
            live: true,
            accentColor: "green" as const,
            expandContent: activeReservationsExpandContent,
        },
        {
            label: "Terminées aujourd'hui",
            value: (overview?.completedReservationsToday ?? 0).toLocaleString("fr-FR"),
            subtitle: "Exécution du jour",
            icon: <EventAvailableIcon fontSize="small" />,
            accentColor: "teal" as const,
            expandContent: completedExpandContent,
        },
        {
            label: "Revenus du mois",
            value: formatMAD(overview?.monthlyRevenue ?? 0),
            subtitle: "Paiements SUCCESS",
            icon: <AttachMoneyIcon fontSize="small" />,
            onClick: () => navigate("/payments"),
            accentColor: "amber" as const,
            expandContent: revenueExpandContent,
        },
        {
            label: "Taux d'annulation",
            value: `${(extraKpis?.cancellationRate ?? 0).toFixed(1)}%`,
            subtitle: "Réservations annulées / total",
            icon: <EventAvailableIcon fontSize="small" />,
            accentColor: "amber" as const,
            expandContent:  cancellationExpandContent,
        },
        {
            label: "Taux d'échec paiement",
            value: `${(extraKpis?.paymentFailureRate ?? 0).toFixed(1)}%`,
            subtitle: "Paiements FAILED / total",
            icon: <AttachMoneyIcon fontSize="small" />,
            accentColor: "teal" as const,
            expandContent: paymentFailureExpandContent
        ,
        },
        {
            label: "Taux de complétion",
            value: `${(performance?.completionRate ?? 0).toFixed(1)}%`,
            subtitle: "Réservations terminées / total",
            icon: <TrendingUpIcon fontSize="small" />,
            accentColor: "teal" as const,
            expandContent: completionRateExpandContent,
        },
        {
            label: "Revenu moyen / mission",
            value: formatMAD(performance?.avgRevenuePerCompleted ?? 0),
            subtitle: "Moyenne des missions terminées",
            icon: <AttachMoneyIcon fontSize="small" />,
            accentColor: "amber" as const,
            expandContent: avgRevenueExpandContent,
        },
        {
            label: "Top prestataire",
            value: performance?.topProviderName ?? "Aucun",
            subtitle: `${performance?.topProviderCompletedCount ?? 0} missions terminées`,
            icon: <EngineeringIcon fontSize="small" />,
            accentColor: "purple" as const,
            expandContent: topProviderExpandContent,
        },
        {
            label: "Top zone",
            value: performance?.topZoneName ?? "Aucune",
            subtitle: `${performance?.topZoneCompletedCount ?? 0} missions terminées`,
            icon: <PublicIcon fontSize="small" />,
            accentColor: "blue" as const,
            expandContent: topZoneExpandContent,
        },
    ];

    const overviewCards = cardsConfig.filter((c) =>
        ["Clients inscrits", "Prestataires inscrits", "Réservations en cours", "Terminées aujourd'hui", "Revenus du mois"].includes(c.label)
    );

    const growthCards = cardsConfig.filter((c) =>
        ["Clients inscrits", "Prestataires inscrits"].includes(c.label)
    );

    const activityCards = cardsConfig.filter((c) =>
        ["Réservations en cours", "Taux d'annulation"].includes(c.label)
    );

    const businessCards = cardsConfig.filter((c) =>
        ["Revenus du mois", "Taux d'échec paiement"].includes(c.label)
    );

    const qualityCards = [
        {
            label: "Taux de validation",
            value: `${validationRate.toFixed(1)}%`,
            subtitle: `${verifiedProviders} validés / ${totalProviders} total`,
            icon: <EngineeringIcon fontSize="small" />,
            accentColor: "teal" as const,
            expandContent: verifiedExpandContent,
        },
        {
            label: "En attente de validation",
            value: (overview?.pendingProviders ?? 0).toLocaleString("fr-FR"),
            subtitle: "Stock actuel à traiter",
            icon: <PeopleIcon fontSize="small" />,
            onClick: () => navigate("/providers"),
            accentColor: "amber" as const,
            expandContent:pendingExpandContent ,
        },
    ];

    const performanceCards = cardsConfig.filter((c) =>
        ["Taux de complétion", "Revenu moyen / mission", "Top prestataire", "Top zone", "Terminées aujourd'hui"].includes(c.label)
    );

    const tabContent = [overviewCards, growthCards, activityCards, businessCards, qualityCards, performanceCards];

    return (
        <AdminLayout selected="dashboard">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            background: "linear-gradient(90deg,#f8fafc,#93c5fd)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Dashboard Admin
                    </Typography>

                    <Box sx={{ mt: 1.5, mb: 2.5 }}>
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 0.5, borderRadius: 20, bgcolor: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.35)" }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", letterSpacing: 1 }}>
                                INDICATEURS CLÉS
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            sx={{
                                minHeight: 40,
                                borderBottom: "1px solid rgba(56,189,248,0.25)",
                                "& .MuiTabs-indicator": { height: 3, borderRadius: 3, backgroundColor: "#38bdf8" },
                            }}
                        >
                            {["Aperçu", "Croissance", "Activité", "Finances", "Qualité", "Performance"].map((label) => (
                                <Tab
                                    key={label}
                                    label={label}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        fontSize: 13,
                                        px: 2.2,
                                        minHeight: 40,
                                        color: "rgba(226,232,240,0.75)",
                                        "&.Mui-selected": {
                                            color: "#38bdf8",
                                            bgcolor: "rgba(56,189,248,0.10)",
                                            borderTopLeftRadius: 8,
                                            borderTopRightRadius: 8,
                                        },
                                    }}
                                />
                            ))}
                        </Tabs>
                    </Box>
                </Box>

                <MiniCalendar onDayClick={handleDayClick} />
            </Box>

            {kpiError && (
                <Box sx={{ mb: 2 }}>
                    <Alert severity="error">{kpiError}</Alert>
                </Box>
            )}

            <Grid container spacing={2}>
                {(loadingKpi ? [] : tabContent[activeTab]).map((card) => (

                    <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard {...card} />
                    </Grid>
                ))}

                {loadingKpi && (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="info">Chargement des KPI dashboard...</Alert>
                    </Grid>
                )}

                {activeTab === 3 && !loadingKpi && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <PaymentStatusCard />
                    </Grid>
                )}
            </Grid>
        </AdminLayout>
    );
}
