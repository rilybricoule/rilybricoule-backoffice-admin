export type Period =  "week" | "month" | "year";

export const statsByPeriod = {
    day: {
        current: {
            clientsCount: 12,
            providersCount: 2,
            reservationsEnCours: 5,
            reservationsTerminees: 8,
            revenusPeriod: 450,
            satisfactionMoyenne: 4.8,
        },
        previous: {
            clientsCount: 8,
            providersCount: 1,
            reservationsEnCours: 4,
            reservationsTerminees: 6,
            revenusPeriod: 320,
            satisfactionMoyenne: 4.6,
        },
    },
    week: {
        current: {
            clientsCount: 78,
            providersCount: 12,
            reservationsEnCours: 22,
            reservationsTerminees: 95,
            revenusPeriod: 3200,
            satisfactionMoyenne: 4.7,
        },
        previous: {
            clientsCount: 65,
            providersCount: 10,
            reservationsEnCours: 28,
            reservationsTerminees: 82,
            revenusPeriod: 2800,
            satisfactionMoyenne: 4.5,
        },
    },
    month: {
        current: {
            clientsCount: 1247,
            providersCount: 89,
            reservationsEnCours: 47,
            reservationsTerminees: 312,
            revenusPeriod: 12450,
            satisfactionMoyenne: 4.7,
        },
        previous: {
            clientsCount: 1120,
            providersCount: 82,
            reservationsEnCours: 55,
            reservationsTerminees: 278,
            revenusPeriod: 10800,
            satisfactionMoyenne: 4.5,
        },
    },
    year: {
        current: {
            clientsCount: 8420,
            providersCount: 312,
            reservationsEnCours: 47,
            reservationsTerminees: 3850,
            revenusPeriod: 142000,
            satisfactionMoyenne: 4.6,
        },
        previous: {
            clientsCount: 6200,
            providersCount: 245,
            reservationsEnCours: 38,
            reservationsTerminees: 2890,
            revenusPeriod: 98000,
            satisfactionMoyenne: 4.4,
        },
    },
};

export function getChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
}

export const periodLabels: Record<Period, { label: string; comparisonLabel: string }> = {
    week: { label: "Cette semaine", comparisonLabel: "vs semaine dernière" },
    month: { label: "Ce mois", comparisonLabel: "vs mois dernier" },
    year: { label: "Cette année", comparisonLabel: "vs année dernière" },
};