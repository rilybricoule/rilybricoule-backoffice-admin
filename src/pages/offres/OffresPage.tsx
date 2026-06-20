import { useState, useMemo } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle,
    IconButton, InputAdornment, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    TextField, Toolbar, Tooltip, Typography, Chip, Tabs, Tab,
    Divider,
} from "@mui/material";
import SearchIcon        from "@mui/icons-material/Search";
import CloseIcon         from "@mui/icons-material/Close"
import EditIcon          from "@mui/icons-material/Edit";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import CancelIcon        from "@mui/icons-material/Cancel";
import ChatIcon          from "@mui/icons-material/Chat";
import Navbar            from "../../components/Navbar";
import Sidebar           from "../../components/Sidebar";
import OpenArtBg         from "../../assets/openart.png";

import { useMessages }   from "../context/MessagesContext";
import { navigateTo }    from "../../utiles/Navigation";
import type { Offer, OfferStatus } from "../../Data/Offer";
import { useNavigate }   from "react-router-dom";
import OfferDetailsDialog from "./Offerdetaildialog";
import AppPagination from "../../components/AppPagination";
import { usePagination } from "../hooks/usePagination";


import { useOffres } from "../context/OffresContext";


// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<OfferStatus, { label: string; color: "success" | "warning" | "default" | "error"| "info" }> = {
    active:     { label: "Approuvée", color: "success" },
    en_attente: { label: "En attente", color: "warning" },
    masquee:    { label: "Rejetée",   color: "error"   },
    en_attente_ajustement: {
        label: "En attente d'ajustement",
        color: "info"  // in OffresPage
    },
};

const dialogPaperSx = {
    bgcolor: "rgba(10,37,77,0.98)",
    border:  "1px solid rgba(147,181,218,0.2)",
    minWidth: 400,
};

// ── Audit log (in-memory) ─────────────────────────────────────────────────────

interface AuditEntry { action: string; by: string; date: string; note?: string; }
const auditLog: Record<string, AuditEntry[]> = {};
function addAuditEntry(offerId: string, entry: AuditEntry) {
    if (!auditLog[offerId]) auditLog[offerId] = [];
    auditLog[offerId].unshift(entry);
}

// ── Shared table columns ──────────────────────────────────────────────────────

function OfferRow({
                      offer,
                      onDetail,
                      onEdit,
                      onApprove,
                      onReject,
                      onMessage,
                      showStatus,
                  }: {
    offer:      Offer;
    onDetail:   () => void;
    onEdit:     () => void;
    onApprove?: () => void;
    onReject?:  () => void;
    onMessage:  () => void;
    showStatus: boolean;
}) {
    const sc = statusConfig[offer.status];
    return (
        <TableRow sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.04)" } }}>

            {/* Titre */}
            <TableCell sx={{ maxWidth: 160 }}>
                <Typography
                    variant="body2" fontWeight={600}
                    onClick={onDetail}
                    sx={{
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150,
                        color: "primary.light", cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    {offer.title}
                </Typography>
            </TableCell>

            {/* Prestataire */}
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: "primary.light", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={() => {}}
                    >
                        {offer.providerName}
                    </Typography>
                    <Tooltip title="Envoyer un message">
                        <IconButton size="small" sx={{ color: "text.secondary", p: 0.25, "&:hover": { color: "primary.light" } }}
                                    onClick={(e) => { e.stopPropagation(); onMessage(); }}>
                            <ChatIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </TableCell>

            {/* Catégorie */}
            <TableCell>
                <Chip label={offer.category} size="small" variant="outlined"
                      sx={{ fontSize: "0.68rem", height: 20, borderColor: "rgba(147,181,218,0.3)", color: "text.secondary", "& .MuiChip-label": { px: 0.75 } }} />

            </TableCell>

            {/* Tarif */}
            <TableCell align="center">
                <Typography variant="body2" fontWeight={600} color="primary.light">
                    {offer.price} MAD
                </Typography>
            </TableCell>

            {/* Statut — only in historique */}
            {showStatus && (
                <TableCell align="center">
                    <Chip label={sc.label} size="small" color={sc.color} variant="outlined"
                          sx={{ fontSize: "0.72rem", height: 22, "& .MuiChip-label": { px: 1 } }} />
                </TableCell>
            )}

            {/* Date */}
            <TableCell>
                <Typography variant="body2" color="text.secondary">
                    {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                </Typography>
            </TableCell>

            {/* Actions */}
            <TableCell align="right">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                    {onApprove && (
                        <Tooltip title="Approuver" placement="top">
                            <IconButton size="small" onClick={onApprove} sx={{ color: "success.main" }}>
                                <CheckCircleIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onReject && (
                        <Tooltip title="Rejeter" placement="top">
                            <IconButton size="small" onClick={onReject} sx={{ color: "error.main" }}>
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Modifier" placement="top">
                        <IconButton size="small" onClick={onEdit} sx={{ color: "primary.light" }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </TableCell>
        </TableRow>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OffresPage() {


    const {
        offers,
        loadingOffers,
        offersError,
        approveOffer,
        hideOffer,
        requestAdjustment,
    } = useOffres();

    const [actionError, setActionError] = useState("");

    const { addMessage, openChat } = useMessages();
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────────────────────────
    const [sidebarOpen,   setSidebarOpen]   = useState(true);
    const [selected,      setSelected]      = useState("offers");
    const [activeTab, setActiveTab] = useState(0);
// 0 = À valider, 1 = Ajustements, 2 = Approuvées, 3 = Masquées
    const [search,        setSearch]        = useState("");

    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [dialogOpen,    setDialogOpen]    = useState(false);
    const [editForm, setEditForm] = useState({ remarques: "" });
    const [approveTarget, setApproveTarget] = useState<Offer | null>(null);
    const [rejectTarget,  setRejectTarget]  = useState<Offer | null>(null);
    const [rejectReason,  setRejectReason]  = useState("");
    const [editTarget,    setEditTarget]    = useState<Offer | null>(null);

    const now = () => new Date().toLocaleDateString("fr-FR");

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };




    const matchesSearch = (offer: Offer) => {
        if (!search.trim()) return true;

        const q = search.toLowerCase();

        return [offer.title, offer.providerName, offer.category]
            .some((field) => field.toLowerCase().includes(q));
    };


    const handleSelect = (id: string) => { setSelected(id); navigateTo(id, navigate); };

    const handleApproveConfirm = async () => {
        if (!approveTarget) return;

        try {
            setActionError("");

            await approveOffer(approveTarget.id);

            addAuditEntry(approveTarget.id, {
                action: "Offre approuvée",
                by: "Admin",
                date: now(),
            });

            setApproveTarget(null);
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur approbation offre");
        }
    };


    const handleEditOpen = (offer: Offer) => {
        setEditTarget(offer);
        setEditForm({ remarques: "" });
    };

    const handleRejectConfirm = async () => {
        if (!rejectTarget) return;

        try {
            setActionError("");

            await hideOffer(rejectTarget.id, rejectReason);

            addAuditEntry(rejectTarget.id, {
                action: "Offre rejetée",
                by: "Admin",
                date: now(),
                note: rejectReason,
            });

            setRejectTarget(null);
            setRejectReason("");
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur rejet offre");
        }
    };






    const handleOpenMessage = (offer: Offer) => {
        addMessage({
            id:           offer.providerId,
            senderName:   offer.providerName,
            senderAvatar: offer.providerName[0].toUpperCase(),
            preview:      `Concernant : ${offer.title}`,
            time:         "À l'instant",
            unread:       true,
            providerId:   offer.providerId,
        });
        openChat({
            id:           offer.providerId,
            providerName: offer.providerName,
            avatar:       offer.providerName[0].toUpperCase(),
            providerId:   offer.providerId,
            receiverId:   offer.providerId,
        });
    };

    const openDetail = (offer: Offer) => { setSelectedOffer(offer); setDialogOpen(true); };

    // ── Derived data ──────────────────────────────────────────────────────────

    const offersToValidate = useMemo(() => {
        return offers.filter((offer) =>
            offer.status === "en_attente" && matchesSearch(offer)
        );
    }, [offers, search]);

    const offersWithAdjustments = useMemo(() => {
        return offers.filter((offer) =>
            offer.status === "en_attente_ajustement" && matchesSearch(offer)
        );
    }, [offers, search]);

    const approvedOffers = useMemo(() => {
        return offers.filter((offer) =>
            offer.status === "active" && matchesSearch(offer)
        );
    }, [offers, search]);

    const hiddenOffers = useMemo(() => {
        return offers.filter((offer) =>
            offer.status === "masquee" && matchesSearch(offer)
        );
    }, [offers, search]);

    const currentOffers = useMemo(() => {
        if (activeTab === 0) return offersToValidate;
        if (activeTab === 1) return offersWithAdjustments;
        if (activeTab === 2) return approvedOffers;
        return hiddenOffers;
    }, [activeTab, offersToValidate, offersWithAdjustments, approvedOffers, hiddenOffers]);

    const dataToPaginate = currentOffers;

    const {
        paginated: paginatedOffers,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        total
    } = usePagination(dataToPaginate);



    // ── Render ────────────────────────────────────────────────────────────────

    const tableHead = (showStatus: boolean) => (
        <TableHead>
            <TableRow>
                <TableCell sx={{ width: 160 }}>Titre</TableCell>
                <TableCell sx={{ width: 130 }}>Prestataire</TableCell>
                <TableCell sx={{ width: 100 }}>Catégorie</TableCell>
                <TableCell align="center" sx={{ width: 80 }}>Tarif</TableCell>
                {showStatus && <TableCell align="center" sx={{ width: 90 }}>Statut</TableCell>}
                <TableCell sx={{ width: 90 }}>Date</TableCell>
                <TableCell align="right" sx={{ width: 100 }}>Actions</TableCell>
            </TableRow>
        </TableHead>
    );


    const handleEditSave = async () => {
        if (!editTarget || !editForm.remarques.trim()) return;

        try {
            setActionError("");

            await requestAdjustment(editTarget.id, editForm.remarques);

            addAuditEntry(editTarget.id, {
                action: "Remarques envoyées — en attente d'ajustement",
                by: "Admin",
                date: now(),
                note: editForm.remarques,
            });

            setEditTarget(null);
            setEditForm({ remarques: "" });
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur envoi remarques");
        }
    };


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

                {/* ── Header ── */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 0.5 }}>
                        Gestion des offres de service
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Modération des annonces publiées par les prestataires
                    </Typography>
                </Box>

                {/* ── Search ── */}
                <Box sx={{
                    p: 2, mb: 3,
                    bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2,
                    display: "flex", gap: 2, alignItems: "center",
                }}>
                    <TextField
                        placeholder="Rechercher par titre, prestataire, catégorie..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary" }} /></InputAdornment> }}
                        sx={{
                            flex: 1,
                            "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)", "& fieldset": { borderColor: "rgba(147,181,218,0.2)" } },
                        }}
                    />
                </Box>

                {/* ── Tabs ── */}
                <Tabs
                    value={activeTab}
                    onChange={(_, value) => setActiveTab(value)}
                    sx={{
                            "& .MuiTab-root": {
                                minHeight: 38,
                                textTransform: "none",
                                fontWeight: 800,
                                color: "rgba(226,232,240,0.72)",
                            },
                            "& .MuiTab-root:hover": {
                                color: "#f8fafc",
                            },
                            "& .Mui-selected": {
                                color: "#f8fafc !important",
                            },
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#38bdf8",
                                height: 3,
                                borderRadius: 3,
                            },
                        }}
                >
                    <Tab label={`À valider (${offersToValidate.length})`} />
                    <Tab label={`Ajustements (${offersWithAdjustments.length})`} />
                    <Tab label={`Approuvées (${approvedOffers.length})`} />
                    <Tab label={`Masquées (${hiddenOffers.length})`} />
                </Tabs>


                {/* ── En attente table ── */}
                {/* ── Offers table ── */}
                <Paper sx={{
                    mt: 2,
                    bgcolor: "rgba(10,37,77,0.6)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    borderRadius: 2,
                    overflow: "hidden",
                }}>
                    {(offersError || actionError) && (
                        <Box sx={{ p: 2 }}>
                            <Typography color="error" fontWeight={600}>
                                {offersError || actionError}
                            </Typography>
                        </Box>
                    )}

                    {loadingOffers && (
                        <Box sx={{ p: 2 }}>
                            <Typography color="text.secondary">
                                Chargement des offres...
                            </Typography>
                        </Box>
                    )}

                    <TableContainer>
                        <Table size="small">
                            {tableHead(true)}

                            <TableBody>
                                {!loadingOffers && paginatedOffers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                                            Aucune offre trouvée
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedOffers.map((offer) => (
                                        <OfferRow
                                            key={offer.id}
                                            offer={offer}
                                            onDetail={() => openDetail(offer)}
                                            onEdit={() => handleEditOpen(offer)}
                                            onApprove={offer.status !== "active" ? () => setApproveTarget(offer) : undefined}
                                            onReject={offer.status !== "masquee" ? () => setRejectTarget(offer) : undefined}
                                            onMessage={() => handleOpenMessage(offer)}
                                            showStatus={true}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <AppPagination
                        total={total}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={setPage}
                        onRowsPerPage={setRowsPerPage}
                    />
                </Paper>



                {/* ── Approve dialog ── */}
                <Dialog open={Boolean(approveTarget)} onClose={() => setApproveTarget(null)} PaperProps={{ sx: dialogPaperSx }}>
                    <DialogTitle>Approuver l'offre ?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            L'offre <strong>"{approveTarget?.title}"</strong> de <strong>{approveTarget?.providerName}</strong> sera rendue visible sur la plateforme.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setApproveTarget(null)}>Annuler</Button>
                        <Button variant="contained" color="success" onClick={handleApproveConfirm}>Approuver</Button>
                    </DialogActions>
                </Dialog>

                {/* ── Reject dialog ── */}
                <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} PaperProps={{ sx: dialogPaperSx }}>
                    <DialogTitle>Rejeter l'offre</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            L'offre <strong>"{rejectTarget?.title}"</strong> sera rejetée. Le prestataire en sera notifié.
                        </DialogContentText>
                        <TextField
                            fullWidth multiline rows={3}
                            label="Motif du rejet (visible par le prestataire)"
                            placeholder="Ex: Description insuffisante, tarif non conforme..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            size="small"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setRejectTarget(null)}>Annuler</Button>
                        <Button variant="contained" color="error" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
                            Rejeter
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ── Edit dialog ── */}
                <Dialog
                    open={Boolean(editTarget)}
                    onClose={() => setEditTarget(null)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: "rgba(8,18,40,0.97)",
                            border: "1px solid rgba(56,189,248,0.18)",
                            borderRadius: 3,
                            backgroundImage: "none",
                            boxShadow: "0 24px 80px rgba(2,6,23,0.7)",
                        },
                    }}
                    slotProps={{
                        backdrop: { sx: { backdropFilter: "blur(4px)", bgcolor: "rgba(2,6,23,0.55)" } },
                    }}
                >
                    <DialogContent sx={{ p: 0 }}>

                        {/* Header */}
                        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box>
                                <Typography sx={{ fontSize: 11, color: "rgba(56,189,248,0.7)", fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
                                    REMARQUES & QUESTIONS
                                </Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                                    {editTarget?.title}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "rgba(226,232,240,0.4)", mt: 0.3 }}>
                                    Visible par le prestataire
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={() => setEditTarget(null)}
                                size="small"
                                sx={{ color: "rgba(226,232,240,0.5)", "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                        {/* Text field */}
                        <Box sx={{ px: 2.5, py: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                placeholder="Ex: Veuillez préciser la zone d'intervention, le délai de réponse, et corriger le tarif..."
                                value={editForm.remarques}
                                onChange={(e) => setEditForm({ remarques: e.target.value })}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(147,181,218,0.04)",
                                        borderRadius: 2,
                                        fontSize: 13,
                                        color: "#e2e8f0",
                                        "& fieldset": { borderColor: "rgba(56,189,248,0.2)" },
                                        "&:hover fieldset": { borderColor: "rgba(56,189,248,0.35)" },
                                        "&.Mui-focused fieldset": { borderColor: "rgba(56,189,248,0.5)" },
                                    },
                                    "& .MuiInputBase-input::placeholder": { color: "rgba(226,232,240,0.3)", fontSize: 13 },
                                }}
                            />
                        </Box>

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.07)" }} />

                        {/* Footer */}
                        <Box sx={{ px: 2.5, py: 2, display: "flex", gap: 1.5 }}>
                            <Box
                                onClick={() => setEditTarget(null)}
                                sx={{
                                    flex: 1, py: 1, borderRadius: 2, textAlign: "center",
                                    border: "1px solid rgba(147,181,218,0.2)",
                                    cursor: "pointer", transition: "all 0.2s",
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                                }}
                            >
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "rgba(226,232,240,0.5)" }}>
                                    Annuler
                                </Typography>
                            </Box>
                            <Box
                                onClick={handleEditSave}
                                sx={{
                                    flex: 1, py: 1, borderRadius: 2, textAlign: "center",
                                    bgcolor: editForm.remarques.trim() ? "rgba(56,189,248,0.12)" : "rgba(56,189,248,0.04)",
                                    border: `1px solid ${editForm.remarques.trim() ? "rgba(56,189,248,0.35)" : "rgba(56,189,248,0.1)"}`,
                                    cursor: editForm.remarques.trim() ? "pointer" : "not-allowed",
                                    transition: "all 0.2s",
                                    "&:hover": editForm.remarques.trim() ? { bgcolor: "rgba(56,189,248,0.18)" } : {},
                                }}
                            >
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: editForm.remarques.trim() ? "#38bdf8" : "rgba(56,189,248,0.3)" }}>
                                    Envoyer
                                </Typography>
                            </Box>
                        </Box>

                    </DialogContent>
                </Dialog>

                {/* ── Offer detail dialog ── */}
                <OfferDetailsDialog
                    open={dialogOpen}
                    offer={selectedOffer}
                    onClose={() => setDialogOpen(false)}
                    onEdit={(offer) => { setDialogOpen(false); handleEditOpen(offer); }}
                    onToggleStatus={(offer) => {
                        if (offer.status === "en_attente") setApproveTarget(offer);
                        else setRejectTarget(offer);
                        setDialogOpen(false);
                    }}
                />

            </Box>
        </Box>
    );
}
