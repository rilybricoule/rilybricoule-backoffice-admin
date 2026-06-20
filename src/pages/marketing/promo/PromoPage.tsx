import { useEffect, useState, useMemo } from "react";
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, InputAdornment, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Toolbar, Typography,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Navbar     from "../../../components/Navbar";
import Sidebar    from "../../../components/Sidebar";
import OpenArtBg  from "../../../assets/openart.png";
import { navigateTo }       from "../../../utiles/Navigation";
import PromoRow        from "./components/PromoRow";
import PromoFormDialog from "./components/PromoFormDialog";
import type { Promo, PromoStatus }  from "../../../Data/Promo";
import {
    createAdminPromo,
    deleteAdminPromo,
    getAdminPromos,
    toggleAdminPromoStatus,
    updateAdminPromo,
    type PromoPayload,
} from "../../../api/promos";
import { useNavigate } from "react-router-dom";

const dialogPaperSx = {
    bgcolor:  "rgba(10,37,77,0.98)",
    border:   "1px solid rgba(147,181,218,0.2)",
    minWidth: 400,
};

const filterTabs: { key: "all" | PromoStatus; label: string }[] = [
    { key: "all",      label: "Toutes"    },
    { key: "active",   label: "Actives"   },
    { key: "inactive", label: "Inactives" },
    { key: "expired",  label: "Expirées"  },
];

export default function PromoPage() {
    const [sidebarOpen,   setSidebarOpen]   = useState(true);
    const [selected,      setSelected]      = useState("promo");
    const [search,        setSearch]        = useState("");
    const [statusFilter,  setStatusFilter]  = useState<"all" | PromoStatus>("all");
    const [formOpen,      setFormOpen]      = useState(false);
    const [editPromo,     setEditPromo]     = useState<Promo | null>(null);
    const [deleteTarget,  setDeleteTarget]  = useState<Promo | null>(null);
    const [promos,        setPromos]        = useState<Promo[]>([]);
    const [loadingPromos, setLoadingPromos] = useState(true);
    const [promosError,   setPromosError]   = useState("");

    const navigate = useNavigate();

    const loadPromos = async () => {
        try {
            setLoadingPromos(true);
            setPromosError("");

            const data = await getAdminPromos();
            setPromos(data);
        } catch (err: any) {
            setPromosError(err?.response?.data?.message || "Erreur chargement codes promo");
        } finally {
            setLoadingPromos(false);
        }
    };

    useEffect(() => {
        loadPromos();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };
    const handleSelect = (id: string) => { setSelected(id); navigateTo(id, navigate); };


    const replacePromo = (saved: Promo) => {
        setPromos((prev) =>
            prev.map((promo) => promo.id === saved.id ? saved : promo)
        );
    };

    const handleSave = async (data: PromoPayload) => {
        try {
            setPromosError("");

            if (editPromo) {
                const saved = await updateAdminPromo(editPromo.id, data);
                replacePromo(saved);
            } else {
                const saved = await createAdminPromo(data);
                setPromos((prev) => [saved, ...prev]);
            }

            setEditPromo(null);
        } catch (err: any) {
            setPromosError(err?.response?.data?.message || "Erreur sauvegarde code promo");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            setPromosError("");

            await deleteAdminPromo(deleteTarget.id);
            setPromos((prev) => prev.filter((promo) => promo.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err: any) {
            setPromosError(err?.response?.data?.message || "Erreur suppression code promo");
        }
    };

    const handleToggle = async (promo: Promo) => {
        try {
            setPromosError("");

            const saved = await toggleAdminPromoStatus(promo);
            replacePromo(saved);
        } catch (err: any) {
            setPromosError(err?.response?.data?.message || "Erreur statut code promo");
        }
    };

    const counts = useMemo(() => ({
        all:      promos.length,
        active:   promos.filter(p => p.status === "active").length,
        inactive: promos.filter(p => p.status === "inactive").length,
        expired:  promos.filter(p => p.status === "expired").length,
    }), [promos]);

    const filtered = useMemo(() => {
        let result = statusFilter === "all" ? promos : promos.filter(p => p.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.code.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [promos, statusFilter, search]);

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />
            <Box component="main" sx={{
                flexGrow: 1, p: 3, minHeight: "100vh", minWidth: 0, overflowX: "auto",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover", backgroundPosition: "center",
            }}>

            <Toolbar />

                {/* Header */}
                <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Codes promo</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gérez les coupons de réduction de la plateforme
                        </Typography>
                    </Box>
                    <Button
                        variant="contained" startIcon={<AddIcon />}
                        onClick={() => { setEditPromo(null); setFormOpen(true); }}
                    >
                        Nouveau code
                    </Button>
                </Box>

                {/* Filters */}
                <Box sx={{ p: 2, mb: 3, bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Rechercher un code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary" }} /></InputAdornment> }}
                        sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)", "& fieldset": { borderColor: "rgba(147,181,218,0.2)" } } }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {filterTabs.map(tab => {
                            const active = statusFilter === tab.key;
                            return (
                                <Chip
                                    key={tab.key}
                                    label={`${tab.label} (${counts[tab.key]})`}
                                    onClick={() => setStatusFilter(tab.key)}
                                    size="small"
                                    sx={{
                                        cursor: "pointer",
                                        fontWeight: active ? 700 : 400,
                                        bgcolor: active ? "primary.main" : "rgba(147,181,218,0.1)",
                                        color:   active ? "#fff" : "text.secondary",
                                        border:  active ? "none" : "1px solid rgba(147,181,218,0.2)",
                                        "&:hover": { bgcolor: active ? "primary.dark" : "rgba(147,181,218,0.2)" },
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{
                    bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2,
                    "& .MuiTableHead-root .MuiTableCell-root": { fontWeight: 600, color: "text.secondary", borderBottom: "1px solid rgba(147,181,218,0.25)", bgcolor: "rgba(15,45,90,0.95)" },
                    "& .MuiTableBody-root .MuiTableRow-root:hover": { bgcolor: "rgba(8,20,50,0.98)"},
                    "& .MuiTableCell-root": { borderBottom: "1px solid rgba(147,181,218,0.12)", color: "text.primary" },
                }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell align="center">Réduction</TableCell>
                                <TableCell>Validité</TableCell>
                                <TableCell>Utilisation</TableCell>
                                <TableCell align="center">Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {promosError && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography sx={{ color: "error.main", fontWeight: 700 }}>
                                            {promosError}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {loadingPromos && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography sx={{ color: "text.secondary" }}>
                                            Chargement des codes promo...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {filtered.map(promo => (
                                <PromoRow
                                    key={promo.id}
                                    promo={promo}
                                    onEdit={() => { setEditPromo(promo); setFormOpen(true); }}
                                    onDelete={() => setDeleteTarget(promo)}
                                    onToggle={() => handleToggle(promo)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filtered.length === 0 && (
                    <Typography sx={{ mt: 3, color: "text.secondary", textAlign: "center" }}>
                        Aucun code promo trouvé
                    </Typography>
                )}

                {/* Delete dialog */}
                <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: dialogPaperSx }}>
                    <DialogTitle>Supprimer le code promo ?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Êtes-vous sûr de vouloir supprimer le code <strong>{deleteTarget?.code}</strong> ? Cette action est irréversible.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
                        <Button variant="contained" color="error" onClick={handleDelete}>
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog>

                <PromoFormDialog
                    open={formOpen}
                    editPromo={editPromo}
                    onClose={() => { setFormOpen(false); setEditPromo(null); }}
                    onSave={handleSave}
                />
            </Box>
        </Box>
    );
}
