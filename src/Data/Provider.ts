export type ProviderStatus = "pending" | "approved" | "suspended" | "rejected";

export type Provider = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdAt: string;
    status: ProviderStatus;
    avatar?: string;
    businessName?: string;
    documents: ProviderDocument[];
    serviceCategories: string[];
    rates?: { categoryId: string; categoryName: string; price: number }[];
    adminComment?: string;
    rejectedAt?: string;
    approvedAt?: string;
    suspendedAt?: string;
};

export type ProviderDocument = {
    id: string;
    type: "id_card" | "professional_certificate" | "insurance" | "other";
    label: string;
    url: string;
    verified: boolean;
    uploadedAt: string;
};