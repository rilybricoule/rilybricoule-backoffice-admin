import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ServiceCategory } from "../../Data/ServiceCategory";
import {
    createCategory as createCategoryApi,
    deleteCategory as deleteCategoryApi,
    getAdminCategories,
    getAdminCategoryStats,
    parseCategoryAttributes,
    updateCategory as updateCategoryApi,
    type CategoryPayload,
} from "../../api/categories";

type CategoriesContextType = {
    categories: ServiceCategory[];
    loadingCategories: boolean;
    categoriesError: string;
    refreshCategories: () => Promise<void>;

    createCategory: (
        category: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">
    ) => Promise<ServiceCategory>;
    categoryStats: CategoryStats;
    updateCategory: (
        id: string,
        category: Partial<ServiceCategory>
    ) => Promise<ServiceCategory>;

    deleteCategory: (id: string) => Promise<void>;
};

type CategoryStats = {
    totalCategories: number;
    totalSubCategories: number;
    totalServices: number;
    totalProviders: number;
};
const CategoriesContext = createContext<CategoriesContextType | null>(null);

function toServiceCategory(category: any): ServiceCategory {
    return {
        id: String(category.id),
        parentId: category.parentId == null ? null : String(category.parentId),
        name: category.name,
        description: category.description,
        icon: category.icon,
        attributes: parseCategoryAttributes(category.attributesJson),
        createdAt: category.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        updatedAt: category.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        serviceCount: category.serviceCount,
        providerCount: category.providerCount,
    };
}

function toPayload(category: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt"> | Partial<ServiceCategory>): CategoryPayload {
    return {
        parentId: category.parentId ? Number(category.parentId) : null,
        name: category.name ?? "",
        description: category.description,
        icon: category.icon,
        attributesJson: JSON.stringify(category.attributes ?? []),
        active: true,
    };
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoriesError, setCategoriesError] = useState("");
    const [categoryStats, setCategoryStats] = useState<CategoryStats>({
        totalCategories: 0,
        totalSubCategories: 0,
        totalServices: 0,
        totalProviders: 0,
    });
    const refreshCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            setCategoriesError("");

            const [data, stats] = await Promise.all([
                getAdminCategories(),
                getAdminCategoryStats(),
            ]);

            setCategories(data.map(toServiceCategory));
            setCategoryStats(stats);
        } catch (error) {
            console.error("Failed to load categories", error);
            setCategories([]);
            setCategoriesError("Erreur chargement catégories");
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        void refreshCategories();
    }, [refreshCategories]);

    const createCategory = useCallback(async (
        category: Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">
    ): Promise<ServiceCategory> => {
        const saved = toServiceCategory(
            await createCategoryApi(toPayload(category))
        );

        setCategories((prev) => [saved, ...prev]);

        return saved;
    }, []);

    const updateCategory = useCallback(async (
        id: string,
        category: Partial<ServiceCategory>
    ): Promise<ServiceCategory> => {
        const saved = toServiceCategory(
            await updateCategoryApi(Number(id), toPayload(category))
        );

        setCategories((prev) =>
            prev.map((item) => item.id === id ? saved : item)
        );

        return saved;
    }, []);

    const deleteCategory = useCallback(async (id: string) => {
        await deleteCategoryApi(Number(id));

        setCategories((prev) =>
            prev.filter((item) => item.id !== id && item.parentId !== id)
        );
    }, []);

    return (
        <CategoriesContext.Provider
            value={{
                categories,
                categoryStats,
                loadingCategories,
                categoriesError,
                refreshCategories,
                createCategory,
                updateCategory,
                deleteCategory,
            }}
        >
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    const ctx = useContext(CategoriesContext);
    if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
    return ctx;
}