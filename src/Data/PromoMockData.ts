import type { Promo } from "./Promo";

export const promoMock: Promo[] = [
    {
        id: "promo1", code: "BIENVENUE20",
        discount: 20, startDate: "2025-03-01", endDate: "2025-04-30",
        maxUsage: 100, usageCount: 34, status: "active",
        description: "20% de réduction pour les nouveaux clients",
        createdAt: "2025-03-01",
    },
    {
        id: "promo2", code: "RAMADAN15",
        discount: 15, startDate: "2025-03-10", endDate: "2025-04-10",
        maxUsage: 200, usageCount: 87, status: "active",
        description: "Offre spéciale Ramadan",
        createdAt: "2025-03-10",
    },
    {
        id: "promo3", code: "LAUNCH10",
        discount: 10, startDate: "2025-01-01", endDate: "2025-02-28",
        maxUsage: 500, usageCount: 500, status: "expired",
        description: "Code de lancement de la plateforme",
        createdAt: "2025-01-01",
    },
    {
        id: "promo4", code: "SUMMER25",
        discount: 25, startDate: "2025-06-01", endDate: "2025-08-31",
        maxUsage: 150, usageCount: 0, status: "inactive",
        description: "Promotion été 2025",
        createdAt: "2025-03-15",
    },
];