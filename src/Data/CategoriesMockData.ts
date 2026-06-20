// CategoriesMockData.ts
import type { Category } from "./Category";

export const categoriesMock: Category[] = [

    // ── Plomberie ─────────────────────────────────────────────────────────
    {
        id: "cat1", parentId: null,
        name: "Plomberie", icon: "🔧",
        description: "Installation, réparation et maintenance des systèmes de plomberie",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat2", parentId: "cat1",
        name: "Dépannage", icon: "🚨",
        description: "Interventions urgentes et dépannage à domicile",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat2b", parentId: "cat1",
        name: "Installation sanitaires", icon: "🚿",
        description: "Pose de robinetterie, douches et baignoires",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat2c", parentId: "cat1",
        name: "Détection de fuite", icon: "💧",
        description: "Localisation et réparation de fuites",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Électricité ───────────────────────────────────────────────────────
    {
        id: "cat3", parentId: null,
        name: "Électricité", icon: "⚡",
        description: "Installation électrique, mise aux normes, dépannage",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat3a", parentId: "cat3",
        name: "Courant fort", icon: "🔌",
        description: "Tableau, câblage, prises et interrupteurs",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat4", parentId: "cat3",
        name: "Domotique", icon: "📡",
        description: "Systèmes domotiques et automatisation du logement",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat3c", parentId: "cat3",
        name: "Dépannage urgence", icon: "🚨",
        description: "Intervention rapide 24h/24",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Jardinage ─────────────────────────────────────────────────────────
    {
        id: "cat5", parentId: null,
        name: "Jardinage", icon: "🌿",
        description: "Entretien des jardins, plantations, tonte, taille",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat5a", parentId: "cat5",
        name: "Taille & tonte", icon: "✂️",
        description: "Taille des haies et tonte du gazon",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat6", parentId: "cat5",
        name: "Paysagisme", icon: "🏡",
        description: "Aménagement paysager et conception de jardins",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat5b", parentId: "cat5",
        name: "Plantation", icon: "🌱",
        description: "Plantation et aménagement d'espaces verts",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Ménage ────────────────────────────────────────────────────────────
    {
        id: "cat7", parentId: null,
        name: "Ménage", icon: "🧹",
        description: "Nettoyage et entretien courant du domicile",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
        attributes: [
            { id: "attr1", name: "Taille du logement", type: "number", unit: "m²", required: true },
            { id: "attr1b", name: "Type de logement", type: "select", options: ["Appartement", "Villa", "Bureau", "Autre"], required: true },
        ],
    },
    {
        id: "cat7a", parentId: "cat7",
        name: "Ménage complet", icon: "🧽",
        description: "Nettoyage général de A à Z",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat8", parentId: "cat7",
        name: "Repassage", icon: "👔",
        description: "Services de repassage et pliage du linge",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat7b", parentId: "cat7",
        name: "Après travaux", icon: "🏗️",
        description: "Nettoyage post-chantier",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Peinture ──────────────────────────────────────────────────────────
    {
        id: "cat9", parentId: null,
        name: "Peinture", icon: "🎨",
        description: "Peinture intérieure et extérieure, rénovation",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat9a", parentId: "cat9",
        name: "Peinture intérieure", icon: "🖌️",
        description: "Peinture de murs et plafonds intérieurs",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat10", parentId: "cat9",
        name: "Rénovation", icon: "🏠",
        description: "Travaux de rénovation et aménagement",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Coiffure ──────────────────────────────────────────────────────────
    {
        id: "cat11", parentId: null,
        name: "Coiffure", icon: "✂️",
        description: "Coupe, coloration et soins capillaires",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat12", parentId: "cat11",
        name: "Soins", icon: "💆",
        description: "Soins esthétiques et capillaires",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat11a", parentId: "cat11",
        name: "Coloration", icon: "🎨",
        description: "Coloration et mèches",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Bricolage ─────────────────────────────────────────────────────────
    {
        id: "cat13", parentId: null,
        name: "Bricolage", icon: "🔨",
        description: "Petits travaux et montage de meubles",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
        attributes: [
            {
                id: "attr2", name: "Type d'intervention", type: "select",
                options: ["Montage meuble", "Petits travaux", "Réparation"],
                required: true,
            },
        ],
    },
    {
        id: "cat14", parentId: "cat13",
        name: "Montage", icon: "🪛",
        description: "Montage de meubles et équipements",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat13a", parentId: "cat13",
        name: "Réparation", icon: "🔧",
        description: "Petites réparations à domicile",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Déménagement ──────────────────────────────────────────────────────
    {
        id: "cat15", parentId: null,
        name: "Déménagement", icon: "📦",
        description: "Services de déménagement et transport de biens",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
        attributes: [
            {
                id: "attr3", name: "Volume estimé", type: "select",
                options: ["Studio", "2 pièces", "3 pièces", "4+ pièces"],
                required: true,
            },
            { id: "attr4", name: "Étage départ",  type: "number", unit: "étage", required: false },
            { id: "attr5", name: "Étage arrivée", type: "number", unit: "étage", required: false },
            {
                id: "attr6", name: "Ascenseur disponible", type: "select",
                options: ["Oui", "Non"],
                required: true,
            },
        ],
    },
    {
        id: "cat16", parentId: "cat15",
        name: "Transport", icon: "🚚",
        description: "Transport de marchandises et livraison",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },
    {
        id: "cat15a", parentId: "cat15",
        name: "Emballage", icon: "📫",
        description: "Service d'emballage et de protection des biens",
        createdAt: "2025-01-10", updatedAt: "2025-01-10",
    },

    // ── Informatique ──────────────────────────────────────────────────────
    {
        id: "cat17", parentId: null,
        name: "Informatique", icon: "💻",
        description: "Dépannage informatique, installation et formation",
        createdAt: "2025-01-15", updatedAt: "2025-01-15",
    },
    {
        id: "cat17a", parentId: "cat17",
        name: "Dépannage PC", icon: "🖥️",
        description: "Réparation et diagnostic ordinateurs",
        createdAt: "2025-01-15", updatedAt: "2025-01-15",
    },
    {
        id: "cat17b", parentId: "cat17",
        name: "Réseau & WiFi", icon: "📶",
        description: "Installation et configuration réseau",
        createdAt: "2025-01-15", updatedAt: "2025-01-15",
    },
    {
        id: "cat17c", parentId: "cat17",
        name: "Formation", icon: "📚",
        description: "Formation informatique à domicile",
        createdAt: "2025-01-15", updatedAt: "2025-01-15",
    },
];