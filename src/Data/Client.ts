export type Client = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdAt: string;
    isActive: boolean;
    avatar?: string;
};

export type ClientWithStats = Client & {
    reservationsCount: number;
    reviewsCount: number;
};

export type Reservation = {
    id: string;
    clientId: string;
    serviceName: string;
    date: string;
    status: "terminee" | "en_cours" | "annulee" | "en_attente";
    amount: number;
};

export type Review = {
    id: string;
    clientId: string;
    rating: number;
    comment: string;
    date: string;
    providerName: string;
};