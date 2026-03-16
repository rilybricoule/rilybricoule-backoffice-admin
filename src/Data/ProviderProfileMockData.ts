export type ProviderReview = {
    id: string;
    providerId: string;
    clientId: string;
    clientName: string;
    rating: number;
    comment: string;
    date: string;
    serviceName: string;
};

export type ProviderService = {
    id: string;
    providerId: string;
    name: string;
    category: string;
    price: number;
    unit: "heure" | "forfait" | "m²";
    description?: string;
};

export const providerReviewsMock: ProviderReview[] = [
    { id: "pr1", providerId: "p4", clientId: "1", clientName: "Jean Dupont", rating: 5, comment: "Excellent travail, très satisfaite !", date: "2025-02-12", serviceName: "Ménage" },
    { id: "pr2", providerId: "p4", clientId: "2", clientName: "Marie Martin", rating: 4, comment: "Bon service, ponctuelle et efficace.", date: "2025-02-20", serviceName: "Repassage" },
    { id: "pr3", providerId: "p5", clientId: "3", clientName: "Pierre Bernard", rating: 5, comment: "Peinture impeccable, je recommande.", date: "2025-02-15", serviceName: "Peinture" },
    { id: "pr4", providerId: "p5", clientId: "1", clientName: "Jean Dupont", rating: 4, comment: "Très bien, délais respectés.", date: "2025-03-01", serviceName: "Rénovation" },
    { id: "pr5", providerId: "p6", clientId: "2", clientName: "Marie Martin", rating: 5, comment: "Parfait, je reviendrai !", date: "2025-02-18", serviceName: "Coiffure" },
    { id: "pr6", providerId: "p6", clientId: "4", clientName: "Sophie Dubois", rating: 5, comment: "Super coiffeuse, très à l'écoute.", date: "2025-02-25", serviceName: "Soins" },
    { id: "pr7", providerId: "p7", clientId: "5", clientName: "Thomas Petit", rating: 2, comment: "Retard de 2h, travail bâclé.", date: "2025-03-03", serviceName: "Bricolage" },
];

export const providerServicesMock: ProviderService[] = [
    { id: "ps1", providerId: "p4", name: "Ménage complet", category: "Ménage", price: 25, unit: "heure", description: "Ménage complet d'un logement" },
    { id: "ps2", providerId: "p4", name: "Repassage", category: "Repassage", price: 20, unit: "heure" },
    { id: "ps3", providerId: "p5", name: "Peinture murale", category: "Peinture", price: 40, unit: "heure" },
    { id: "ps4", providerId: "p5", name: "Rénovation intérieure", category: "Rénovation", price: 55, unit: "heure" },
    { id: "ps5", providerId: "p6", name: "Coupe femme", category: "Coiffure", price: 35, unit: "forfait" },
    { id: "ps6", providerId: "p6", name: "Soins capillaires", category: "Soins", price: 45, unit: "forfait" },
    { id: "ps7", providerId: "p7", name: "Montage meuble", category: "Montage", price: 42, unit: "heure" },
    { id: "ps8", providerId: "p7", name: "Petits travaux", category: "Bricolage", price: 38, unit: "heure" },
];