import type { ServiceCategory as Category } from "../../Data/ServiceCategory";
import { serviceListingsMock } from "../../Data/ServiceMockData";

/** Get all descendant IDs at any depth */
export function getAllDescendantIds(categoryId: string, allCategories: Category[]): string[] {
    const children = allCategories.filter((c) => c.parentId === categoryId);
    return children.flatMap((child) => [child.id, ...getAllDescendantIds(child.id, allCategories)]);
}

/** Count active services including all descendants */
export function getServiceCount(categoryId: string, allCategories: Category[]): number {
    const allIds = [categoryId, ...getAllDescendantIds(categoryId, allCategories)];
    return serviceListingsMock.filter((s) => allIds.includes(s.categoryId) && s.isActive).length;
}

/** Count unique providers including all descendants */
export function getProviderCount(categoryId: string, allCategories: Category[]): number {
    const allIds = [categoryId, ...getAllDescendantIds(categoryId, allCategories)];
    const ids = new Set(
        serviceListingsMock
            .filter((s) => allIds.includes(s.categoryId) && s.isActive)
            .map((s) => s.providerId)
    );
    return ids.size;
}

/** Get depth of a category (root = 0) */
export function getCategoryDepth(categoryId: string, allCategories: Category[]): number {
    const cat = allCategories.find((c) => c.id === categoryId);
    if (!cat || !cat.parentId) return 0;
    return 1 + getCategoryDepth(cat.parentId, allCategories);
}

/** Build a flat list of all categories with depth for tree selectors */
export function buildFlatTree(
    categories: Category[],
    parentId: string | null = null,
    depth = 0
): { category: Category; depth: number }[] {
    return categories
        .filter((c) => (c.parentId ?? null) === parentId)
        .flatMap((cat) => [
            { category: cat, depth },
            ...buildFlatTree(categories, cat.id, depth + 1),
        ]);
}