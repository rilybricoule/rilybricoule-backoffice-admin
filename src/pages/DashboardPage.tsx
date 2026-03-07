import { useState } from "react";
import { Box, Grid, Toolbar, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import OpenArtBg from "../assets/openart.png";
import {
    statsByPeriod,
    getChange,
    periodLabels,
    type Period,
} from "../Data/dashboardStats";
import PeopleIcon from "@mui/icons-material/People";
import EngineeringIcon from "@mui/icons-material/Engineering";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventIcon from "@mui/icons-material/Event";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StarIcon from "@mui/icons-material/Star";
import PeriodSelector from "./dashboard/PeriodSelector";
import StatCard from "./dashboard/StatCard";

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("dashboard");
    const [period, setPeriod] = useState<Period>("month");

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        window.location.href = "/";
    };
    const handleSelect = (id: string) => {
        setSelected(id);
        if (id === "dashboard") window.location.href = "/dashboard";
        if (id === "clients") window.location.href = "/clients";
        if (id === "providers" || id === "providers_pending" || id === "providers_approved" || id === "providers_suspended") {
            const status = id === "providers" ? "" : id.replace("providers_", "");
            window.location.href = status ? `/providers?status=${status}` : "/providers";
        }
    };
    const { current, previous } = statsByPeriod[period];
    const { comparisonLabel } = periodLabels[period];

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    minHeight: "100vh",
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transition: "all 0.2s ease",
                }}
            >
                <Toolbar />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                    <Box  sx={{
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        <Typography variant="h4" gutterBottom>
                            Dashboard Admin
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Indicateurs clés • {periodLabels[period].label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                            {new Date().toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontWeight: 700,
                                letterSpacing: 0.25,
                            }}
                        >
                            Choisir la période
                        </Typography>
                        <PeriodSelector value={period} onChange={setPeriod} />
                    </Box>
                </Box>

                <Grid container spacing={2}>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            label="Clients inscrits"
                            value={current.clientsCount.toLocaleString("fr-FR")}
                            subtitle="Total cumulé"
                            icon={<PeopleIcon fontSize="small" />}
                            change={getChange(current.clientsCount, previous.clientsCount)}
                            changeLabel={comparisonLabel}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            label="Prestataires inscrits"
                            value={current.providersCount.toLocaleString("fr-FR")}
                            subtitle="Professionnels actifs"
                            icon={<EngineeringIcon fontSize="small" />}
                            change={getChange(current.providersCount, previous.providersCount)}
                            changeLabel={comparisonLabel}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            label="Réservations en cours"
                            value={current.reservationsEnCours.toLocaleString("fr-FR")}
                            subtitle="En attente ou en cours"
                            icon={<EventAvailableIcon fontSize="small" />}
                            change={getChange(current.reservationsEnCours, previous.reservationsEnCours)}
                            changeLabel={comparisonLabel}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            label="Réservations terminées"
                            value={current.reservationsTerminees.toLocaleString("fr-FR")}
                            subtitle="Total réalisées"
                            icon={<EventIcon fontSize="small" />}
                            change={getChange(current.reservationsTerminees, previous.reservationsTerminees)}
                            changeLabel={comparisonLabel}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            label="Revenus"
                            value={`${current.revenusPeriod.toLocaleString("fr-FR")} MAD`}
                            subtitle="Sur la période"
                            icon={<AttachMoneyIcon fontSize="small" />}
                            change={getChange(current.revenusPeriod, previous.revenusPeriod)}
                            changeLabel={comparisonLabel}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard
                            label="Satisfaction moyenne"
                            value={`${current.satisfactionMoyenne} / 5`}
                            subtitle="Note globale"
                            icon={<StarIcon fontSize="small" />}
                            change={getChange(current.satisfactionMoyenne * 100, previous.satisfactionMoyenne * 100)}
                            changeLabel={comparisonLabel}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}