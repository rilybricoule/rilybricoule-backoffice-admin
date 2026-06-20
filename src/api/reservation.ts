import api from "./api";
import type {
    Reservation,
    ReservationStatus,
    PaymentStatus,
} from "../Data/Reservation";

export interface AdminReservationApi {
    id: number;

    clientId: number | null;
    clientName: string | null;
    clientEmail: string | null;

    providerId: number | null;
    providerName: string | null;
    providerEmail: string | null;

    serviceId: number | null;
    serviceName: string | null;
    category: string | null;

    scheduledDate: string | null;
    scheduledTime: string | null;

    amount: number | null;
    discountAmount: number | null;

    status: "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

    paymentId: number | null;


    paymentMethod: string | null;
    paymentStatus: string | null;

    address: string | null;
    latitude: number | null;
    longitude: number | null;

    cancelledAt: string | null;
    cancelReason: string | null;
    adminNote: string | null;

    createdAt: string | null;
    updatedAt: string | null;
}

export function mapAdminReservation(item: AdminReservationApi): Reservation {
    const amount = Number(item.amount ?? 0);
    const commission = Math.round(amount * 0.15 * 100) / 100;

    return {
        id: String(item.id),

        clientId: item.clientId == null ? "" : String(item.clientId),
        clientName: item.clientName ?? "Client",
        clientEmail: item.clientEmail ?? undefined,

        providerId: item.providerId == null ? "" : String(item.providerId),
        providerName: item.providerName ?? "Prestataire",
        providerEmail: item.providerEmail ?? undefined,

        serviceId: item.serviceId == null ? undefined : String(item.serviceId),
        serviceName: item.serviceName ?? `Réservation #${item.id}`,

        category: item.category ?? "",

        scheduledDate: item.scheduledDate ?? new Date().toISOString().slice(0, 10),
        scheduledTime: item.scheduledTime?.slice(0, 5) ?? "00:00",

        amount,
        commission,
        providerPayout: Math.max(amount - commission, 0),

        paymentId: item.paymentId == null ? undefined : String(item.paymentId),


        paymentMethod: mapPaymentMethod(item.paymentMethod),
        paymentStatus: mapPaymentStatus(item.paymentStatus),

        payoutStatus: "en_attente",
        commissionStatus: "en_attente",

        status: mapReservationStatus(item.status),

        address: item.address ?? undefined,
        cancelReason: item.cancelReason ?? undefined,
        adminNote: item.adminNote ?? undefined,

        messages: [],

        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? new Date().toISOString(),
    };
}

function mapReservationStatus(status: AdminReservationApi["status"]): ReservationStatus {
    if (status === "PENDING_PAYMENT") return "pending";
    if (status === "CONFIRMED") return "confirmed";
    if (status === "COMPLETED") return "completed";
    if (status === "CANCELLED") return "cancelled";

    return "pending";
}


function mapPaymentMethod(method: string | null): "carte" | "especes" {
    if (!method) return "especes";

    const value = method.toLowerCase();

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
    if (!status) return "en_attente";

    const value = status.toUpperCase();

    if (
        value === "SUCCESS" ||
        value === "PAID" ||
        value === "COMPLETED"
    ) {
        return "paye";
    }

    if (
        value === "FAILED" ||
        value === "ERROR"
    ) {
        return "echoue";
    }

    if (value === "REFUNDED") {
        return "rembourse";
    }

    return "en_attente";
}

export async function getAdminReservations(): Promise<Reservation[]> {
    const response = await api.get<AdminReservationApi[]>("/admin/reservations");
    return response.data.map(mapAdminReservation);
}

export async function updateAdminReservationStatus(
    id: string,
    status: AdminReservationApi["status"]
): Promise<Reservation> {
    const response = await api.patch<AdminReservationApi>(
        `/admin/reservations/${id}/status`,
        { status }
    );

    return mapAdminReservation(response.data);
}

export async function cancelAdminReservation(
    id: string,
    reason?: string
): Promise<Reservation> {
    const response = await api.post<AdminReservationApi>(
        `/admin/reservations/${id}/cancel`,
        { reason }
    );

    return mapAdminReservation(response.data);
}

export async function updateAdminReservationNote(
    id: string,
    note: string
): Promise<Reservation> {
    const response = await api.patch<AdminReservationApi>(
        `/admin/reservations/${id}/note`,
        { note }
    );

    return mapAdminReservation(response.data);
}
