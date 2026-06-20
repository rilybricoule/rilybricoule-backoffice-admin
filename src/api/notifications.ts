import api from "./api";

export interface BackendNotificationDto {
    id: number;
    title: string;
    message: string;
    type: string;
    channel: string;
    triggeredBy: string;
    triggeredByRole: string;
    triggeredById: number | null;
    read: boolean;
    sentAt: string;
    receiverId: number;
    receiverName: string;
    redirectUrl?: string | null;
}

export async function getUserNotifications(userId: number): Promise<BackendNotificationDto[]> {
    const { data } = await api.get<BackendNotificationDto[]>(`/notifications/user/${userId}`);
    return data;
}

export async function markNotificationRead(notificationId: number): Promise<BackendNotificationDto> {
    const { data } = await api.put<BackendNotificationDto>(`/notifications/${notificationId}/read`);
    return data;
}

export async function deleteAllUserNotifications(userId: number): Promise<void> {
    await api.delete(`/notifications/user/${userId}`);
}
