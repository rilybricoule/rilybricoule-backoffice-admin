import api from "./api";
import type { BackendNotificationDto } from "./notifications";

export async function getAdminNotifications(): Promise<BackendNotificationDto[]> {
    const { data } = await api.get<BackendNotificationDto[]>("/admin/notifications");
    return data;
}

export async function markAdminNotificationRead(id: number): Promise<BackendNotificationDto> {
    const { data } = await api.put<BackendNotificationDto>(`/admin/notifications/${id}/read`);
    return data;
}

export async function markAllAdminNotificationsRead(): Promise<void> {
    await api.put("/admin/notifications/read-all");
}

export async function deleteAdminNotification(id: number): Promise<void> {
    await api.delete(`/admin/notifications/${id}`);
}