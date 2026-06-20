import type { Client, Reservation, Review } from "./Client";

export const clientsMock: Client[] = [
    { id: "1",  email: "ahmed.benali@gmail.com",     firstName: "Ahmed",  lastName: "Benali",  phone: "+212 6 12 34 56 78", createdAt: "2025-06-12", isActive: true,  ville: "Casablanca", lastActivityAt: "2026-03-10" },
    { id: "2",  email: "fatima.zahra@gmail.com",     firstName: "Fatima", lastName: "Zahra",   phone: "+212 6 98 76 54 32", createdAt: "2025-09-03", isActive: true,  ville: "Rabat",      lastActivityAt: "2026-03-08" },
    { id: "3",  email: "karim.mansouri@outlook.com", firstName: "Karim",  lastName: "Mansouri",phone: "+212 6 45 67 89 01", createdAt: "2025-11-20", isActive: true,  ville: "Marrakech",  lastActivityAt: "2026-02-20" },
    { id: "4",  email: "sofia.amrani@gmail.com",     firstName: "Sofia",  lastName: "Amrani",  phone: "+212 6 11 22 33 44", createdAt: "2025-12-05", isActive: false, ville: "Fès",        lastActivityAt: "2026-01-15" },
    { id: "5",  email: "youssef.idrissi@yahoo.fr",   firstName: "Youssef",lastName: "Idrissi", phone: "+212 6 55 66 77 88", createdAt: "2026-01-14", isActive: true,  ville: "Tanger",     lastActivityAt: "2026-03-09" },
    { id: "6",  email: "nadia.berrada@gmail.com",    firstName: "Nadia",  lastName: "Berrada", phone: "+212 6 99 88 77 66", createdAt: "2026-01-28", isActive: true,  ville: "Casablanca", lastActivityAt: "2026-03-11" },
    { id: "7",  email: "omar.tazi@gmail.com",        firstName: "Omar",   lastName: "Tazi",    phone: "+212 6 44 33 22 11", createdAt: "2026-02-10", isActive: true,  ville: "Agadir",     lastActivityAt: "2026-02-28" },
    { id: "8",  email: "imane.chraibi@gmail.com",    firstName: "Imane",  lastName: "Chraibi", phone: "+212 6 77 88 99 00", createdAt: "2026-03-02", isActive: true,  ville: "Rabat",      lastActivityAt: undefined    },
    { id: "9",  email: "rachid.elhaj@gmail.com",     firstName: "Rachid", lastName: "El Haj",  phone: "+212 6 12 98 76 54", createdAt: "2026-03-05", isActive: true,  ville: "Meknès",     lastActivityAt: "2026-03-07" },
    { id: "10", email: "salma.kettani@gmail.com",    firstName: "Salma",  lastName: "Kettani", phone: "+212 6 32 10 98 76", createdAt: "2026-03-09", isActive: true,  ville: "Casablanca", lastActivityAt: "2026-03-10" },
    { id: "11", email: "hassan.alaoui@gmail.com",    firstName: "Hassan", lastName: "Alaoui",  phone: "+212 6 67 45 23 01", createdAt: "2026-03-10", isActive: false, ville: "Oujda",      lastActivityAt: "2025-12-01" },
];

export const reservationsMock: Reservation[] = [
    { id: "r1", clientId: "1", serviceName: "Plomberie",   date: "2025-02-10", status: "terminee",   amount: 120 },
    { id: "r2", clientId: "1", serviceName: "Électricité", date: "2025-03-01", status: "en_cours",   amount: 85  },
    { id: "r3", clientId: "1", serviceName: "Ménage",      date: "2025-01-20", status: "terminee",   amount: 60  },
    { id: "r4", clientId: "2", serviceName: "Jardinage",   date: "2025-02-15", status: "terminee",   amount: 95  },
    { id: "r5", clientId: "2", serviceName: "Peinture",    date: "2025-03-05", status: "en_attente", amount: 200 },
    { id: "r6", clientId: "3", serviceName: "Dépannage",   date: "2025-02-01", status: "terminee",   amount: 75  },
    { id: "r7", clientId: "5", serviceName: "Ménage",      date: "2026-01-20", status: "terminee",   amount: 55  },
    { id: "r8", clientId: "5", serviceName: "Jardinage",   date: "2026-02-10", status: "terminee",   amount: 90  },
    { id: "r9", clientId: "6", serviceName: "Électricité", date: "2026-03-01", status: "en_attente", amount: 110 },
    { id: "r10",clientId: "9", serviceName: "Plomberie",   date: "2026-03-07", status: "en_cours",   amount: 140 },
    { id: "r11",clientId: "10",serviceName: "Peinture",    date: "2026-02-28", status: "terminee",   amount: 180 },
];

export const reviewsMock: Review[] = [
    { id: "v1", clientId: "1", rating: 5, comment: "Excellent travail, très satisfaite !", date: "2025-02-12", providerName: "Plombier Pro"   },
    { id: "v2", clientId: "1", rating: 4, comment: "Bon service, professionnel.",           date: "2025-01-25", providerName: "Ménage Express" },
    { id: "v3", clientId: "2", rating: 5, comment: "Parfait, je recommande.",               date: "2025-02-20", providerName: "Jardiniers SA"  },
];