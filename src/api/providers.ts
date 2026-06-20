import api from "./api";

export type ProviderStatus = "pending" | "approved" | "suspended" | "rejected";
export type BackendProviderStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

export type AdminProviderApi = {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    name?: string;
    businessName?: string;
    description?: string;
    address?: string;
    enabled?: boolean;
    status?: BackendProviderStatus | ProviderStatus | null;
    verified: boolean;
    available: boolean;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    completedInterventions?: number;
    averageRating?: number;
    adminComment?: string | null;
};

export type AdminProvider = Omit<
    AdminProviderApi,
    "status" | "completedInterventions" | "averageRating" | "adminComment"
> & {
    status: ProviderStatus;
    completedInterventions: number;
    averageRating: number;
    adminComment?: string | null;
};

export type ProviderReviewApi = {
    id: number;
    rating: number;
    comment?: string;
    createdDate?: string;
    reservationId?: number;
    prestaireId?: number;
    prestaireName?: string;
};

function mapProviderStatus(provider: AdminProviderApi): ProviderStatus {
    const raw = String(provider.status ?? "").trim().toUpperCase();

    if (raw === "PENDING") return "pending";
    if (raw === "APPROVED") return "approved";
    if (raw === "SUSPENDED") return "suspended";
    if (raw === "REJECTED") return "rejected";

    if (provider.available === false || provider.enabled === false || provider.active === false) {
        return "suspended";
    }

    if (provider.verified) return "approved";

    return "pending";
}

function normalizeProvider(provider: AdminProviderApi): AdminProvider {
    return {
        ...provider,
        status: mapProviderStatus(provider),
        completedInterventions: provider.completedInterventions ?? 0,
        averageRating: provider.averageRating ?? 0,
        adminComment: provider.adminComment ?? null,
    };
}

export async function fetchAdminProviders(): Promise<AdminProvider[]> {
    const { data } = await api.get<AdminProviderApi[]>("/admin/prestataires");
    return data.map(normalizeProvider);
}

export async function fetchAdminProvider(id: number): Promise<AdminProvider> {
    const { data } = await api.get<AdminProviderApi>(`/admin/prestataires/${id}`);
    return normalizeProvider(data);
}

export async function approveProvider(id: number): Promise<AdminProvider> {
    const { data } = await api.patch<AdminProviderApi>(`/admin/prestataires/${id}/approve`);
    return normalizeProvider(data);
}

export async function rejectProvider(id: number): Promise<AdminProvider> {
    const { data } = await api.patch<AdminProviderApi>(`/admin/prestataires/${id}/reject`);
    return normalizeProvider(data);
}

export async function suspendProvider(id: number): Promise<AdminProvider> {
    const { data } = await api.patch<AdminProviderApi>(`/admin/prestataires/${id}/suspend`);
    return normalizeProvider(data);
}

export async function reactivateProvider(id: number): Promise<AdminProvider> {
    const { data } = await api.patch<AdminProviderApi>(`/admin/prestataires/${id}/reactivate`);
    return normalizeProvider(data);
}

export async function fetchProviderReviews(id: number): Promise<ProviderReviewApi[]> {
    const { data } = await api.get<ProviderReviewApi[]>(`/avis/prestataire/${id}`);
    return data;
}
export type ProviderDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProviderDocumentType =
    | "CIN"
    | "CERTIFICATE"
    | "INSURANCE"
    | "PORTFOLIO"
    | "OTHER";

export type ProviderDocument = {
    id: number;
    prestataireId: number;
    type: ProviderDocumentType;
    fileUrl: string;
    originalFileName?: string | null;
    contentType?: string | null;
    fileSize?: number | null;
    status: ProviderDocumentStatus;
    reviewNote?: string | null;
    reviewedByAdminId?: number | null;
    createdAt?: string;
    reviewedAt?: string | null;
};

export async function fetchProviderDocuments(
    providerId: number
): Promise<ProviderDocument[]> {
    const { data } = await api.get<ProviderDocument[]>(
        `/admin/prestataires/${providerId}/documents`
    );

    return data;
}

export async function updateProviderDocumentStatus(
    documentId: number,
    status: ProviderDocumentStatus,
    reviewNote?: string
): Promise<ProviderDocument> {
    const { data } = await api.patch<ProviderDocument>(
        `/admin/prestataires/documents/${documentId}/status`,
        {
            status,
            reviewNote,
        }
    );

    return data;
}

export async function deleteProviderDocument(documentId: number): Promise<void> {
    await api.delete(`/admin/prestataires/documents/${documentId}`);
}