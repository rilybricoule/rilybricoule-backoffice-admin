import { useState, useMemo } from "react";
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { providersMock } from "../../Data/ProvidersMockData";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import type { Provider, ProviderStatus } from "../../Data/Provider";

const statusConfig: Record<ProviderStatus, { label: string; color: string }> = {
    pending: { label: "En attente", color: "warning.main" },
    approved: { label: "Approuvé", color: "success.main" },
    suspended: { label: "Suspendu", color: "error.main" },
    rejected: { label: "Rejeté", color: "text.disabled" },
};

export default function ProviderPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("providers");
    const [search, setSearch] = useState("");
    const [providers, setProviders] = useState(providersMock);
    const [statusFilter, setStatusFilter] = useState<ProviderStatus | "">("");

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
            const statusMap: Record<string, ProviderStatus | ""> = {
                providers: "",
                providers_pending: "pending",
                providers_approved: "approved",
                providers_suspended: "suspended",
            };
            setStatusFilter(statusMap[id] ?? "");
            window.location.href = statusMap[id] ? `/providers?status=${statusMap[id]}` : "/providers";
        }
    };

    // Sync filter from URL on mount
    useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const s = params.get("status") as ProviderStatus | null;
        if (s && ["pending", "approved", "suspended"].includes(s)) {
            setStatusFilter(s);
            setSelected(s === "pending" ? "providers_pending" : s === "approved" ? "providers_approved" : "providers_suspended");
        }
    }, []);

    const filteredProviders = useMemo(() => {
        let list = providers;
        if (statusFilter) list = list.filter((p) => p.status === statusFilter);
        if (!search.trim()) return list;
        const q = search.toLowerCase().trim();
        return list.filter(
            (p) =>
                p.firstName.toLowerCase().includes(q) ||
                p.lastName.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                (p.phone?.includes(q) ?? false) ||
                (p.businessName?.toLowerCase().includes(q) ?? false)
        );
    }, [search, providers, statusFilter]);

    const pendingCount = useMemo(() => providers.filter((p) => p.status === "pending").length, [providers]);

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
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            letterSpacing: 0.2,
                            background: "linear-gradient(90deg, #f8fafc 0%, #f08a2f 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Gestion des prestataires
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Liste des professionnels inscrits • {statusFilter ? statusConfig[statusFilter as ProviderStatus]?.label : "Tous les statuts"}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: "rgba(10, 37, 77, 0.6)",
                        border: "1px solid rgba(147, 181, 218, 0.2)",
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                        <TextField
                            placeholder="Rechercher par nom, email, téléphone, entreprise..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "text.secondary" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 250,
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "rgba(0,0,0,0.2)",
                                    "& fieldset": { borderColor: "rgba(147, 181, 218, 0.2)" },
                                },
                            }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant={statusFilter === "" ? "contained" : "outlined"}
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => { setStatusFilter(""); setSelected("providers"); window.location.href = "/providers"; }}
                            >
                                Tous
                            </Button>
                            <Button
                                variant={statusFilter === "pending" ? "contained" : "outlined"}
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => { setStatusFilter("pending"); setSelected("providers_pending"); window.location.href = "/providers?status=pending"; }}
                            >
                                En attente ({pendingCount})
                            </Button>
                            <Button
                                variant={statusFilter === "approved" ? "contained" : "outlined"}
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => { setStatusFilter("approved"); setSelected("providers_approved"); window.location.href = "/providers?status=approved"; }}
                            >
                                Approuvés
                            </Button>
                            <Button
                                variant={statusFilter === "suspended" ? "contained" : "outlined"}
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => { setStatusFilter("suspended"); setSelected("providers_suspended"); window.location.href = "/providers?status=suspended"; }}
                            >
                                Suspendus
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{
                        bgcolor: "rgba(10, 37, 77, 0.6)",
                        border: "1px solid rgba(147, 181, 218, 0.2)",
                        borderRadius: 2,
                        "& .MuiTableHead-root .MuiTableCell-root": {
                            fontWeight: 700,
                            color: "text.secondary",
                            borderBottom: "1px solid rgba(147, 181, 218, 0.25)",
                        },
                        "& .MuiTableBody-root .MuiTableRow:hover": {
                            bgcolor: "rgba(255,255,255,0.04)",
                        },
                        "& .MuiTableCell-root": {
                            borderBottom: "1px solid rgba(147, 181, 218, 0.12)",
                            color: "text.primary",
                        },
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom / Entreprise</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Téléphone</TableCell>
                                <TableCell>Date inscription</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProviders.map((provider) => {
                                const config = statusConfig[provider.status];
                                return (
                                    <TableRow key={provider.id}>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {provider.firstName} {provider.lastName}
                                                </Typography>
                                                {provider.businessName && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {provider.businessName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{provider.email}</TableCell>
                                        <TableCell>{provider.phone || "—"}</TableCell>
                                        <TableCell>
                                            {new Date(provider.createdAt).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: config.color }}>
                                                {provider.status === "approved" && <CheckCircleIcon fontSize="small" />}
                                                {provider.status === "suspended" && <BlockIcon fontSize="small" />}
                                                {provider.status === "rejected" && <CancelIcon fontSize="small" />}
                                                {config.label}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                title="Voir profil"
                                                sx={{ color: "primary.light" }}
                                                onClick={() => (window.location.href = `/providers/${provider.id}`)}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredProviders.length === 0 && (
                    <Typography sx={{ mt: 2, color: "text.secondary", textAlign: "center" }}>
                        Aucun prestataire trouvé
                    </Typography>
                )}
            </Box>
        </Box>
    );
}