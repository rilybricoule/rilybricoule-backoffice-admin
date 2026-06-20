import api from "./api";

export type ServiceOfferStatus = "active" | "en_attente" | "masquee" | "en_attente_ajustement";

export interface AdminServiceOfferApi {
    id: number;
    title: string;
    description: string | null;
    price: number;
    category: string | null;
    imageUrl: string | null;
    active: boolean;
    moderationStatus: "PENDING" | "APPROVED" | "HIDDEN" | "ADJUSTMENT_REQUIRED";
    moderationNote: string | null;
    providerId: number | null;
    providerName: string | null;
    providerEmail: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface Offer {
    id: string;
    title: string;
    description: string;
    providerName: string;
    providerId: string;
    category: string;
    price: number;
    status: ServiceOfferStatus;
    maskReason?: string;
    createdAt: string;
    updatedAt: string;
}

export function mapServiceOffer(apiOffer: AdminServiceOfferApi): Offer {
    return {
        id: String(apiOffer.id),
        title: apiOffer.title,
        description: apiOffer.description ?? "",
        providerName: apiOffer.providerName ?? "Prestataire",
        providerId: apiOffer.providerId == null ? "" : String(apiOffer.providerId),
        category: apiOffer.category ?? "—",
        price: Number(apiOffer.price ?? 0),
        status: mapStatus(apiOffer.moderationStatus),
        maskReason: apiOffer.moderationNote ?? undefined,
        createdAt: apiOffer.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        updatedAt: apiOffer.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    };
}

function mapStatus(status: AdminServiceOfferApi["moderationStatus"]): ServiceOfferStatus {
    if (status === "APPROVED") return "active";
    if (status === "HIDDEN") return "masquee";
    if (status === "ADJUSTMENT_REQUIRED") return "en_attente_ajustement";
    return "en_attente";
}

export async function getAdminServiceOffers(): Promise<Offer[]> {
    const response = await api.get<AdminServiceOfferApi[]>("/admin/services");
    return response.data.map(mapServiceOffer);
}

export async function approveServiceOffer(id: string): Promise<Offer> {
    const response = await api.patch<AdminServiceOfferApi>(`/admin/services/${id}/approve`);
    return mapServiceOffer(response.data);
}

export async function hideServiceOffer(id: string, note?: string): Promise<Offer> {
    const response = await api.patch<AdminServiceOfferApi>(`/admin/services/${id}/hide`, { note });
    return mapServiceOffer(response.data);
}

export async function requestServiceOfferAdjustment(id: string, note?: string): Promise<Offer> {
    const response = await api.patch<AdminServiceOfferApi>(`/admin/services/${id}/request-adjustment`, { note });
    return mapServiceOffer(response.data);
}
