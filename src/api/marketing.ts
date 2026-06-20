import api from "./api";

export type MarketingPromoStatus =
    | "ACTIVE"
    | "SCHEDULED"
    | "EXPIRED"
    | "INACTIVE";

export interface MarketingPromoRow {
    id: number;
    code: string;
    title: string;
    description: string | null;
    status: MarketingPromoStatus;
    targetAudience: string | null;
    currentUsage: number | null;
    maxUsage: number | null;
    startDate: string | null;
    endDate: string | null;
}

export interface MarketingNotificationRow {
    id: number;
    content: string;
    type: string | null;
    read: boolean;
    date: string | null;
}

export interface AdminMarketingSummary {
    totalPromos: number;
    activePromos: number;
    scheduledPromos: number;
    expiredPromos: number;
    inactivePromos: number;

    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    inactiveCoupons: number;

    totalNotifications: number;
    readNotifications: number;
    unreadNotifications: number;

    recentPromos: MarketingPromoRow[];
    recentNotifications: MarketingNotificationRow[];
}

export async function getAdminMarketingSummary(): Promise<AdminMarketingSummary> {
    const response = await api.get<AdminMarketingSummary>("/admin/marketing/summary");
    return response.data;
}
