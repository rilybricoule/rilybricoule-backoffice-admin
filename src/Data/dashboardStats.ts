export type Period = "week" | "month" | "year";

// ── All-time totals (never change with period) ────────────────────────────────
export const allTimeTotals = {
    clientsCount:        1247,
    providersCount:      89,
    reservationsTotal:   4209,
    commissionsTotal:    23650,
    revenusTotal:        157650,
};

export const liveSnapshot = {
    reservationsEnCours:  47,
    providersEnAttente:   7,
    tauxSatisfaction:     4.36,   // average rating out of 5 (clients + providers)
    cancellationRate:     6.8,    // %
    averageProviderAcceptanceDelayMinutes: 12.4,
    paymentFailureRate:   2.1,    // %
};

// ── Period breakdowns ─────────────────────────────────────────────────────────
export const statsByPeriod = {

    week: {
        current: {
            clientsCount:           1247,
            providersCount:         89,
            newClients:             18,
            newProviders:           2,
            newReservations:        36,
            reservationsEnCours:    11,
            reservationsTerminees:  25,
            revenusPeriod:          2850,
            commissionsGenerees:    420,
            tauxSatisfaction:       4.36,
            satisfactionMoyenne:    4.36,
            conversionRate:         32,
            cancellationRate:       7.3, // %
            averageProviderAcceptanceDelayMinutes: 14.2,
            paymentFailureRate:     2.4, // %
        },

        previous: {
            clientsCount:           1247,
            providersCount:         89,
            newClients:             15,
            newProviders:           1,
            newReservations:        29,
            reservationsEnCours:    9,
            reservationsTerminees:  20,
            revenusPeriod:          2300,
            commissionsGenerees:    340,
            tauxSatisfaction:       4.18,
            satisfactionMoyenne:    4.18,
            conversionRate:         28,
            cancellationRate:       8.1, // %
            averageProviderAcceptanceDelayMinutes: 16.1,
            paymentFailureRate:     2.9, // %
        },
    },


    month: {
        current: {
            clientsCount:           1247,
            providersCount:         89,
            newClients:             82,
            newProviders:           7,
            newReservations:        298,
            reservationsEnCours:    47,
            reservationsTerminees:  209,
            revenusPeriod:          11850,
            commissionsGenerees:    1770,
            tauxSatisfaction:       4.36,
            satisfactionMoyenne:    4.36,
            conversionRate:         29,
            cancellationRate:       6.8, // %
            averageProviderAcceptanceDelayMinutes: 12.4,
            paymentFailureRate:     2.1, // %
        },

        previous: {
            clientsCount:           1247,
            providersCount:         89,
            newClients:             70,
            newProviders:           6,
            newReservations:        254,
            reservationsEnCours:    38,
            reservationsTerminees:  178,
            revenusPeriod:          10100,
            commissionsGenerees:    1515,
            tauxSatisfaction:       4.11,
            satisfactionMoyenne:    4.11,
            conversionRate:         26,
            cancellationRate:       7.6, // %
            averageProviderAcceptanceDelayMinutes: 14.9,
            paymentFailureRate:     2.7, // %
        },
    },


    year: {
        current: {
            clientsCount:           1247,
            providersCount:         89,
            newClients:             305,
            newProviders:           32,
            newReservations:        3980,
            reservationsEnCours:    194,
            reservationsTerminees:  2786,
            revenusPeriod:          141200,
            commissionsGenerees:    21180,
            tauxSatisfaction:       4.36,
            satisfactionMoyenne:    4.36,
            conversionRate:         27,
            cancellationRate:       6.2, // %
            averageProviderAcceptanceDelayMinutes: 10.8,
            paymentFailureRate:     1.8, // %
        },

        previous: {
            clientsCount:           1247,
            providersCount:         89,
            newClients:             248,
            newProviders:           26,
            newReservations:        3125,
            reservationsEnCours:    152,
            reservationsTerminees:  2188,
            revenusPeriod:          99500,
            commissionsGenerees:    14900,
            tauxSatisfaction:       3.92,
            satisfactionMoyenne:    3.92,
            conversionRate:         23,
            cancellationRate:       7.1, // %
            averageProviderAcceptanceDelayMinutes: 13.3,
            paymentFailureRate:     2.3, // %
        },
    },

};

export function getChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
}

export const periodLabels: Record<Period, { label: string; comparisonLabel: string }> = {
    week:  { label: "Cette semaine", comparisonLabel: "vs semaine dernière" },
    month: { label: "Ce mois",       comparisonLabel: "vs mois dernier"     },
    year:  { label: "Cette année",   comparisonLabel: "vs année dernière"   },
};
