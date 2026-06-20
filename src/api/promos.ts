import api from "./api";
import type { Promo, PromoStatus } from "../Data/Promo";

export interface AdminPromoApi {
    id: number;
    code: string;
    title: string | null;
    description: string | null;
    discountAmount: number | null;
    discountPercentage: number | null;
    startDate: string | null;
    endDate: string | null;
    targetAudience: string | null;
    maxUsage: number | null;
    currentUsage: number | null;
    active: boolean;
    createdAt: string | null;
}

export type PromoPayload = Omit<Promo, "id" | "usageCount" | "createdAt">;

function resolveStatus(item: AdminPromoApi): PromoStatus {
    const today = new Date().toISOString().slice(0, 10);

    if (!item.active) return "inactive";
    if (item.endDate && item.endDate < today) return "expired";

    return "active";
}

export function mapAdminPromo(item: AdminPromoApi): Promo {
    return {
        id: String(item.id),
        code: item.code,
        discount: Number(item.discountPercentage ?? 0),
        startDate: item.startDate ?? new Date().toISOString().slice(0, 10),
        endDate: item.endDate ?? new Date().toISOString().slice(0, 10),
        maxUsage: Number(item.maxUsage ?? 0),
        usageCount: Number(item.currentUsage ?? 0),
        status: resolveStatus(item),
        description: item.description ?? item.title ?? undefined,
        createdAt: item.createdAt ?? new Date().toISOString(),
    };
}

function toAdminPromoPayload(promo: PromoPayload) {
    return {
        code: promo.code,
        title: promo.description || promo.code,
        description: promo.description ?? null,
        discountAmount: 0,
        discountPercentage: promo.discount,
        startDate: promo.startDate,
        endDate: promo.endDate,
        targetAudience: "all_clients",
        maxUsage: promo.maxUsage,
        active: promo.status !== "inactive",
    };
}

export async function getAdminPromos(): Promise<Promo[]> {
    const response = await api.get<AdminPromoApi[]>("/admin/promos");
    return response.data.map(mapAdminPromo);
}

export async function createAdminPromo(promo: PromoPayload): Promise<Promo> {
    const response = await api.post<AdminPromoApi>(
        "/admin/promos",
        toAdminPromoPayload(promo)
    );

    return mapAdminPromo(response.data);
}

export async function updateAdminPromo(
    id: string,
    promo: PromoPayload
): Promise<Promo> {
    const response = await api.put<AdminPromoApi>(
        `/admin/promos/${id}`,
        toAdminPromoPayload(promo)
    );

    return mapAdminPromo(response.data);
}

export async function deleteAdminPromo(id: string): Promise<void> {
    await api.delete(`/admin/promos/${id}`);
}

export async function toggleAdminPromoStatus(
    promo: Promo
): Promise<Promo> {
    const nextStatus: PromoStatus = promo.status === "active" ? "inactive" : "active";

    const response = await api.patch<AdminPromoApi>(
        `/admin/promos/${promo.id}/status`,
        { active: nextStatus === "active" }
    );

    return mapAdminPromo(response.data);
}
