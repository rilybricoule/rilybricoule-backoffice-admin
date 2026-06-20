import { useEffect, useState } from "react";
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
    DialogContentText,
    DialogTitle,
    Paper,
    Typography,
} from "@mui/material";
import AdminLayout from "../../components/AdminLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import StarIcon from "@mui/icons-material/Star";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import {
    approveProvider,
    fetchAdminProvider,
    fetchProviderDocuments,
    fetchProviderReviews,
    reactivateProvider,
    rejectProvider,
    suspendProvider,
    updateProviderDocumentStatus,
    type AdminProvider,
    type ProviderDocument,
    type ProviderDocumentStatus,
    type ProviderReviewApi,
    type ProviderStatus,
} from "../../api/providers";
import { useNavigate, useParams } from "react-router-dom";
import { useProviders } from "../context/ProviderContext";

const statusConfig: Record<
    ProviderStatus,
    { label: string; color: "success" | "warning" | "error" | "default" }
> = {
    pending: { label: "En attente de validation", color: "warning" },
    approved: { label: "Approuve", color: "success" },
    suspended: { label: "Suspendu", color: "error" },
    rejected: { label: "Rejete", color: "default" },
};

function getProviderFullName(provider: AdminProvider) {
    const fullName = `${provider.firstName ?? ""} ${provider.lastName ?? ""}`.trim();
    return fullName || provider.name || provider.businessName || provider.email;
}

function getProviderInitials(provider: AdminProvider) {
    return getProviderFullName(provider)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatDate(value?: string) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

type ProviderAction = "approve" | "reject" | "suspend" | "reactivate";

export default function ProviderProfilePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateProvider } = useProviders();

    const providerId = Number(id);

    const [provider, setProvider] = useState<AdminProvider | null>(null);
    const [reviews, setReviews] = useState<ProviderReviewApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmAction, setConfirmAction] = useState<ProviderAction | null>(null);

    const [documents, setDocuments] = useState<ProviderDocument[]>([]);


    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            if (!Number.isFinite(providerId) || providerId <= 0) {
                setError("Prestataire introuvable");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [providerResponse, reviewsResponse, documentsResponse] = await Promise.all([
                    fetchAdminProvider(providerId),
                    fetchProviderReviews(providerId).catch(() => []),
                    fetchProviderDocuments(providerId).catch(() => []),
                ]);

                if (!mounted) return;

                setProvider(providerResponse);
                setReviews(reviewsResponse);
                setDocuments(documentsResponse);
            } catch (err: any) {
                if (mounted) {
                    setError(err?.response?.data?.message || "Erreur chargement profil prestataire");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, [providerId]);

    const handleDocumentStatus = async (
        documentId: number,
        status: ProviderDocumentStatus
    ) => {
        try {
            setError("");

            const updated = await updateProviderDocumentStatus(documentId, status);

            setDocuments((prev) =>
                prev.map((document) =>
                    document.id === updated.id ? updated : document
                )
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur validation document");
        }
    };

    const handleConfirm = async () => {
        if (!provider || !confirmAction) return;

        try {
            setError("");

            const updated =
                confirmAction === "approve"
                    ? await approveProvider(provider.id)
                    : confirmAction === "reject"
                        ? await rejectProvider(provider.id)
                        : confirmAction === "suspend"
                            ? await suspendProvider(provider.id)
                            : await reactivateProvider(provider.id);

            setProvider(updated);
            updateProvider(updated);
            setConfirmAction(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur changement statut prestataire");
        }
    };

    const closeDialog = () => {
        setConfirmAction(null);
    };

    if (loading) {
        return (
            <AdminLayout selected="providers">
                <Typography sx={{ color: "text.primary" }}>Chargement du profil...</Typography>
            </AdminLayout>
        );
    }

    if (!provider) {
        return (
            <AdminLayout selected="providers">
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || "Prestataire introuvable"}
                </Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/providers")} sx={{ textTransform: "none" }}>
                    Retour a la liste
                </Button>
            </AdminLayout>
        );
    }

    const config = statusConfig[provider.status];
    const fullName = getProviderFullName(provider);

    return (
        <AdminLayout selected="providers">
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/providers")}
                sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
            >
                Retour a la liste
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ p: 3, mb: 3, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "flex-start" }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 28 }}>
                        {getProviderInitials(provider)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 240 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 0.5 }}>
                            {fullName}
                        </Typography>

                        {provider.businessName && (
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                {provider.businessName}
                            </Typography>
                        )}

                        <Box sx={{ display: "grid", gap: 0.7, mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 16 }} /> {provider.email}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 16 }} /> {provider.phone || "-"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LocationOnIcon sx={{ fontSize: 16 }} /> {provider.address || provider.city || "-"}
                            </Typography>
                        </Box>

                        {provider.description && (
                            <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, bgcolor: "rgba(0,0,0,0.18)", borderColor: "rgba(147,181,218,0.16)" }}>
                                <Typography variant="body2" color="text.secondary">
                                    {provider.description}
                                </Typography>
                            </Paper>
                        )}

                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                            Inscrit le {formatDate(provider.createdAt)}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                            <Chip
                                icon={
                                    config.color === "success"
                                        ? <CheckCircleIcon />
                                        : config.color === "error"
                                            ? <BlockIcon />
                                            : config.color === "default"
                                                ? <CancelIcon />
                                                : undefined
                                }
                                label={config.label}
                                color={config.color}
                                size="small"
                            />

                            <Chip
                                icon={<VerifiedIcon />}
                                label={provider.verified ? "Verifie" : "Non verifie"}
                                color={provider.verified ? "success" : "warning"}
                                size="small"
                                variant="outlined"
                            />

                            <Chip
                                icon={<WorkIcon />}
                                label={provider.available ? "Disponible" : "Indisponible"}
                                color={provider.available ? "success" : "default"}
                                size="small"
                                variant="outlined"
                            />

                            <Chip
                                icon={<StarIcon sx={{ color: "warning.main" }} />}
                                label={`${provider.averageRating.toFixed(1)} (${reviews.length} avis)`}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: "warning.main", color: "warning.main" }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {provider.status === "pending" && (
                            <>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    size="small"
                                    sx={{ textTransform: "none" }}
                                    onClick={() => setConfirmAction("approve")}
                                >
                                    Approuver
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    size="small"
                                    sx={{ textTransform: "none" }}
                                    onClick={() => setConfirmAction("reject")}
                                >
                                    Rejeter
                                </Button>
                            </>
                        )}

                        {provider.status === "approved" && (
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<BlockIcon />}
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => setConfirmAction("suspend")}
                            >
                                Suspendre
                            </Button>
                        )}

                        {(provider.status === "suspended" || provider.status === "rejected") && (
                            <Button
                                variant="outlined"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                size="small"
                                sx={{ textTransform: "none" }}
                                onClick={() => setConfirmAction("reactivate")}
                            >
                                Reactiver
                            </Button>
                        )}
                    </Box>
                </Box>
            </Card>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <Card sx={{ p: 2, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                        Performance
                    </Typography>

                    <Box sx={{ display: "grid", gap: 1.5 }}>
                        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.2)", borderColor: "rgba(147,181,218,0.15)" }}>
                            <Typography variant="caption" color="text.secondary">Interventions terminees</Typography>
                            <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary" }}>
                                {provider.completedInterventions}
                            </Typography>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.2)", borderColor: "rgba(147,181,218,0.15)" }}>
                            <Typography variant="caption" color="text.secondary">Note moyenne</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                                <StarIcon sx={{ color: "warning.main" }} />
                                <Typography variant="h5" fontWeight={800} sx={{ color: "warning.main" }}>
                                    {provider.averageRating.toFixed(1)}
                                </Typography>
                                <Typography color="text.secondary">/ 5</Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Card>

                <Card sx={{ p: 2, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                        <RateReviewIcon fontSize="small" /> Avis recus ({reviews.length})
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 320, overflowY: "auto" }}>
                        {reviews.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Aucun avis pour le moment
                            </Typography>
                        ) : reviews.map((review) => (
                            <Paper
                                key={review.id}
                                variant="outlined"
                                sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.2)", borderColor: "rgba(147, 181, 218, 0.15)" }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                    {[...Array(5)].map((_, index) => (
                                        <StarIcon
                                            key={index}
                                            sx={{ fontSize: 16, color: index < review.rating ? "warning.main" : "text.disabled" }}
                                        />
                                    ))}
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(review.createdDate)}
                                    </Typography>
                                </Box>

                                <Typography variant="body2">
                                    {review.comment || "-"}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Card>
            </Box>
            <Card sx={{ mt: 2, p: 2, bgcolor: "rgba(10, 37, 77, 0.6)", border: "1px solid rgba(147, 181, 218, 0.2)", borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                    Documents et certificats
                </Typography>

                {documents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Aucun document ou certificat n'est encore disponible pour ce prestataire.
                    </Typography>
                ) : (
                    <Box sx={{ display: "grid", gap: 1.5 }}>
                        {documents.map((document) => (
                            <Paper
                                key={document.id}
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    bgcolor: "rgba(0,0,0,0.2)",
                                    borderColor: "rgba(147, 181, 218, 0.15)",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>
                                            {document.originalFileName || document.type}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            Type: {document.type} - Statut: {document.status}
                                        </Typography>

                                        {document.reviewNote && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                                Note: {document.reviewNote}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            href={document.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            sx={{ textTransform: "none" }}
                                        >
                                            Ouvrir
                                        </Button>

                                        {document.status === "PENDING" && (
                                            <>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => void handleDocumentStatus(document.id, "APPROVED")}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    Approuver
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => void handleDocumentStatus(document.id, "REJECTED")}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    Rejeter
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Card>

            <Dialog open={confirmAction === "approve"} onClose={closeDialog}>
                <DialogTitle>Confirmer l&apos;approbation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Etes-vous sur de vouloir approuver {fullName} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Annuler</Button>
                    <Button variant="contained" color="success" onClick={() => void handleConfirm()}>Confirmer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmAction === "reject"} onClose={closeDialog}>
                <DialogTitle>Confirmer le rejet</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Etes-vous sur de vouloir rejeter {fullName} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Annuler</Button>
                    <Button variant="contained" color="error" onClick={() => void handleConfirm()}>Confirmer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmAction === "suspend"} onClose={closeDialog}>
                <DialogTitle>Confirmer la suspension</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Etes-vous sur de vouloir suspendre {fullName} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Annuler</Button>
                    <Button variant="contained" color="warning" onClick={() => void handleConfirm()}>Confirmer</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmAction === "reactivate"} onClose={closeDialog}>
                <DialogTitle>Confirmer la reactivation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Etes-vous sur de vouloir reactiver {fullName} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Annuler</Button>
                    <Button variant="contained" color="success" onClick={() => void handleConfirm()}>Confirmer</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}