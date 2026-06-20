import { useState, useMemo,useEffect } from "react";
import {
    Box, Button, IconButton, InputAdornment, Paper,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Toolbar, Typography,
} from "@mui/material";
import Navbar    from "../../components/Navbar";
import Sidebar   from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { useCategories } from "../context/CategoriesContext";
import type { ServiceCategory as Category} from "../../Data/ServiceCategory";

import { Alert } from "@mui/material";







import SearchIcon        from "@mui/icons-material/Search";
import AddIcon           from "@mui/icons-material/Add";
import CloseIcon         from "@mui/icons-material/Close";
import CategoryIcon      from "@mui/icons-material/Category";


import CategoryTableRow    from "./categorytablerow";
import CategoryDetailPanel from "./Categorydetailpanel";
import CategoryFormModal   from "./Categoryformmodal";
import DeleteConfirmDialog from "./Deleteconfirmdialog";
import { useNavigate } from "react-router-dom";
import { navigateTo } from "../../utiles/Navigation";
import AppPagination from "../../components/AppPagination";
import { usePagination } from "../hooks/usePagination";
import {getAllDescendantIds} from "./Categoryhelpers.ts";













export default function CategoriesPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("categories");
    const [search, setSearch] = useState("");





    const [selectedCat, setSelectedCat] = useState<Category | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [parentCategory, setParentCategory] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());



    const {
        categories,
        loadingCategories,
        categoryStats,
        categoriesError,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategories();




    const [actionError, setActionError] = useState("");


    const toggleRow = (id: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const openAddSub = (p: Category) => {
        setEditCategory(null);
        setParentCategory(p);   // ← this sets the default parent
        setFormOpen(true);
    };






    const handleSelect = (id: string) => { setSelected(id); navigateTo(id, navigate); };

    const topLevelCategories = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

    const filteredTopLevel = useMemo(() => {
        if (!search.trim()) return topLevelCategories;
        const q = search.toLowerCase();
        return categories.filter((c) =>
            c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
        );
    }, [search, categories, topLevelCategories]);




    const isSearching = search.trim().length > 0;





    const dataToPaginate = useMemo(
        () => isSearching ? filteredTopLevel : topLevelCategories,
        [isSearching, filteredTopLevel, topLevelCategories]
    );

    const {
        paginated: paginatedCategories,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        total
    } = usePagination(dataToPaginate);

    const handleSave = async (cat: Category) => {
        try {
            setActionError("");

            const saved = editCategory
                ? await updateCategory(editCategory.id, cat)
                : await createCategory(cat);

            if (saved.parentId) {
                setExpandedRows((prev) => {
                    const next = new Set(prev);
                    let currentId: string | null | undefined = saved.parentId;

                    while (currentId) {
                        next.add(currentId);
                        const parent = categories.find((c) => c.id === currentId);
                        currentId = parent?.parentId;
                    }

                    return next;
                });
            }

            setFormOpen(false);
            setEditCategory(null);
            setParentCategory(null);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                setActionError("Une catégorie avec ce nom existe déjà");
                return;
            }

            setActionError(err?.response?.data?.message || "Erreur enregistrement catégorie");
        }
    };


    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            setActionError("");

            const toDelete = new Set([
                deleteTarget.id,
                ...getAllDescendantIds(deleteTarget.id, categories),
            ]);

            await deleteCategory(deleteTarget.id);

            if (selectedCat && toDelete.has(selectedCat.id)) {
                setSelectedCat(null);
            }

            setDeleteTarget(null);
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur suppression catégorie");
        }
    };


    const openEdit   = (cat: Category) => { setEditCategory(cat); setParentCategory(null); setFormOpen(true); };

    const openNew    = ()              => { setEditCategory(null); setParentCategory(null); setFormOpen(true); };

    const sharedRowProps = {
        allCategories: categories,
        expandedRows,
        toggleRow,
        selectedCat,
        setSelectedCat,
        openEdit,
        openAddSub,
        setDeleteTarget,
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />

            <Box component="main" sx={{
                flexGrow: 1, p: 3, minHeight: "100vh",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat",
            }}>
                <Toolbar />

                {/* ── Header ── */}
                <Box sx={{ mb: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{
                            fontWeight: 800, letterSpacing: 0.2, mb: 1,
                            background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                            Catégories & Services
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {[
                                { label: `${topLevelCategories.length} catégories`,                          color: "primary.light",        bg: "rgba(47,124,201,0.12)", border: "rgba(147,181,218,0.25)" },
                                { label: `${categories.length - topLevelCategories.length} sous-catégories`, color: "rgba(165,180,252,0.9)", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)"  },
                                { label: `${categoryStats.totalServices} services actifs`, color: "rgba(52,211,153,0.9)", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" },
                                { label: `${categoryStats.totalProviders} prestataires`, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },

                            ].map((b) => (
                                <Box key={b.label} sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.4, bgcolor: b.bg, border: `1px solid ${b.border}`, borderRadius: "20px" }}>
                                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: b.color, boxShadow: `0 0 5px ${b.color}` }} />
                                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: b.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                        {b.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}
                            sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start", mt: 0.5 }}>
                        Nouvelle catégorie
                    </Button>
                </Box>

                {/* ── Table ── */}

                {(categoriesError || actionError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {categoriesError || actionError}
                    </Alert>
                )}
                {loadingCategories && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Chargement des catégories...
                    </Alert>
                )}


                <Paper sx={{ bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(147,181,218,0.12)" }}>
                        <TextField
                            placeholder="Rechercher une catégorie..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            size="small" fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")} sx={{ color: "text.secondary" }}>
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined,
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.15)", "& fieldset": { borderColor: "rgba(147,181,218,0.15)" } } }}
                        />
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {["Catégorie", "Sous-catégories", "Prestataires", "Services", "Créé le", "Actions"].map((h) => (
                                        <TableCell key={h} sx={{
                                            fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.06em",
                                            textTransform: "uppercase", color: "rgba(148,175,218,0.85)",
                                            borderBottom: "1px solid rgba(56,189,248,0.2)", py: 1.5,
                                            bgcolor: "rgba(15,45,90,0.95)",
                                        }}>

                                        {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                                            <CategoryIcon sx={{ fontSize: 36, display: "block", mx: "auto", mb: 1, opacity: 0.3 }} />
                                            Aucune catégorie trouvée
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedCategories.map((cat) => (
                                    <CategoryTableRow key={cat.id} category={cat} depth={0} {...sharedRowProps} />
                                ))}
                            </TableBody>
                        </Table>
                        <AppPagination
                            total={total}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={setPage}
                            onRowsPerPage={setRowsPerPage}
                        />

                    </TableContainer>
                </Paper>

                {/* ── Slide-in detail panel ── */}
                {selectedCat && (
                    <>
                        <Box onClick={() => setSelectedCat(null)}
                             sx={{ position: "fixed", inset: 0, zIndex: 1199, bgcolor: "rgba(0,0,0,0.25)" }} />
                        <Box sx={{
                            position: "fixed", top: 0, right: 0, bottom: 0, width: 430, zIndex: 1200,
                            bgcolor: "rgba(7,24,55,0.98)", borderLeft: "1px solid rgba(147,181,218,0.2)",
                            backdropFilter: "blur(16px)", display: "flex", flexDirection: "column",
                            animation: "slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                            "@keyframes slideIn": {
                                from: { transform: "translateX(100%)", opacity: 0 },
                                to:   { transform: "translateX(0)",    opacity: 1 },
                            },
                        }}>
                            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid rgba(147,181,218,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    Détails catégorie
                                </Typography>
                                <IconButton size="small" onClick={() => setSelectedCat(null)}
                                            sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box sx={{
                                flex: 1, overflowY: "auto", p: 2.5,
                                "&::-webkit-scrollbar": { width: 4 },
                                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(148,163,184,0.2)", borderRadius: 10 },
                            }}>
                                <CategoryDetailPanel
                                    category={selectedCat}
                                    allCategories={categories}
                                    onEdit={openEdit}
                                    onAddSub={openAddSub}
                                    onDelete={(cat) => { setDeleteTarget(cat); setSelectedCat(null); }}
                                />
                            </Box>
                        </Box>
                    </>
                )}
            </Box>

            <CategoryFormModal
                key={editCategory?.id ?? `new-${parentCategory?.id ?? "root"}`}
                open={formOpen}
                onClose={() => { setFormOpen(false); setEditCategory(null); setParentCategory(null); }}
                onSave={handleSave}
                editCategory={editCategory}
                parentCategory={parentCategory}
                categories={categories}
            />
            <DeleteConfirmDialog
                open={Boolean(deleteTarget)}
                category={deleteTarget}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    );
}