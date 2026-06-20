// ServicesMockData.ts
export interface ServiceListing {
    id: string;
    categoryId: string;
    providerId: string;
    title: string;
    description: string;
    price: number;
    priceType: "forfait" | "heure" | "devis";
    isActive: boolean;
    createdAt: string;
}

export const serviceListingsMock: ServiceListing[] = [

    // ── Plomberie > Dépannage (cat2) ──────────────────────────────────────
    { id: "s1",  categoryId: "cat2",  providerId: "p1", title: "Dépannage plomberie urgence",     price: 150,  priceType: "heure",   isActive: true,  createdAt: "2025-01-15", description: "Intervention rapide 7j/7" },
    { id: "s2",  categoryId: "cat2",  providerId: "p2", title: "Débouchage canalisation",         price: 250,  priceType: "forfait", isActive: true,  createdAt: "2025-01-18", description: "Débouchage garanti" },

    // ── Plomberie > Installation sanitaires (cat2b) ───────────────────────
    { id: "s3",  categoryId: "cat2b", providerId: "p1", title: "Installation robinetterie",       price: 300,  priceType: "forfait", isActive: true,  createdAt: "2025-01-20", description: "Pose mitigeur et robinet" },
    { id: "s4",  categoryId: "cat2b", providerId: "p3", title: "Pose douche et baignoire",        price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-01-22", description: "Installation complète sanitaires" },

    // ── Plomberie > Détection de fuite (cat2c) ────────────────────────────
    { id: "s5",  categoryId: "cat2c", providerId: "p2", title: "Détection fuite sans casse",      price: 400,  priceType: "forfait", isActive: true,  createdAt: "2025-01-25", description: "Localisation précise de fuites" },

    // ── Électricité > Courant fort (cat3a) ────────────────────────────────
    { id: "s6",  categoryId: "cat3a", providerId: "p4", title: "Installation tableau électrique", price: 800,  priceType: "forfait", isActive: true,  createdAt: "2025-01-15", description: "Pose et câblage tableau" },
    { id: "s7",  categoryId: "cat3a", providerId: "p4", title: "Pose prises et interrupteurs",    price: 150,  priceType: "forfait", isActive: true,  createdAt: "2025-01-16", description: "Installation prises murales" },
    { id: "s8",  categoryId: "cat3a", providerId: "p5", title: "Câblage complet appartement",     price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-01-18", description: "Câblage neuf ou rénovation" },

    // ── Électricité > Domotique (cat4) ────────────────────────────────────
    { id: "s9",  categoryId: "cat4",  providerId: "p5", title: "Installation système domotique",  price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-02-01", description: "Domotique et automatisation" },
    { id: "s10", categoryId: "cat4",  providerId: "p4", title: "Installation alarme maison",      price: 1200, priceType: "forfait", isActive: false, createdAt: "2025-02-05", description: "Système alarme connecté" },

    // ── Électricité > Dépannage urgence (cat3c) ───────────────────────────
    { id: "s11", categoryId: "cat3c", providerId: "p4", title: "Dépannage panne électrique 24h",  price: 200,  priceType: "forfait", isActive: true,  createdAt: "2025-01-20", description: "Intervention rapide jour et nuit" },
    { id: "s12", categoryId: "cat3c", providerId: "p5", title: "Court-circuit et disjoncteur",    price: 180,  priceType: "forfait", isActive: true,  createdAt: "2025-01-22", description: "Diagnostic et réparation" },

    // ── Jardinage > Taille & tonte (cat5a) ───────────────────────────────
    { id: "s13", categoryId: "cat5a", providerId: "p6", title: "Tonte gazon",                     price: 80,   priceType: "forfait", isActive: true,  createdAt: "2025-01-10", description: "Tonte et ramassage inclus" },
    { id: "s14", categoryId: "cat5a", providerId: "p6", title: "Taille de haies",                 price: 100,  priceType: "forfait", isActive: true,  createdAt: "2025-01-10", description: "Taille et entretien haies" },

    // ── Jardinage > Paysagisme (cat6) ─────────────────────────────────────
    { id: "s15", categoryId: "cat6",  providerId: "p7", title: "Aménagement jardin",              price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-02-10", description: "Conception et aménagement paysager" },

    // ── Jardinage > Plantation (cat5b) ────────────────────────────────────
    { id: "s16", categoryId: "cat5b", providerId: "p7", title: "Plantation arbustes et fleurs",   price: 60,   priceType: "heure",   isActive: true,  createdAt: "2025-02-12", description: "Plantation et mise en terre" },

    // ── Ménage > Ménage complet (cat7a) ──────────────────────────────────
    { id: "s17", categoryId: "cat7a", providerId: "p8", title: "Ménage complet appartement",      price: 60,   priceType: "heure",   isActive: true,  createdAt: "2025-01-05", description: "Nettoyage de A à Z" },
    { id: "s18", categoryId: "cat7a", providerId: "p9", title: "Nettoyage hebdomadaire",          price: 50,   priceType: "heure",   isActive: true,  createdAt: "2025-01-06", description: "Passage régulier chaque semaine" },
    { id: "s19", categoryId: "cat7a", providerId: "p8", title: "Grand ménage de printemps",       price: 400,  priceType: "forfait", isActive: true,  createdAt: "2025-01-08", description: "Nettoyage en profondeur" },

    // ── Ménage > Repassage (cat8) ─────────────────────────────────────────
    { id: "s20", categoryId: "cat8",  providerId: "p9", title: "Repassage à domicile",            price: 40,   priceType: "heure",   isActive: true,  createdAt: "2025-01-10", description: "Repassage et pliage linge" },

    // ── Ménage > Après travaux (cat7b) ────────────────────────────────────
    { id: "s21", categoryId: "cat7b", providerId: "p8", title: "Nettoyage après travaux",         price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-01-12", description: "Nettoyage post-chantier complet" },

    // ── Peinture > Peinture intérieure (cat9a) ────────────────────────────
    { id: "s22", categoryId: "cat9a", providerId: "p10", title: "Peinture murs et plafonds",      price: 35,   priceType: "heure",   isActive: true,  createdAt: "2025-01-20", description: "Peinture intérieure soignée" },
    { id: "s23", categoryId: "cat9a", providerId: "p10", title: "Peinture chambre complète",      price: 800,  priceType: "forfait", isActive: true,  createdAt: "2025-01-22", description: "Chambre de A à Z" },

    // ── Peinture > Rénovation (cat10) ─────────────────────────────────────
    { id: "s24", categoryId: "cat10", providerId: "p10", title: "Rénovation complète appartement",price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-02-01", description: "Rénovation et rafraîchissement" },

    // ── Bricolage > Montage (cat14) ───────────────────────────────────────
    { id: "s25", categoryId: "cat14", providerId: "p11", title: "Montage meubles IKEA",           price: 30,   priceType: "heure",   isActive: true,  createdAt: "2025-01-15", description: "Montage rapide et soigné" },
    { id: "s26", categoryId: "cat14", providerId: "p11", title: "Fixation TV murale",             price: 150,  priceType: "forfait", isActive: true,  createdAt: "2025-01-16", description: "Fixation et câblage TV" },

    // ── Bricolage > Réparation (cat13a) ───────────────────────────────────
    { id: "s27", categoryId: "cat13a", providerId: "p11", title: "Petites réparations maison",    price: 50,   priceType: "heure",   isActive: true,  createdAt: "2025-01-18", description: "Réparations diverses" },

    // ── Déménagement > Transport (cat16) ──────────────────────────────────
    { id: "s28", categoryId: "cat16", providerId: "p12", title: "Transport petits volumes",       price: 200,  priceType: "forfait", isActive: true,  createdAt: "2025-02-01", description: "Camionnette jusqu'à 10m³" },
    { id: "s29", categoryId: "cat16", providerId: "p12", title: "Déménagement complet",           price: 0,    priceType: "devis",   isActive: true,  createdAt: "2025-02-02", description: "Déménagement clé en main" },

    // ── Informatique > Dépannage PC (cat17a) ──────────────────────────────
    { id: "s30", categoryId: "cat17a", providerId: "p13", title: "Dépannage PC et Mac",           price: 100,  priceType: "heure",   isActive: true,  createdAt: "2025-01-20", description: "Diagnostic et réparation" },
    { id: "s31", categoryId: "cat17a", providerId: "p13", title: "Suppression virus",             price: 150,  priceType: "forfait", isActive: true,  createdAt: "2025-01-22", description: "Nettoyage et sécurisation" },

    // ── Informatique > Réseau & WiFi (cat17b) ─────────────────────────────
    { id: "s32", categoryId: "cat17b", providerId: "p13", title: "Installation réseau WiFi",      price: 200,  priceType: "forfait", isActive: true,  createdAt: "2025-01-25", description: "Config routeur et répéteurs" },

    // ── Informatique > Formation (cat17c) ─────────────────────────────────
    { id: "s33", categoryId: "cat17c", providerId: "p14", title: "Formation bureautique",         price: 80,   priceType: "heure",   isActive: true,  createdAt: "2025-02-01", description: "Word, Excel, PowerPoint" },
    { id: "s34", categoryId: "cat17c", providerId: "p14", title: "Initiation smartphone",         price: 60,   priceType: "heure",   isActive: false, createdAt: "2025-02-05", description: "Prise en main iOS et Android" },
];