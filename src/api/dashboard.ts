import api from "./api";

export type DashboardOverview = {
    totalClients: number;
    totalProviders: number;
    pendingProviders: number;
    activeReservations: number;
    completedReservationsToday: number;
    monthlyRevenue: number;
};
export type DashboardPerformance = {
    completionRate: number;
    avgRevenuePerCompleted: number;
    topProviderName: string;
    topProviderCompletedCount: number;
    topZoneName: string;
    topZoneCompletedCount: number;
    providerRanking: { name: string; count: number }[];
    zoneRanking: { name: string; count: number }[];

    completedWeekCurrent: number;
    completedWeekPrevious: number;
    completedMonthCurrent: number;
    completedMonthPrevious: number;
    completedYearCurrent: number;
    completedYearPrevious: number;

    completionRateWeekCurrent: number;
    completionRateWeekPrevious: number;
    completionRateMonthCurrent: number;
    completionRateMonthPrevious: number;
    completionRateYearCurrent: number;
    completionRateYearPrevious: number;

    avgRevenueWeekCurrent: number;
    avgRevenueWeekPrevious: number;
    avgRevenueMonthCurrent: number;
    avgRevenueMonthPrevious: number;
    avgRevenueYearCurrent: number;
    avgRevenueYearPrevious: number;
};


export type DashboardTrends = {
    clientsWeekCurrent: number;
    clientsWeekPrevious: number;
    clientsMonthCurrent: number;
    clientsMonthPrevious: number;
    clientsYearCurrent:number;
    clientsYearPrevious:number;

    providersWeekCurrent: number;
    providersWeekPrevious: number;
    providersMonthCurrent: number;
    providersMonthPrevious: number;
    providersYearCurrent:number;
    providersYearPrevious:number;

    reservationsWeekCurrent: number;
    reservationsWeekPrevious: number;
    reservationsMonthCurrent: number;
    reservationsMonthPrevious: number;
    reservationsYearCurrent:number;
    reservationsYearPrevious:number;

    revenueWeekCurrent: number;
    revenueWeekPrevious: number;
    revenueMonthCurrent: number;
    revenueMonthPrevious: number;
    revenueYearCurrent:number;
    revenueYearPrevious:number;
};
export type DashboardExtraKpi = {
    cancellationRate: number;
    paymentFailureRate: number;

    paymentFailureRateWeekCurrent: number;
    paymentFailureRateWeekPrevious: number;
    paymentFailureRateMonthCurrent: number;
    paymentFailureRateMonthPrevious: number;
    paymentFailureRateYearCurrent: number;
    paymentFailureRateYearPrevious: number;

    activeReservationsWeekCurrent: number;
    activeReservationsWeekPrevious: number;
    activeReservationsMonthCurrent: number;
    activeReservationsMonthPrevious: number;
    activeReservationsYearCurrent: number;
    activeReservationsYearPrevious: number;

    cancellationRateWeekCurrent: number;
    cancellationRateWeekPrevious: number;
    cancellationRateMonthCurrent: number;
    cancellationRateMonthPrevious: number;
    cancellationRateYearCurrent: number;
    cancellationRateYearPrevious: number;

};


export async function getDashboardExtraKpis(): Promise<DashboardExtraKpi> {
    const { data } = await api.get<DashboardExtraKpi>("/dashboard/extra-kpis");
    return data;
}





export async function getDashboardPerformance(): Promise<DashboardPerformance> {
    const { data } = await api.get<DashboardPerformance>("/dashboard/performance");
    return data;
}


export async function getDashboardOverview(): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>("/dashboard/overview");
    return data;
}
export async function getDashboardTrends(): Promise<DashboardTrends> {
    const { data } = await api.get<DashboardTrends>("/dashboard/trends");
    return data;
}

export type DashboardQualityTrends = {
    verifiedWeekCurrent: number;
    verifiedWeekPrevious: number;
    verifiedMonthCurrent: number;
    verifiedMonthPrevious: number;
    verifiedYearCurrent: number;
    verifiedYearPrevious: number;

    pendingWeekCurrent: number;
    pendingWeekPrevious: number;
    pendingMonthCurrent: number;
    pendingMonthPrevious: number;
    pendingYearCurrent: number;
    pendingYearPrevious: number;
};

export async function getDashboardQualityTrends(): Promise<DashboardQualityTrends> {
    const { data } = await api.get<DashboardQualityTrends>("/dashboard/quality-trends");
    return data;
}
export type DashboardPaymentStatus = {
    paid: number;
    pending: number;
    refunded: number;
    failed: number;
    total: number;
};

export async function getDashboardPaymentStatus(): Promise<DashboardPaymentStatus> {
    const { data } = await api.get<DashboardPaymentStatus>("/dashboard/payment-status");
    return data;
}


