import { useState, useMemo, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import { navigateTo } from "../../utiles/Navigation";
import { usePagination } from "../hooks/usePagination";
import type { Reservation, ReservationStatus } from "../../Data/Reservation";
import { useReservations } from "../context/Reservationcontext";

import ReservationFilters from "./components/ReservationFilters";
import ReservationRow from "./components/ReservationRow";
import ReservationDetailDrawer from "./components/ReservationDetailDrawer";
import AppPagination from "../../components/AppPagination";

const dialogPaperSx = {
    bgcolor: "rgba(10,37,77,0.98)",
    border: "1px solid rgba(147,181,218,0.2)",
    minWidth: 420,
};

export default function ReservationsPage() {
    const {
        reservations,
        loadingReservations,
        reservationsError,
        markAsRéservé,
        markAsCompleted,
        markAsAnnulee,
        updateReservationNote,
    } = useReservations();

    const [actionError, setActionError] = useState("");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const detailId = searchParams.get("detail");
    const reservationFilterId = searchParams.get("reservation");

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("reservations");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");

    const [detailRes, setDetailRes] = useState<Reservation | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
    const [cancelReason, setCancelReason] = useState("");



    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    useEffect(() => {
        if (!detailId) return;

        setDetailRes(
            reservations.find((item) => item.id === detailId) ?? null
        );
    }, [detailId, reservations]);

    const handleCancelConfirm = async () => {
        if (!cancelTarget) return;

        try {
            setActionError("");

            await markAsAnnulee(cancelTarget.id, cancelReason);

            setCancelTarget(null);
            setCancelReason("");
        } catch (err: any) {
            setActionError(
                err?.response?.data?.message || "Erreur annulation réservation"
            );
        }
    };

    const handleSimulateProviderStatus = async (reservation: Reservation) => {
        try {
            setActionError("");

            if (reservation.status !== "confirmed") {
                return;
            }

            await markAsCompleted(reservation.id);
        } catch (err: any) {
            setActionError(
                err?.response?.data?.message || "Erreur mise à jour réservation"
            );
        }
    };
    const handleAdminNote = async (id: string, note: string) => {
        try {
            setActionError("");

            await updateReservationNote(id, note);
        } catch (err: any) {
            setActionError(err?.response?.data?.message || "Erreur note admin");
        }
    };

    const categories = useMemo(() => {
        return Array.from(
            new Set(reservations.map((reservation) => reservation.category).filter(Boolean))
        ).sort();
    }, [reservations]);

    const counts = useMemo(() => ({
        all: reservations.length,

        pending_payment: reservations.filter(
            (reservation) => reservation.status === "pending"
        ).length,

        confirmed: reservations.filter(
            (reservation) => reservation.status === "confirmed"
        ).length,

        completed: reservations.filter(
            (reservation) => reservation.status === "completed"
        ).length,

        cancelled: reservations.filter(
            (reservation) => reservation.status === "cancelled"
        ).length,
    }), [reservations]);

    const totals = useMemo(() => ({
        pendingPayment: reservations.filter(
            (reservation) => reservation.status === "pending"
        ).length,

        confirmed: reservations.filter(
            (reservation) => reservation.status === "confirmed"
        ).length,

        completed: reservations.filter(
            (reservation) => reservation.status === "completed"
        ).length,

        cancelled: reservations.filter(
            (reservation) => reservation.status === "cancelled"
        ).length,

        cashEnAttente: reservations.filter(
            (reservation) =>
                reservation.paymentMethod === "especes" &&
                reservation.status === "completed" &&
                reservation.commissionStatus === "en_attente"
        ).length,
    }), [reservations]);

    const filteredReservations = useMemo(() => {
        const activeReservationId = reservationFilterId ?? detailId;
        const baseReservations = activeReservationId
            ? reservations.filter((reservation) => String(reservation.id) === String(activeReservationId))
            : reservations;


        return baseReservations.filter((reservation) => {
            const matchesStatus =
                statusFilter === "all" || reservation.status === statusFilter;

            const matchesCategory =
                categoryFilter === "all" || reservation.category === categoryFilter;

            const matchesMethod =
                methodFilter === "all" || reservation.paymentMethod === methodFilter;

            const q = search.trim().toLowerCase();

            const matchesSearch =
                !q ||
                [
                    reservation.clientName,
                    reservation.providerName,
                    reservation.serviceName,
                    reservation.category,
                ].some((field) =>
                    (field ?? "").toLowerCase().includes(q)
                );

            return matchesStatus && matchesCategory && matchesMethod && matchesSearch;
        });
    }, [reservations, statusFilter, categoryFilter, methodFilter, search,detailId,reservationFilterId]);

    const {
        paginated: paginatedRows,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        total,
    } = usePagination(filteredReservations);

    useEffect(() => {
        setPage(0);
    }, [search, statusFilter, categoryFilter, methodFilter, setPage,detailId,reservationFilterId]);

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar
                onToggleSidebar={() => setSidebarOpen((value) => !value)}
                onLogout={handleLogout}
            />

            <Sidebar
                open={sidebarOpen}
                selected={selected}
                onSelect={(id) => {
                    setSelected(id);
                    navigateTo(id, navigate);
                }}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    minHeight: "100vh",
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Toolbar />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                        Suivi des réservations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestion des demandes de service
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            lg: "repeat(4, 1fr)",
                        },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    {[
                        {
                            label: "Paiement en attente",
                            value: totals.pendingPayment,
                            color: "warning.main",
                        },
                        {
                            label: "Confirmées",
                            value: totals.confirmed,
                            color: "info.main",
                        },
                        {
                            label: "Terminées",
                            value: totals.completed,
                            color: "success.main",
                        },
                        {
                            label: "Annulées",
                            value: totals.cancelled,
                            color: "error.main",
                        },
                    ].map((card) => (
                        <Box
                            key={card.label}
                            sx={{
                                p: 2,
                                bgcolor: "rgba(10,37,77,0.6)",
                                border: "1px solid rgba(147,181,218,0.2)",
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                            >
                                {card.label}
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ color: card.color, mt: 0.5 }}
                            >
                                {card.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <ReservationFilters
                    search={search}
                    onSearch={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilter={setStatusFilter}
                    categoryFilter={categoryFilter}
                    onCategoryFilter={setCategoryFilter}
                    methodFilter={methodFilter}
                    onMethodFilter={setMethodFilter}
                    categories={categories}
                    counts={counts}
                />

                {(reservationsError || actionError) && (
                    <Typography sx={{ mb: 2, color: "error.main", fontWeight: 700 }}>
                        {reservationsError || actionError}
                    </Typography>
                )}

                {loadingReservations && (
                    <Typography sx={{ mb: 2, color: "text.secondary" }}>
                        Chargement des réservations...
                    </Typography>
                )}

                <TableContainer
                    component={Paper}
                    sx={{
                        bgcolor: "rgba(10,37,77,0.6)",
                        border: "1px solid rgba(147,181,218,0.2)",
                        borderRadius: 2,
                        maxHeight: 560,
                        "& .MuiTableHead-root .MuiTableCell-root": {
                            fontWeight: 600,
                            color: "text.secondary",
                            borderBottom: "1px solid rgba(147,181,218,0.25)",
                            bgcolor: "rgba(15,45,90,0.95)",
                        },
                        "& .MuiTableBody-root .MuiTableRow-root:hover": {
                            bgcolor: "rgba(255,255,255,0.04)",
                        },
                        "& .MuiTableCell-root": {
                            borderBottom: "1px solid rgba(147,181,218,0.12)",
                            color: "text.primary",
                        },
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Réservation</TableCell>

                                <TableCell>Client</TableCell>
                                <TableCell>Prestataire</TableCell>
                                <TableCell>Date prévue</TableCell>
                                <TableCell align="center">Méthode</TableCell>
                                <TableCell align="center">Statut</TableCell>
                                <TableCell align="center">Paiement</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRows.map((reservation) => (
                                <ReservationRow
                                    key={reservation.id}
                                    reservation={reservation}
                                    onView={() => setDetailRes(reservation)}
                                    onSimulateCompleted={() => handleSimulateProviderStatus(reservation)}
                                    onAnnulee={() => setCancelTarget(reservation)}
                                />
                            ))}

                            {!loadingReservations && paginatedRows.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        sx={{
                                            py: 5,
                                            color: "text.secondary",
                                            textAlign: "center",
                                        }}
                                    >
                                        Aucune réservation trouvée
                                    </TableCell>
                                </TableRow>
                            )}
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

                <Dialog
                    open={Boolean(cancelTarget)}
                    onClose={() => setCancelTarget(null)}
                    PaperProps={{ sx: dialogPaperSx }}
                >
                    <DialogTitle>Annuler la réservation ?</DialogTitle>

                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            La réservation{" "}
                            <strong>{cancelTarget?.serviceName ?? "sélectionnée"}</strong>{" "}
                            sera annulée.
                        </DialogContentText>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Raison de l'annulation"
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                            size="small"
                        />
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setCancelTarget(null)}>
                            Fermer
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleCancelConfirm}
                            disabled={!cancelReason.trim()}
                        >
                            Confirmer
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>

            <ReservationDetailDrawer
                reservation={detailRes}
                onClose={() => {
                    setDetailRes(null);

                    if (detailId) {
                        navigate("/reservations");
                    }
                }}
                onCancel={(reservation) => setCancelTarget(reservation)}
                onSimulateCompleted={(reservation) => handleSimulateProviderStatus(reservation)}
                onSendMessage={handleAdminNote}
                onReschedule={() => {}}
                onResetStatus={() => {}}
                onReassign={() => {}}
            />
        </Box>
    );
}
