// ClientProfileMockData.ts

export interface ClientReservation {
    id: string;
    clientId: string;
    serviceName: string;
    date: string;
    status: "en_attente" | "en_cours" | "terminee" | "annulee";
    amount: number;
    providerName?: string;
    cancelReason?: string;
    cancelledAt?: string;
}

export const reservationsMock: ClientReservation[] = [
    { id: "r1", clientId: "1", serviceName: "Plomberie urgence",    date: "2025-02-10", status: "terminee",   amount: 120, providerName: "Ahmed Benali"   },
    { id: "r2", clientId: "1", serviceName: "Électricité",          date: "2025-03-01", status: "en_cours",   amount: 85,  providerName: "Fatima Zahra"    },
    { id: "r3", clientId: "1", serviceName: "Ménage complet",       date: "2025-01-20", status: "terminee",   amount: 60,  providerName: "Nadia Berrada"   },
    { id: "r7", clientId: "1", serviceName: "Peinture intérieure",  date: "2025-03-10", status: "annulee",    amount: 180, providerName: "Youssef Idrissi", cancelReason: "Prestataire indisponible à la dernière minute.",  cancelledAt: "2025-03-09T10:00:00Z" },
    { id: "r8", clientId: "1", serviceName: "Jardinage",            date: "2025-01-05", status: "annulee",    amount: 70,  providerName: "Karim Mansouri",  cancelReason: "Client a annulé suite à un empêchement personnel.", cancelledAt: "2025-01-04T08:30:00Z" },
    { id: "r9", clientId: "1", serviceName: "Déménagement",         date: "2025-03-20", status: "en_attente", amount: 350, providerName: "Sofia Amrani"    },
    { id: "r4", clientId: "2", serviceName: "Jardinage",            date: "2025-02-15", status: "terminee",   amount: 95,  providerName: "Karim Mansouri"  },
    { id: "r5", clientId: "2", serviceName: "Peinture",             date: "2025-03-05", status: "en_attente", amount: 200, providerName: "Youssef Idrissi" },
    { id: "r6", clientId: "3", serviceName: "Dépannage",            date: "2025-02-01", status: "terminee",   amount: 75,  providerName: "Ahmed Benali"    },
];

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ClientReview {
    id: string;
    clientId: string;
    providerName: string;
    date: string;
    rating: number;   // 1–5
    comment: string;
}

export const reviewsMock: ClientReview[] = [
    { id: "rv1", clientId: "1", providerName: "Ahmed Benali",   date: "2025-02-11", rating: 5, comment: "Intervention rapide et très professionnelle. Je recommande vivement !"           },
    { id: "rv2", clientId: "1", providerName: "Nadia Berrada",  date: "2025-01-21", rating: 4, comment: "Travail soigné, ponctuelle et agréable. Quelques petits détails à revoir."        },
    { id: "rv3", clientId: "1", providerName: "Karim Mansouri", date: "2025-02-16", rating: 3, comment: "Correct mais pas exceptionnel. Le jardin est propre, manque un peu de finition."  },
    { id: "rv4", clientId: "2", providerName: "Karim Mansouri", date: "2025-02-16", rating: 5, comment: "Excellent travail, très satisfait du résultat !"                                  },
    { id: "rv5", clientId: "3", providerName: "Ahmed Benali",   date: "2025-02-02", rating: 2, comment: "Le dépannage a pris trop de temps et le tarif était élevé pour la prestation."   },
];

// ── Activity Events ───────────────────────────────────────────────────────────

export type ActivityEventType =
    | "reservation_created"
    | "reservation_completed"
    | "reservation_cancelled"
    | "review_posted"
    | "profile_updated"
    | "login"
    | "account_created";

export interface ActivityEvent {
    id: string;
    clientId: string;
    type: ActivityEventType;
    date: string;
    title: string;
    description?: string;
    meta?: Record<string, any>;
}

export const activityEventsMock: ActivityEvent[] = [
    // ── Client 1 ──
    { id: "ae1",  clientId: "1", type: "account_created",  date: "2024-11-01T09:00:00Z", title: "Compte créé",       description: "Inscription via l'application mobile"     },
    { id: "ae2",  clientId: "1", type: "login",             date: "2024-11-03T14:22:00Z", title: "Connexion",         description: "Connexion depuis Casablanca"               },
    { id: "ae3",  clientId: "1", type: "profile_updated",   date: "2024-11-10T11:05:00Z", title: "Profil mis à jour", description: "Numéro de téléphone modifié"               },
    { id: "ae4",  clientId: "1", type: "login",             date: "2025-01-04T08:15:00Z", title: "Connexion",         description: "Connexion depuis Rabat"                    },
    { id: "ae5",  clientId: "1", type: "login",             date: "2025-02-09T10:30:00Z", title: "Connexion",         description: "Connexion depuis Casablanca"               },
    { id: "ae6",  clientId: "1", type: "profile_updated",   date: "2025-02-20T16:45:00Z", title: "Profil mis à jour", description: "Adresse email mise à jour"                 },
    { id: "ae7",  clientId: "1", type: "login",             date: "2025-03-01T09:00:00Z", title: "Connexion",         description: "Connexion depuis Marrakech"                },

    // ── Client 2 ──
    { id: "ae8",  clientId: "2", type: "account_created",  date: "2024-12-15T10:00:00Z", title: "Compte créé",       description: "Inscription via le site web"               },
    { id: "ae9",  clientId: "2", type: "login",             date: "2025-01-10T08:00:00Z", title: "Connexion",         description: "Connexion depuis Agadir"                   },
    { id: "ae10", clientId: "2", type: "profile_updated",   date: "2025-02-01T14:00:00Z", title: "Profil mis à jour", description: "Photo de profil mise à jour"               },

    // ── Client 3 ──
    { id: "ae11", clientId: "3", type: "account_created",  date: "2025-01-01T12:00:00Z", title: "Compte créé",       description: "Inscription via l'application mobile"     },
    { id: "ae12", clientId: "3", type: "login",             date: "2025-01-15T09:30:00Z", title: "Connexion",         description: "Connexion depuis Fès"                      },
];