import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import AdminLayout from "../../components/AdminLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import EventIcon from "@mui/icons-material/Event";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ClientFormModal from "./ClientFormModel";
import ConfirmDeactivateDialog from "./ConfirmDeactiveDialog";
import { useNavigate, useParams } from "react-router-dom";
import type { Client } from "../../Data/Client";
import {
    activateClient,
    deactivateClient,
    deleteClient,
    getClient,
    getClientReservations,
    updateClient,
    type AvisApi,
    type ClientApi,
    type ReservationApi,
} from "../../api/client";

const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: "Paiement en attente",
    CONFIRMED: "Confirmée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
    terminee: "Terminée",
    en_cours: "En cours",
    annulee: "Annulée",
    en_attente: "En attente",
};

function mapApiClient(c: ClientApi): Client {
    return {
        id: String(c.id),
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt ? c.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        isActive: c.active ?? true,
        ville: c.address,
    };
}

function toClientPayload(client: Client) {
    return {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        address: client.ville,
        active: client.isActive,
    };
}

function getProviderName(reservation: ReservationApi): string {
    const p = reservation.prestataire;
    if (!p) return "—";
    if (p.name) return p.name;
    if (p.firstName || p.lastName) return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
    return "—";
}

function getReservationServiceName(reservation: ReservationApi): string {
    return reservation.description || reservation.prestataire?.description || "Service";
}

function getReservationDate(reservation: ReservationApi): string {
    return reservation.reservationDate || reservation.date || "";
}

function getReservationAmount(reservation: ReservationApi): number {
    return Number(reservation.totalPrice ?? reservation.amount ?? 0);
}

function ConfirmDeleteDialog({ open, clientName, onConfirm, onCancel }: {
    open: boolean;
    clientName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: "rgba(8,18,40,0.97)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        borderRadius: 3,
                    },
                },
            }}
        >
            <DialogTitle sx={{ color: "#f8fafc", fontWeight: 700 }}>
                Supprimer le client
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ color: "#cbd5e1" }}>
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <strong style={{ color: "#f8fafc" }}>{clientName}</strong> ? Cette action est irréversible.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button onClick={onCancel} variant="outlined" sx={{ textTransform: "none", borderColor: "rgba(148,163,184,0.3)", color: "#94a3b8" }}>
                    Annuler
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error" sx={{ textTransform: "none", fontWeight: 700 }}>
                    Supprimer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function ClientProfilePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const clientId = Number(id);

    const [client, setClient] = useState<Client | null>(null);
    const [reservations, setReservations] = useState<ReservationApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const reviews = useMemo(() => {
        return reservations
            .filter((reservation) => reservation.avis)
            .map((reservation) => ({
                ...reservation.avis,
                providerName: reservation.avis?.prestaireName || getProviderName(reservation),
            })) as Array<AvisApi & { providerName: string }>;
    }, [reservations]);

    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            if (!clientId) {
                setError("Client introuvable");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [clientResponse, reservationsResponse] = await Promise.all([
                    getClient(clientId),
                    getClientReservations(clientId),
                ]);

                if (!mounted) return;

                setClient(mapApiClient(clientResponse));
                setReservations(reservationsResponse);
            } catch {
                if (mounted) setError("Erreur chargement profil client");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [clientId]);

    const handleSaveClient = async (updated: Client) => {
        try {
            setError("");
            const saved = await updateClient(Number(updated.id), toClientPayload(updated));
            setClient(mapApiClient(saved));
            setFormOpen(false);
        } catch (err: any) {
            if (err?.response?.status === 409) {
                setError("Cet email existe déjà");
                return;
            }
            setError(err?.response?.data?.message || "Erreur modification client");
        }
    };

    const handleToggleActive = async () => {
        if (!client) return;

        try {
            setError("");

            const saved = client.isActive
                ? await deactivateClient(Number(client.id))
                : await activateClient(Number(client.id));

            setClient(mapApiClient(saved));
            setConfirmDeactivate(false);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur changement statut client");
        }
    };

    const handleDeleteClient = async () => {
        if (!client) return;

        try {
            setError("");
            await deleteClient(Number(client.id));
            navigate("/clients");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur suppression client");
        }
    };

    if (loading) {
        return (
            <AdminLayout selected="clients">
                <Typography sx={{ color: "text.primary" }}>Chargement du profil...</Typography>
            </AdminLayout>
        );
    }

    if (!client) {
        return (
            <AdminLayout selected="clients">
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || "Client introuvable"}
                </Alert>
                <Button onClick={() => navigate("/clients")} startIcon={<ArrowBackIcon />} sx={{ textTransform: "none" }}>
                    Retour
                </Button>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout selected="clients">
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/clients")}
                sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
            >
                Retour à la liste
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ p: 3, mb: 3, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start" }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 28 }}>
                        {client.firstName[0]}{client.lastName[0]}
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {client.ville || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                            Inscrit le {new Date(client.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </Typography>
                        <Chip
                            icon={client.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                            label={client.isActive ? "Actif" : "Désactivé"}
                            color={client.isActive ? "success" : "default"}
                            size="small"
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button variant="outlined" startIcon={<EditIcon />} size="small" sx={{ textTransform: "none" }} onClick={() => setFormOpen(true)}>
                            Modifier
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={client.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                            size="small"
                            sx={{ textTransform: "none", color: "warning.main", borderColor: "warning.main" }}
                            onClick={() => client.isActive ? setConfirmDeactivate(true) : handleToggleActive()}
                        >
                            {client.isActive ? "Désactiver" : "Activer"}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            size="small"
                            sx={{ textTransform: "none", color: "error.main", borderColor: "error.main" }}
                            onClick={() => setConfirmDelete(true)}
                        >
                            Supprimer
                        </Button>
                    </Box>
                </Box>
            </Card>

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
                <Card sx={{ flex: 1, p: 2, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
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
                                ) : reservations.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{getReservationServiceName(r)}</TableCell>
                                        <TableCell>
                                            {getReservationDate(r) ? new Date(getReservationDate(r)).toLocaleDateString("fr-FR") : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={statusLabels[r.status] || r.status} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                                        </TableCell>
                                        <TableCell align="right">{getReservationAmount(r)} MAD</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                <Card sx={{ flex: 1, p: 2, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                        <RateReviewIcon fontSize="small" /> Avis laissés ({reviews.length})
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {reviews.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Aucun avis</Typography>
                        ) : reviews.map((rev) => (
                            <Paper key={rev.id} variant="outlined" sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.2)", borderColor: "rgba(147, 181, 218, 0.15)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} sx={{ fontSize: 16, color: i < rev.rating ? "warning.main" : "text.disabled" }} />
                                    ))}
                                    <Typography variant="caption" color="text.secondary">
                                        {rev.providerName} • {rev.createdDate ? new Date(rev.createdDate).toLocaleDateString("fr-FR") : "—"}
                                    </Typography>
                                </Box>
                                <Typography variant="body2">{rev.comment || "—"}</Typography>
                            </Paper>
                        ))}
                    </Box>
                </Card>
            </Box>

            <ClientFormModal
                open={formOpen}
                client={client}
                onClose={() => setFormOpen(false)}
                onSave={handleSaveClient}
            />

            <ConfirmDeactivateDialog
                open={confirmDeactivate}
                client={client}
                onConfirm={handleToggleActive}
                onCancel={() => setConfirmDeactivate(false)}
            />

            <ConfirmDeleteDialog
                open={confirmDelete}
                clientName={`${client.firstName} ${client.lastName}`}
                onConfirm={handleDeleteClient}
                onCancel={() => setConfirmDelete(false)}
            />
        </AdminLayout>
    );
}
