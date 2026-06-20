// Category.ts
export interface CategoryAttribute {
    id: string;
    name: string;
    type: "text" | "number" | "select";
    unit?: string;
    options?: string[];
    required: boolean;
}

export interface Category {
    id: string;
    parentId?: string | null;
    name: string;
    description?: string;
    icon?: string;
    attributes?: CategoryAttribute[];
    createdAt: string;
    updatedAt: string;
}