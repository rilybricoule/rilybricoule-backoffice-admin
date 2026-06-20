export type ReservationStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";


export type PaymentMethod = "carte" | "especes";

export type PaymentStatus =
    | "en_attente"
    | "paye"
    | "rembourse"
    | "echoue";

export type PayoutStatus = "en_attente" | "verse";

export type CommissionStatus = "en_attente" | "recue";

export interface ReservationMessage {
    from: "client" | "prestataire" | "admin";
    name: string;
    message: string;
    date: string;
}

export interface Reservation {
    id: string;

    clientId: string;
    clientName: string;
    clientEmail?: string;

    providerId: string;
    providerName: string;
    providerEmail?: string;

    serviceId?: string;
    serviceName: string;

    category: string;
    scheduledDate: string;
    scheduledTime: string;

    amount: number;
    commission: number;
    providerPayout: number;


    paymentId?: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    payoutStatus: PayoutStatus;
    commissionStatus: CommissionStatus;

    status: ReservationStatus;

    address?: string;
    cancelReason?: string;
    adminNote?: string;

    messages: ReservationMessage[];

    createdAt: string;
    updatedAt: string;
}
