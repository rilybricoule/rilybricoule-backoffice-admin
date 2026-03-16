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
import { providersMock } from "../../Data/ProvidersMockData";
import { providerReviewsMock, providerServicesMock } from "../../Data/ProviderProfileMockData";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import StarIcon from "@mui/icons-material/Star";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VerifiedIcon from "@mui/icons-material/Verified";
import type { Provider, ProviderStatus } from "../../Data/Provider";

const statusConfig: Record<ProviderStatus, { label: string; color: "success" | "warning" | "error" | "default" }> = {
    pending: { label: "En attente de validation", color: "warning" },
    approved: { label: "Approuvé", color: "success" },
    suspended: { label: "Suspendu", color: "error" },
    rejected: { label: "Rejeté", color: "default" },
};

const documentTypeLabels: Record<string, string> = {
    id_card: "Carte d'identité",
    professional_certificate: "Certificat professionnel",
    insurance: "Assurance RC Pro",
    other: "Autre document",
};

export default function ProviderProfilePage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("providers");

    const path = window.location.pathname;
    const providerId = path.startsWith("/providers/") ? path.replace("/providers/", "") : null;
    const provider = providersMock.find((p) => p.id === providerId);
    const reviews = providerReviewsMock.filter((r) => r.providerId === providerId);
    const services = providerServicesMock.filter((s) => s.providerId === providerId);

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
            const statusMap: Record<string, string> = {
                providers: "",
                providers_pending: "pending",
                providers_approved: "approved",
                providers_suspended: "suspended",
            };
            window.location.href = statusMap[id] ? `/providers?status=${statusMap[id]}` : "/providers";
        }
    };

    if (!provider) {
        return (
            <Box sx={{ p: 3, color: "text.primary" }}>
                Prestataire introuvable.{" "}
                <Button onClick={() => (window.location.href = "/providers")}>Retour à la liste</Button>
            </Box>
        );
    }

    const config = statusConfig[provider.status];
    const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

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
                    onClick={() => (window.location.href = "/providers")}
                    sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
                >
                    Retour à la liste
                </Button>

                {/* En-tête */}
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
                            {provider.firstName[0]}
                            {provider.lastName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 0.5 }}>
                                {provider.firstName} {provider.lastName}
                            </Typography>
                            {provider.businessName && (
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {provider.businessName}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {provider.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {provider.phone || "—"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                Inscrit le {new Date(provider.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                {provider.approvedAt && (
                                    <> • Approuvé le {new Date(provider.approvedAt).toLocaleDateString("fr-FR")}</>
                                )}
                                {provider.suspendedAt && (
                                    <> • Suspendu le {new Date(provider.suspendedAt).toLocaleDateString("fr-FR")}</>
                                )}
                                {provider.rejectedAt && (
                                    <> • Rejeté le {new Date(provider.rejectedAt).toLocaleDateString("fr-FR")}</>
                                )}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                <Chip
                                    icon={config.color === "success" ? <CheckCircleIcon /> : config.color === "error" ? <BlockIcon /> : config.color === "warning" ? undefined : <CancelIcon />}
                                    label={config.label}
                                    color={config.color}
                                    size="small"
                                    sx={{ mr: 0.5 }}
                                />
                                {avgRating && (
                                    <Chip
                                        icon={<StarIcon sx={{ color: "warning.main" }} />}
                                        label={`${avgRating} (${reviews.length} avis)`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderColor: "warning.main", color: "warning.main" }}
                                    />
                                )}
                            </Box>
                            {provider.adminComment && (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        borderColor: "rgba(147, 181, 218, 0.2)",
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Commentaire admin :
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {provider.adminComment}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {provider.status === "pending" && (
                                <>
                                    <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} size="small" sx={{ textTransform: "none" }}>
                                        Approuver
                                    </Button>
                                    <Button variant="outlined" color="error" startIcon={<CancelIcon />} size="small" sx={{ textTransform: "none" }}>
                                        Rejeter
                                    </Button>
                                </>
                            )}
                            {provider.status === "approved" && (
                                <Button variant="outlined" color="warning" startIcon={<BlockIcon />} size="small" sx={{ textTransform: "none" }}>
                                    Suspendre
                                </Button>
                            )}
                            {provider.status === "suspended" && (
                                <Button variant="outlined" color="success" startIcon={<CheckCircleIcon />} size="small" sx={{ textTransform: "none" }}>
                                    Réactiver
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Card>

                {/* Grille : Documents, Catégories, Tarifs, Avis */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                    {/* Documents vérifiés */}
                    <Card
                        sx={{
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                            <DescriptionIcon fontSize="small" /> Documents ({provider.documents.length})
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {provider.documents.map((doc) => (
                                <Paper
                                    key={doc.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        borderColor: "rgba(147, 181, 218, 0.15)",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <DescriptionIcon fontSize="small" sx={{ color: "text.secondary" }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                {doc.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {documentTypeLabels[doc.type] || doc.type} • {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {doc.verified ? (
                                        <Chip icon={<VerifiedIcon />} label="Vérifié" color="success" size="small" />
                                    ) : (
                                        <Chip label="En attente" color="warning" size="small" variant="outlined" />
                                    )}
                                </Paper>
                            ))}
                        </Box>
                    </Card>

                    {/* Catégories de services */}
                    <Card
                        sx={{
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                            <CategoryIcon fontSize="small" /> Catégories de services
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                            {provider.serviceCategories.map((cat) => (
                                <Chip key={cat} label={cat} size="small" variant="outlined" sx={{ borderColor: "primary.main", color: "primary.light" }} />
                            ))}
                        </Box>
                    </Card>

                    {/* Tarifs */}
                    <Card
                        sx={{
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                            <AttachMoneyIcon fontSize="small" /> Tarifs
                        </Typography>
                        {provider.rates && provider.rates.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Catégorie</TableCell>
                                            <TableCell sx={{ color: "text.secondary", fontWeight: 600 }} align="right">Prix (MAD/h)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {provider.rates.map((r) => (
                                            <TableRow key={r.categoryId}>
                                                <TableCell>{r.categoryName}</TableCell>
                                                <TableCell align="right">{r.price} MAD</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Aucun tarif renseigné
                            </Typography>
                        )}
                    </Card>

                    {/* Avis reçus */}
                    <Card
                        sx={{
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                            <RateReviewIcon fontSize="small" /> Avis reçus ({reviews.length})
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 280, overflowY: "auto" }}>
                            {reviews.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Aucun avis pour le moment
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
                                                {rev.clientName} • {rev.serviceName} • {new Date(rev.date).toLocaleDateString("fr-FR")}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">{rev.comment}</Typography>
                                    </Paper>
                                ))
                            )}
                        </Box>
                    </Card>
                </Box>

                {/* Services proposés (optionnel) */}
                {services.length > 0 && (
                    <Card
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "rgba(10, 37, 77, 0.6)",
                            border: "1px solid rgba(147, 181, 218, 0.2)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                            Services proposés
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Service</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Catégorie</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }} align="right">Prix</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>Unité</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {services.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.name}</TableCell>
                                            <TableCell>{s.category}</TableCell>
                                            <TableCell align="right">{s.price} MAD</TableCell>
                                            <TableCell>{s.unit}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}
            </Box>
        </Box>
    );
}