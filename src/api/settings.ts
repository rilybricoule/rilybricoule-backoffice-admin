import api from "./api";

export interface CategoryCommissionApi {
    id: string;
    label: string;
    rate: number;
    color: string;
}

export interface PaymentGatewayApi {
    id: "cmi" | "stripe" | "paypal" | "cash";
    label: string;
    description: string;
    enabled: boolean;
    testMode: boolean;
    color: string;
    logo: string;
}

export interface AdminSettingsApi {
    globalRate: number;
    usePerCategory: boolean;
    categories: CategoryCommissionApi[];
    gateways: PaymentGatewayApi[];
    currency: string;
    language: string;
    timezone: string;
    dateFormat: string;
    cancelWindow: number;
    cancelFeePercent: number;
    freeCancelWindow: number;
    autoRefund: boolean;
    refundDelay: string;
}

export async function getAdminSettings(): Promise<AdminSettingsApi> {
    const { data } = await api.get<AdminSettingsApi>("/admin/settings");
    return data;
}

export async function updateAdminSettings(payload: AdminSettingsApi): Promise<AdminSettingsApi> {
    const { data } = await api.put<AdminSettingsApi>("/admin/settings", payload);
    return data;
}
