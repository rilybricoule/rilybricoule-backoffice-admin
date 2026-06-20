

export type OfferStatus = "active" | "masquee" | "en_attente" | "en_attente_ajustement";

export interface Offer {
    id: string;
    title: string;
    description: string;
    providerName: string;
    providerId: string;
    category: string;
    price: number;
    status: OfferStatus;
    maskReason?: string;
    createdAt: string;
    updatedAt: string;
}