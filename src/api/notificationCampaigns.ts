import api from "./api";
import type {
    NotificationPurpose,
    NotificationStatus,
    NotificationTarget,
    SentNotification,
} from "../Data/Notification";

export interface AdminNotificationCampaignApi {
    id: number;
    title: string;
    message: string;
    audience: string | null;
    status: string | null;
    notificationType: string | null;
    targetUserId: number | null;
    recipientCount: number | null;
    readCount: number | null;
    scheduledAt: string | null;
    sentAt: string | null;
    failureReason: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export type CreateNotificationCampaignPayload = {
    title: string;
    message: string;
    target: NotificationTarget;
    purpose?: NotificationPurpose;
    targetEmail?: string;
    scheduledAt?: string;
    sendNow: boolean;
};

function mapAudience(audience: string | null): NotificationTarget {
    if (audience === "ALL_PROVIDERS") return "all_providers";
    if (audience === "SPECIFIC_USER") return "specific_user";
    return "all_clients";
}

function toBackendAudience(target: NotificationTarget): string {
    if (target === "all_providers" || target === "category_providers") return "ALL_PROVIDERS";
    if (target === "specific_user") return "SPECIFIC_USER";
    return "ALL_CLIENTS";
}

function mapStatus(status: string | null): NotificationStatus {
    if (status === "SCHEDULED") return "scheduled";
    if (status === "FAILED") return "failed";
    if (status === "CANCELLED") return "cancelled";
    if (status === "DRAFT") return "draft";
    return "sent";
}

function mapPurpose(type: string | null): NotificationPurpose {
    if (type === "MESSAGE") return "support";
    if (type === "RESERVATION") return "feature";
    return "promotion";
}

function toBackendNotificationType(purpose?: NotificationPurpose): string {
    if (purpose === "support") return "MESSAGE";
    if (purpose === "feature") return "RESERVATION";
    return "MARKETING";
}

export function mapAdminNotificationCampaign(item: AdminNotificationCampaignApi): SentNotification {
    return {
        id: String(item.id),
        title: item.title,
        message: item.message,
        target: mapAudience(item.audience),
        purpose: mapPurpose(item.notificationType),
        userId: item.targetUserId == null ? undefined : String(item.targetUserId),
        channel: "push",
        status: mapStatus(item.status),
        recipientCount: Number(item.recipientCount ?? 0),
        scheduledAt: item.scheduledAt ?? undefined,
        sentAt: item.sentAt ?? undefined,
        createdAt: item.createdAt ?? new Date().toISOString(),
    };
}

export async function getAdminNotificationCampaigns(): Promise<SentNotification[]> {
    const response = await api.get<AdminNotificationCampaignApi[]>("/admin/notification-campaigns");
    return response.data.map(mapAdminNotificationCampaign);
}

export async function createAdminNotificationCampaign(
    payload: CreateNotificationCampaignPayload
): Promise<SentNotification> {
    const response = await api.post<AdminNotificationCampaignApi>(
        "/admin/notification-campaigns",
        {
            title: payload.title,
            message: payload.message,
            audience: toBackendAudience(payload.target),
            notificationType: toBackendNotificationType(payload.purpose),
            targetEmail: payload.targetEmail ?? null,
            scheduledAt: payload.scheduledAt ?? null,
            sendNow: payload.sendNow,
        }
    );

    return mapAdminNotificationCampaign(response.data);
}

export async function sendAdminNotificationCampaign(id: string): Promise<SentNotification> {
    const response = await api.post<AdminNotificationCampaignApi>(
        `/admin/notification-campaigns/${id}/send`
    );

    return mapAdminNotificationCampaign(response.data);
}

export async function cancelAdminNotificationCampaign(id: string): Promise<SentNotification> {
    const response = await api.post<AdminNotificationCampaignApi>(
        `/admin/notification-campaigns/${id}/cancel`
    );

    return mapAdminNotificationCampaign(response.data);
}
