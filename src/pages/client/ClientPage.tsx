import { useState, useMemo } from "react";
import {
    Box,
    Button,
    Card,
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
import { clientsMock } from "../../Data/clientsMockData";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Client } from "../../Data/Client";
import ClientFormModal from "./ClientFormModel";
import ConfirmDeactivateDialog from "./ConfirmDeactiveDialog";

export default function ClientsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("clients");
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState(clientsMock);
    const [editClient, setEditClient] = useState<Client | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [confirmClient, setConfirmClient] = useState<Client | null>(null);



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

    const handleToggleActive = (client: Client) => {
        if (client.isActive) {
            setConfirmClient(client);
        } else {
            setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, isActive: true } : c))
            );
        }
    };

    const handleConfirmDeactivate = () => {
        if (confirmClient) {
            setClients((prev) =>
                prev.map((c) => (c.id === confirmClient.id ? { ...c, isActive: false } : c))
            );
            setConfirmClient(null);
        }
    };
    const handleCancelDeactivate = () => {
        setConfirmClient(null);
    };


    const handleSaveClient = (updated: Client) => {
        setClients((prev) =>
            prev.some((c) => c.id === updated.id)
                ? prev.map((c) => (c.id === updated.id ? updated : c))
                : [...prev, updated]
        );
        setEditClient(null);
        setFormOpen(false);
    };

    const handleOpenEdit = (client: Client) => {
        setEditClient(client);
        setFormOpen(true);
    };

    const handleOpenCreate = () => {
        setEditClient(null);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditClient(null);
        setFormOpen(false);
    };

    const filteredClients = useMemo(() => {
        if (!search.trim()) return clients;
        const q = search.toLowerCase().trim();
        return clients.filter(
            (c) =>
                c.firstName.toLowerCase().includes(q) ||
                c.lastName.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone?.includes(q) ?? false)
        );
    }, [search, clients]);

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
                            background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Gestion des clients
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Liste de tous les comptes clients inscrits
                    </Typography>
                </Box>

                <Card
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
                            placeholder="Rechercher par nom, email, téléphone..."
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
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                            onClick={handleOpenCreate}
                        >
                            Créer un client
                        </Button>
                    </Box>
                </Card>

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
                                <TableCell>Nom</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Téléphone</TableCell>
                                <TableCell>Date inscription</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        {client.firstName} {client.lastName}
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone || "—"}</TableCell>
                                    <TableCell>
                                        {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell>
                                        {client.isActive ? (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main" }}>
                                                <CheckCircleIcon fontSize="small" />
                                                Actif
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.disabled" }}>
                                                <BlockIcon fontSize="small" />
                                                Désactivé
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            title="Voir profil"
                                            sx={{ color: "primary.light" }}
                                            onClick={() => (window.location.href = `/clients/${client.id}`)}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            title="Modifier"
                                            sx={{ color: "text.secondary" }}
                                            onClick={() => handleOpenEdit(client)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            title={client.isActive ? "Désactiver" : "Activer"}
                                            sx={{ color: client.isActive ? "warning.main" : "success.main" }}
                                            onClick={() => handleToggleActive(client)}
                                        >
                                            {client.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredClients.length === 0 && (
                    <Typography sx={{ mt: 2, color: "text.secondary", textAlign: "center" }}>
                        Aucun client trouvé
                    </Typography>
                )}

                <ClientFormModal
                    open={formOpen}
                    client={editClient}
                    onClose={handleCloseForm}
                    onSave={handleSaveClient}
                />
                <ConfirmDeactivateDialog
                    open={Boolean(confirmClient)}
                    client={confirmClient}
                    onConfirm={handleConfirmDeactivate}
                    onCancel={handleCancelDeactivate}
                />
            </Box>
        </Box>
    );
}