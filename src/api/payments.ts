import api from "./api";
import type {
    AdminPayment,
    CommissionStatus,
    PaymentMethod,
    PaymentStatus,
    PayoutStatus,
} from "../Data/Payment";

export interface AdminPaymentApi {
    id: number;
    reservationId: number | null;

    clientId: number | null;
    clientName: string | null;
    clientEmail: string | null;

    providerId: number | null;
    providerName: string | null;
    providerEmail: string | null;

    serviceId: number | null;
    serviceName: string | null;
    category: string | null;

    amount: number | null;
    commission: number | null;
    providerPayout: number | null;

    paymentMethod: string | null;
    paymentStatus: string | null;
    payoutStatus: string | null;
    commissionStatus: string | null;

    transactionId: string | null;
    paymentDate: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export function mapAdminPayment(item: AdminPaymentApi): AdminPayment {
    return {
        id: String(item.id),
        reservationId: item.reservationId == null ? "" : String(item.reservationId),

        clientId: item.clientId == null ? "" : String(item.clientId),
        clientName: item.clientName ?? "Client",
        clientEmail: item.clientEmail ?? undefined,

        providerId: item.providerId == null ? "" : String(item.providerId),
        providerName: item.providerName ?? "Prestataire",
        providerEmail: item.providerEmail ?? undefined,

        serviceId: item.serviceId == null ? undefined : String(item.serviceId),
        serviceName: item.serviceName ?? `Réservation #${item.reservationId ?? item.id}`,
        category: item.category ?? "",

        amount: Number(item.amount ?? 0),
        commission: Number(item.commission ?? 0),
        providerPayout: Number(item.providerPayout ?? 0),

        paymentMethod: mapPaymentMethod(item.paymentMethod),
        paymentStatus: mapPaymentStatus(item.paymentStatus),
        payoutStatus: mapPayoutStatus(item.payoutStatus),
        commissionStatus: mapCommissionStatus(item.commissionStatus),

        transactionId: item.transactionId ?? undefined,
        paymentDate: item.paymentDate ?? undefined,
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? new Date().toISOString(),
    };
}

function mapPaymentMethod(method: string | null): PaymentMethod {
    const value = (method ?? "").toLowerCase();

    if (
        value.includes("card") ||
        value.includes("carte") ||
        value.includes("cmi")
    ) {
        return "carte";
    }

    return "especes";
}

function mapPaymentStatus(status: string | null): PaymentStatus {
    const value = (status ?? "").toUpperCase();

    if (value === "SUCCESS" || value === "PAID" || value === "PAYE") return "paye";
    if (value === "FAILED" || value === "ERROR" || value === "ECHOUE") return "echoue";
    if (value === "REFUNDED" || value === "REMBOURSE") return "rembourse";

    return "en_attente";
}

function mapPayoutStatus(status: string | null): PayoutStatus {
    const value = (status ?? "").toUpperCase();

    if (value === "PAID" || value === "VERSE") return "verse";

    return "en_attente";
}

function mapCommissionStatus(status: string | null): CommissionStatus {
    const value = (status ?? "").toUpperCase();

    if (value === "RECEIVED" || value === "RECUE") return "recue";

    return "en_attente";
}

function toBackendPaymentStatus(status: PaymentStatus) {
    if (status === "paye") return "SUCCESS";
    if (status === "echoue") return "FAILED";
    if (status === "rembourse") return "REFUNDED";

    return "PENDING";
}

function toBackendPayoutStatus(status: PayoutStatus) {
    return status === "verse" ? "PAID" : "PENDING";
}

function toBackendCommissionStatus(status: CommissionStatus) {
    return status === "recue" ? "RECEIVED" : "PENDING";
}

export async function getAdminPayments(reservationId?: string): Promise<AdminPayment[]> {
    const response = await api.get<AdminPaymentApi[]>("/admin/payments", {
        params: reservationId ? { reservationId } : undefined,
    });

    return response.data.map(mapAdminPayment);
}


export async function updateAdminPaymentStatus(
    id: string,
    status: PaymentStatus
): Promise<AdminPayment> {
    const response = await api.patch<AdminPaymentApi>(
        `/admin/payments/${id}/status`,
        { status: toBackendPaymentStatus(status) }
    );

    return mapAdminPayment(response.data);
}

export async function updateAdminPayoutStatus(
    id: string,
    status: PayoutStatus
): Promise<AdminPayment> {
    const response = await api.patch<AdminPaymentApi>(
        `/admin/payments/${id}/payout-status`,
        { status: toBackendPayoutStatus(status) }
    );

    return mapAdminPayment(response.data);
}

export async function updateAdminCommissionStatus(
    id: string,
    status: CommissionStatus
): Promise<AdminPayment> {
    const response = await api.patch<AdminPaymentApi>(
        `/admin/payments/${id}/commission-status`,
        { status: toBackendCommissionStatus(status) }
    );

    return mapAdminPayment(response.data);
}
