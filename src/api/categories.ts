import api from "./api";
import type { CategoryAttribute } from "../Data/Category";


export type AdminCategoryApi = {
    id: number;
    parentId?: number | null;
    name: string;
    description?: string;
    icon?: string;
    attributesJson?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    serviceCount?: number;
    providerCount?: number;

};

export interface Category {
    id: string;
    parentId?: string | null;
    name: string;
    description?: string;
    icon?: string;
    attributes?: CategoryAttribute[];
    createdAt: string;
    updatedAt: string;
    serviceCount?: number;
    providerCount?: number;
}

export type CategoryPayload = {
    parentId?: number | null;
    name: string;
    description?: string;
    icon?: string;
    attributesJson?: string;
    active?: boolean;
};

export async function getAdminCategories(): Promise<AdminCategoryApi[]> {
    const { data } = await api.get<AdminCategoryApi[]>("/admin/categories");
    return data;
}

export async function createCategory(payload: CategoryPayload): Promise<AdminCategoryApi> {
    const { data } = await api.post<AdminCategoryApi>("/admin/categories", payload);
    return data;
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<AdminCategoryApi> {
    const { data } = await api.put<AdminCategoryApi>(`/admin/categories/${id}`, payload);
    return data;
}

export async function deleteCategory(id: number): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
}

export function parseCategoryAttributes(attributesJson?: string): CategoryAttribute[] | undefined {
    if (!attributesJson) return undefined;

    try {
        const parsed = JSON.parse(attributesJson);
        return Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}
export interface AdminCategoryStatsApi {
    totalCategories: number;
    totalSubCategories: number;
    totalServices: number;
    totalProviders: number;
}

export async function getAdminCategoryStats(): Promise<AdminCategoryStatsApi> {
    const response = await api.get<AdminCategoryStatsApi>("/admin/categories/stats");
    return response.data;
}

