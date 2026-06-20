export type TransactionStatus = "paye" | "en_attente" | "rembourse" | "echoue";
export type PaymentMethod     = "carte" | "virement" | "cash";

export type PayoutStatus = "en_attente" | "verse";


export interface Transaction {
    id:             string;
    reservationId:  string;
    clientId:       string;
    clientName:     string;
    providerId:     string;
    providerName:   string;
    offerTitle:     string;
    category:       string;
    amount:         number;
    commission:     number;
    providerPayout: number;
    paymentMethod:  PaymentMethod;
    status:         TransactionStatus;
    cashConfirmed?: boolean;
    date:           string;
    updatedAt:      string;
    payoutStatus: PayoutStatus;
}