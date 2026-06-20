export type PromoStatus = "active" | "inactive" | "expired";

export interface Promo {
    id:           string;
    code:         string;
    discount:     number;        // percentage
    startDate:    string;        // YYYY-MM-DD
    endDate:      string;        // YYYY-MM-DD
    maxUsage:     number;
    usageCount:   number;
    status:       PromoStatus;
    description?: string;
    createdAt:    string;
}