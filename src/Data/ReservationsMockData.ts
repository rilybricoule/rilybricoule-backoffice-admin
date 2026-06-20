import type { Reservation } from "./Reservation";

export const reservationsMock: Reservation[] = [

    // ── 1: Carte + Terminée + Payé + Versé ───────────────────────────────────
    {
        id: "res1",
        clientId: "c1", clientName: "Mohamed Alami",
        providerId: "p1", providerName: "Ahmed Benali",
        offerId: "offer1", offerTitle: "Plomberie urgence 24h", category: "Plomberie",
        scheduledDate: "2025-03-15", scheduledTime: "09:00",
        amount: 150, commission: 22, providerPayout: 128,
        paymentMethod: "carte", paymentStatus: "paye",
        payoutStatus: "verse", commissionStatus: "en_attente",
        status: "Réservé",
        messages: [
            { from: "client",      name: "Mohamed Alami", message: "Bonjour, j'ai une fuite urgente sous l'évier.", date: "2025-03-14" },
            { from: "prestataire", name: "Ahmed Benali",  message: "Je serai là demain à 9h.", date: "2025-03-14" },
        ],
        createdAt: "2025-03-14", updatedAt: "2025-03-15",
    },

    // ── 2: Carte + Terminée + Payé + À verser ────────────────────────────────
    {
        id: "res2",
        clientId: "c2", clientName: "Sara El Fassi",
        providerId: "p2", providerName: "Fatima Zahra",
        offerId: "offer2", offerTitle: "Installation électrique complète", category: "Électricité",
        scheduledDate: "2025-03-18", scheduledTime: "10:00",
        amount: 800, commission: 120, providerPayout: 680,
        paymentMethod: "carte", paymentStatus: "paye",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "Réservé",
        messages: [
            { from: "client",      name: "Sara El Fassi", message: "Installation complète pour mon appartement.", date: "2025-03-18" },
            { from: "prestataire", name: "Fatima Zahra",  message: "Travaux terminés, tout fonctionne.", date: "2025-03-18" },
        ],
        createdAt: "2025-03-17", updatedAt: "2025-03-18",
    },

    // ── 3: Carte + En attente + Paiement en attente ──────────────────────────
    {
        id: "res3",
        clientId: "c3", clientName: "Khalid Bennis",
        providerId: "p3", providerName: "Karim Mansouri",
        offerId: "offer3", offerTitle: "Jardinage & entretien", category: "Jardinage",
        scheduledDate: "2026-03-22", scheduledTime: "08:00",
        amount: 60, commission: 9, providerPayout: 51,
        paymentMethod: "carte", paymentStatus: "en_attente",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "en_attente",
        messages: [
            { from: "client", name: "Khalid Bennis", message: "Bonjour, j'ai besoin d'une tonte hebdomadaire.", date: "2025-03-19" },
        ],
        createdAt: "2026-03-19", updatedAt: "2026-03-19",
    },

    // ── 4: Espèces + Terminée + Commission en attente ────────────────────────
    {
        id: "res4",
        clientId: "c4", clientName: "Nour Tazi",
        providerId: "p5", providerName: "Youssef Idrissi",
        offerId: "offer5", offerTitle: "Peinture intérieure", category: "Peinture",
        scheduledDate: "2025-03-10", scheduledTime: "09:30",
        amount: 250, commission: 37, providerPayout: 213,
        paymentMethod: "especes", paymentStatus: "paye",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "Réservé",
        messages: [
            { from: "client",      name: "Nour Tazi",       message: "2 pièces à peindre en blanc cassé.", date: "2025-03-09" },
            { from: "prestataire", name: "Youssef Idrissi", message: "Travaux terminés.", date: "2025-03-10" },
        ],
        createdAt: "2025-03-09", updatedAt: "2025-03-10",
    },

    // ── 5: Espèces + En attente ───────────────────────────────────────────────
    {
        id: "res5",
        clientId: "c5", clientName: "Imane Chraibi",
        providerId: "p6", providerName: "Nadia Berrada",
        offerId: "offer6", offerTitle: "Nettoyage après travaux", category: "Nettoyage",
        scheduledDate: "2025-03-25", scheduledTime: "14:00",
        amount: 120, commission: 18, providerPayout: 102,
        paymentMethod: "especes", paymentStatus: "en_attente",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "en_attente",
        messages: [
            { from: "client", name: "Imane Chraibi", message: "Nettoyage complet après rénovation.", date: "2025-03-20" },
        ],
        createdAt: "2025-03-20", updatedAt: "2025-03-20",
    },

    // ── 6: Espèces + Terminée + Commission en attente ────────────────────────
    {
        id: "res6",
        clientId: "c6", clientName: "Amine Laaroussi",
        providerId: "p1", providerName: "Ahmed Benali",
        offerId: "offer1", offerTitle: "Plomberie urgence 24h", category: "Plomberie",
        scheduledDate: "2025-03-20", scheduledTime: "11:00",
        amount: 150, commission: 22, providerPayout: 128,
        paymentMethod: "especes", paymentStatus: "paye",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "Réservé",
        messages: [
            { from: "client",      name: "Amine Laaroussi", message: "Robinet qui fuit dans la salle de bain.", date: "2025-03-20" },
            { from: "prestataire", name: "Ahmed Benali",    message: "Réparation effectuée, paiement reçu.", date: "2025-03-20" },
        ],
        createdAt: "2025-03-20", updatedAt: "2025-03-20",
    },

    // ── 7: Espèces + Terminée + Commission reçue ─────────────────────────────
    {
        id: "res7",
        clientId: "c7", clientName: "Layla Moussaoui",
        providerId: "p4", providerName: "Sofia Amrani",
        offerId: "offer4", offerTitle: "Déménagement appartement", category: "Déménagement",
        scheduledDate: "2025-03-05", scheduledTime: "08:00",
        amount: 400, commission: 60, providerPayout: 340,
        paymentMethod: "especes", paymentStatus: "paye",
        payoutStatus: "en_attente", commissionStatus: "recue",
        status: "Réservé",
        messages: [
            { from: "client",      name: "Layla Moussaoui", message: "Déménagement F3, 4ème étage sans ascenseur.", date: "2025-03-04" },
            { from: "prestataire", name: "Sofia Amrani",    message: "Déménagement effectué, paiement reçu.", date: "2025-03-05" },
            { from: "admin",       name: "Admin",           message: "Commission de 60 MAD reçue.", date: "2025-03-06" },
        ],
        createdAt: "2025-03-04", updatedAt: "2025-03-06",
    },

    // ── 8: Carte + Annulée + Remboursée ──────────────────────────────────────
    {
        id: "res8",
        clientId: "c2", clientName: "Sara El Fassi",
        providerId: "p6", providerName: "Nadia Berrada",
        offerId: "offer6", offerTitle: "Nettoyage après travaux", category: "Nettoyage",
        scheduledDate: "2025-03-12", scheduledTime: "14:00",
        amount: 120, commission: 18, providerPayout: 102,
        paymentMethod: "carte", paymentStatus: "rembourse",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "annulee",
        cancelReason: "Prestataire indisponible à la dernière minute.",
        adminNote: "Remboursement effectué. Cliente informée.",
        messages: [
            { from: "client",      name: "Sara El Fassi", message: "Nettoyage complet après rénovation.", date: "2025-03-11" },
            { from: "prestataire", name: "Nadia Berrada",  message: "Désolée, je ne peux plus me déplacer.", date: "2025-03-11" },
            { from: "admin",       name: "Admin",          message: "Réservation annulée et remboursée.", date: "2025-03-12" },
        ],
        createdAt: "2025-03-11", updatedAt: "2025-03-12",
    },

    // ── 9: Carte + En attente + Payé ─────────────────────────────────────────
    {
        id: "res9",
        clientId: "c3", clientName: "Khalid Bennis",
        providerId: "p2", providerName: "Fatima Zahra",
        offerId: "offer2", offerTitle: "Installation électrique complète", category: "Électricité",
        scheduledDate: "2025-03-21", scheduledTime: "09:00",
        amount: 350, commission: 52, providerPayout: 298,
        paymentMethod: "carte", paymentStatus: "paye",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "en_attente",
        messages: [
            { from: "client",      name: "Khalid Bennis", message: "Mise aux normes électriques salon et cuisine.", date: "2025-03-20" },
            { from: "prestataire", name: "Fatima Zahra",  message: "Je commence les travaux ce matin.", date: "2025-03-21" },
        ],
        createdAt: "2025-03-20", updatedAt: "2025-03-21",
    },

    // ── 10: Carte + En attente + Paiement en attente ─────────────────────────
    {
        id: "res10",
        clientId: "c1", clientName: "Mohamed Alami",
        providerId: "p3", providerName: "Karim Mansouri",
        offerId: "offer3", offerTitle: "Jardinage & entretien", category: "Jardinage",
        scheduledDate: "2025-03-28", scheduledTime: "10:00",
        amount: 80, commission: 12, providerPayout: 68,
        paymentMethod: "carte", paymentStatus: "en_attente",
        payoutStatus: "en_attente", commissionStatus: "en_attente",
        status: "en_attente",
        messages: [
            { from: "client", name: "Mohamed Alami", message: "Entretien jardin 200m², taille haies et tonte.", date: "2025-03-22" },
        ],
        createdAt: "2026-03-21", updatedAt: "2026-03-21",
    },
];