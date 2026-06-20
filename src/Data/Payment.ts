export type PaymentStatus = "en_attente" | "paye" | "rembourse" | "echoue";
export type PaymentMethod = "carte" | "especes";
export type PayoutStatus = "en_attente" | "verse";
export type CommissionStatus = "en_attente" | "recue";

export interface AdminPayment {
    id: string;
    reservationId: string;

    clientId: string;
    clientName: string;
    clientEmail?: string;

    providerId: string;
    providerName: string;
    providerEmail?: string;

    serviceId?: string;
    serviceName: string;
    category: string;

    amount: number;
    commission: number;
    providerPayout: number;

    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    payoutStatus: PayoutStatus;
    commissionStatus: CommissionStatus;

    transactionId?: string;
    paymentDate?: string;
    createdAt: string;
    updatedAt: string;
}
