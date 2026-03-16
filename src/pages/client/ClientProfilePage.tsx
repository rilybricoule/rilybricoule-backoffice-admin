import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { clientsMock } from "../../Data/clientsMockData";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import EventIcon from "@mui/icons-material/Event";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { reservationsMock, reviewsMock } from "../../Data/ClientProfileMockData";

const statusLabels: Record<string, string> = {
    terminee: "Terminée",
    en_cours: "En cours",
    annulee: "Annulée",
    en_attente: "En attente",
};

export default function ClientProfilePage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("clients");

    const path = window.location.pathname;
    const clientId = path.startsWith("/clients/") ? path.replace("/clients/", "") : null;
    const client = clientsMock.find((c) => c.id === clientId);
    const reservations = reservationsMock.filter((r) => r.clientId === clientId);
    const reviews = reviewsMock.filter((r) => r.clientId === clientId);

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

    if (!client) {
        return (
            <Box sx={{ p: 3, color: "text.primary" }}>
                Client introuvable. <Button onClick={() => (window.location.href = "/clients")}>Retour à la liste</Button>
            </Box>
        );
    }

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
                }}
            >
                <Toolbar />
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => (window.location.href = "/clients")}
                    sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
                >
                    Retour à la liste
                </Button>

                <Card
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: "rgba(10, 37, 77, 0.6)",
                        border: "1px solid rgba(147, 181, 218, 0.2)",
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start" }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 28 }}>
                            {client.firstName[0]}
                            {client.lastName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 0.5 }}>
                                {client.firstName} {client.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {client.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {client.phone || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                                Inscrit le {new Date(client.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </Typography>
                            <Chip
                                icon={client.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                                label={client.isActive ? "Actif" : "Désactivé"}
                                color={client.isActive ? "success" : "default"}
                                size="small"
                                sx={{ mr: 1 }}
                            />
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button variant="outlined" startIcon={<EditIcon />} size="small" sx={{ textTransform: "none" }}>
                                Modifier
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<BlockIcon />}
                                size="small"
                                sx={{ textTransform: "none", color: "warning.main", borderColor: "warning.main" }}
                            >
                                {client.isActive ? "Désactiver" : "Activer"}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                                size="small"
                                sx={{ textTransform: "none", color: "error.main", borderColor: "error.main" }}
                            >
                                Supprimer
                            </Button>
                        </Box>
                    </Box>
                </Card>

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                    <Card
                        sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                            <EventIcon fontSize="small" /> Historique des réservations ({reservations.length})
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Service</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Date</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Statut</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }} align="right">Montant</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reservations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} sx={{ color: "text.secondary", textAlign: "center", py: 3 }}>
                                                Aucune réservation
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reservations.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>{r.serviceName}</TableCell>
                                                <TableCell>{new Date(r.date).toLocaleDateString("fr-FR")}</TableCell>
                                                <TableCell>
                                                    <Chip label={statusLabels[r.status]} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                                                </TableCell>
                                                <TableCell align="right">{r.amount} MAD</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>

                    <Card
                        sx={{
                            flex: 1,
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                            <RateReviewIcon fontSize="small" /> Avis laissés ({reviews.length})
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {reviews.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Aucun avis
                                </Typography>
                            ) : (
                                reviews.map((rev) => (
                                    <Paper
                                        key={rev.id}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            bgcolor: "rgba(0,0,0,0.2)",
                                            borderColor: "rgba(147, 181, 218, 0.15)",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} sx={{ fontSize: 16, color: i < rev.rating ? "warning.main" : "text.disabled" }} />
                                            ))}
                                            <Typography variant="caption" color="text.secondary">
                                                {rev.providerName} • {new Date(rev.date).toLocaleDateString("fr-FR")}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">{rev.comment}</Typography>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}