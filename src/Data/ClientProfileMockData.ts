import type { Reservation, Review } from "./Client";

export const reservationsMock: Reservation[] = [
    { id: "r1", clientId: "1", serviceName: "Plomberie", date: "2025-02-10", status: "terminee", amount: 120 },
    { id: "r2", clientId: "1", serviceName: "Électricité", date: "2025-03-01", status: "en_cours", amount: 85 },
    { id: "r3", clientId: "1", serviceName: "Ménage", date: "2025-01-20", status: "terminee", amount: 60 },
    { id: "r4", clientId: "2", serviceName: "Jardinage", date: "2025-02-15", status: "terminee", amount: 95 },
    { id: "r5", clientId: "2", serviceName: "Peinture", date: "2025-03-05", status: "en_attente", amount: 200 },
    { id: "r6", clientId: "3", serviceName: "Dépannage", date: "2025-02-01", status: "terminee", amount: 75 },
];

export const reviewsMock: Review[] = [
    { id: "v1", clientId: "1", rating: 5, comment: "Excellent travail, très satisfaite !", date: "2025-02-12", providerName: "Plombier Pro" },
    { id: "v2", clientId: "1", rating: 4, comment: "Bon service, professionnel.", date: "2025-01-25", providerName: "Ménage Express" },
    { id: "v3", clientId: "2", rating: 5, comment: "Parfait, je recommande.", date: "2025-02-20", providerName: "Jardiniers SA" },
];