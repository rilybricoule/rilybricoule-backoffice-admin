import api from "./api";
import type { Ticket, TicketCategory, TicketMessage, TicketStatus } from "../Data/Ticket";

type SupportMessageApi = {
    from?: string | null;
    senderType?: string | null;
    name?: string | null;
    senderName?: string | null;
    message?: string | null;
    content?: string | null;
    date?: string | null;
    createdAt?: string | null;
};

export type SupportTicketApi = {
    id: number | string;
    subject?: string | null;
    title?: string | null;
    category?: string | null;
    type?: string | null;
    status?: string | null;
    isLitige?: boolean | null;
    litige?: boolean | null;
    dispute?: boolean | null;
    fromType?: string | null;
    requesterType?: string | null;
    fromId?: number | string | null;
    requesterId?: number | string | null;
    fromName?: string | null;
    requesterName?: string | null;
    reservationId?: number | string | null;
    reservationTitle?: string | null;
    reservationLabel?: string | null;
    messages?: SupportMessageApi[] | null;
    conversation?: SupportMessageApi[] | null;
    adminNote?: string | null;
    internalNote?: string | null;
    resolutionNote?: string | null;
    resolutionAction?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

function mapTicketStatus(value?: string | null): TicketStatus {
    const normalized = (value ?? "").trim().toUpperCase();

    if (normalized === "OPEN" || normalized === "OUVERT") return "ouvert";
    if (normalized === "IN_PROGRESS" || normalized === "EN_COURS") return "en_cours";
    if (normalized === "RESOLVED" || normalized === "RESOLU") return "resolu";
    if (normalized === "CLOSED" || normalized === "FERME") return "ferme";

    return "ouvert";
}

function toBackendTicketStatus(value: TicketStatus) {
    if (value === "ouvert") return "OPEN";
    if (value === "en_cours") return "IN_PROGRESS";
    if (value === "resolu") return "RESOLVED";
    return "CLOSED";
}

function mapTicketCategory(value?: string | null): TicketCategory {
    const normalized = (value ?? "").trim().toUpperCase();

    if (
        normalized === "QUESTION_GENERALE" ||
        normalized === "GENERAL_QUESTION" ||
        normalized === "QUESTION"
    ) {
        return "question_generale";
    }

    if (
        normalized === "DEMANDE_REMBOURSEMENT" ||
        normalized === "REMBOURSEMENT" ||
        normalized === "REFUND_REQUEST"
    ) {
        return "demande_remboursement";
    }

    if (normalized === "LITIGE" || normalized === "DISPUTE") return "litige";

    return "incident";
}

function toBackendTicketCategory(value: TicketCategory) {
    if (value === "question_generale") return "GENERAL_QUESTION";
    if (value === "demande_remboursement") return "REFUND_REQUEST";
    if (value === "litige") return "DISPUTE";
    return "INCIDENT";
}

function mapFromType(value?: string | null): Ticket["fromType"] {
    const normalized = (value ?? "").trim().toUpperCase();
    return normalized === "PRESTATAIRE" || normalized === "PROVIDER" ? "prestataire" : "client";
}

function mapTicketMessage(item: SupportMessageApi, fallbackDate: string): TicketMessage {
    const from = mapMessageFrom(item.from ?? item.senderType);

    return {
        from,
        name: item.name ?? item.senderName ?? "Utilisateur",
        message: item.message ?? item.content ?? "",
        date: item.date ?? item.createdAt ?? fallbackDate,
    };
}

function mapMessageFrom(value?: string | null): TicketMessage["from"] {
    const normalized = (value ?? "").trim().toUpperCase();

    if (normalized === "ADMIN") return "admin";
    if (normalized === "PRESTATAIRE" || normalized === "PROVIDER") return "prestataire";

    return "client";
}

export function mapSupportTicket(item: SupportTicketApi): Ticket {
    const createdAt = item.createdAt ?? new Date().toISOString();
    const messages = (item.messages ?? item.conversation ?? []).map((message) =>
        mapTicketMessage(message, createdAt)
    );

    const category = mapTicketCategory(item.category ?? item.type);
    const isLitige = Boolean(item.isLitige ?? item.litige ?? item.dispute ?? category === "litige");

    return {
        id: String(item.id),
        subject: item.subject ?? item.title ?? `Ticket #${item.id}`,
        category,
        status: mapTicketStatus(item.status),
        isLitige,
        fromType: mapFromType(item.fromType ?? item.requesterType),
        fromId: String(item.fromId ?? item.requesterId ?? ""),
        fromName: item.fromName ?? item.requesterName ?? "Utilisateur",
        reservationId:
            item.reservationId == null || item.reservationId === ""
                ? undefined
                : String(item.reservationId),
        reservationTitle: item.reservationTitle ?? item.reservationLabel ?? undefined,
        messages,
        adminNote: item.adminNote ?? item.internalNote ?? undefined,
        resolutionNote: item.resolutionNote ?? undefined,
        resolutionAction: item.resolutionAction ?? undefined,
        createdAt,
        updatedAt: item.updatedAt ?? createdAt,
    };
}

export async function getAdminTickets(): Promise<Ticket[]> {
    const response = await api.get<SupportTicketApi[]>("/admin/tickets");
    return response.data.map(mapSupportTicket);
}

export async function replyAdminTicket(id: string, message: string): Promise<Ticket> {
    const response = await api.post<SupportTicketApi>(`/admin/tickets/${id}/reply`, { message });
    return mapSupportTicket(response.data);
}

export async function updateAdminTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const response = await api.patch<SupportTicketApi>(`/admin/tickets/${id}/status`, {
        status: toBackendTicketStatus(status),
    });

    return mapSupportTicket(response.data);
}

export async function updateAdminTicketCategory(id: string, category: TicketCategory): Promise<Ticket> {
    const response = await api.patch<SupportTicketApi>(`/admin/tickets/${id}/category`, {
        category: toBackendTicketCategory(category),
    });

    return mapSupportTicket(response.data);
}

export async function updateAdminTicketLitige(id: string, isLitige: boolean): Promise<Ticket> {
    const response = await api.patch<SupportTicketApi>(`/admin/tickets/${id}/litige`, {
        litige: isLitige,
    });

    return mapSupportTicket(response.data);
}

export async function updateAdminTicketNote(id: string, note: string): Promise<Ticket> {
    const response = await api.patch<SupportTicketApi>(`/admin/tickets/${id}/admin-note`, {
        note,
    });

    return mapSupportTicket(response.data);
}

export async function resolveAdminTicket(
    id: string,
    action: string,
    note: string,
    newPrestataireId?: string
): Promise<Ticket> {
    const response = await api.post<SupportTicketApi>(`/admin/tickets/${id}/resolve`, {
        action,
        note,
        newPrestataireId: newPrestataireId ? Number(newPrestataireId) : null,
    });

    return mapSupportTicket(response.data);
}
