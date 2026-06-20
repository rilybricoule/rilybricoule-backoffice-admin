export type CategoryAttribute = {
    id: string;
    name: string;
    type: "number" | "text" | "select";
    unit?: string;        // ex: "m²" pour taille logement
    options?: string[];   // pour type "select"
    required?: boolean;
};

export type ServiceCategory = {
    id: string;
    name: string;
    description?: string;
    parentId?: string | null;
    icon?: string;
    attributes?: CategoryAttribute[];
    createdAt: string;
    updatedAt: string;
    serviceCount?: number;
    providerCount?: number;
};