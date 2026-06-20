import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AdminProvider } from "../../api/providers";
import {
    approveProvider,
    fetchAdminProviders,
    reactivateProvider,
    rejectProvider,
    suspendProvider,
} from "../../api/providers";

type ProviderAction = "approve" | "reject" | "suspend" | "reactivate";

type ProvidersContextType = {
    providers: AdminProvider[];
    loadingProviders: boolean;
    providersError: string;
    refreshProviders: () => Promise<void>;
    updateProviderStatus: (
        id: number,
        action: ProviderAction,
        adminComment?: string
    ) => Promise<AdminProvider>;
    updateProvider: (updated: AdminProvider) => void;
    getProviderById: (id: number) => AdminProvider | undefined;
    isProviderVisible: (provider: AdminProvider) => boolean;
};

const ProvidersContext = createContext<ProvidersContextType | null>(null);

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
    const [providers, setProviders] = useState<AdminProvider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);
    const [providersError, setProvidersError] = useState("");

    const refreshProviders = useCallback(async () => {
        try {
            setLoadingProviders(true);
            setProvidersError("");

            const data = await fetchAdminProviders();
            setProviders(data);
        } catch (error) {
            console.error("Failed to load providers", error);
            setProviders([]);
            setProvidersError("Erreur chargement prestataires");
        } finally {
            setLoadingProviders(false);
        }
    }, []);

    useEffect(() => {
        void refreshProviders();
    }, [refreshProviders]);

    const replaceProvider = useCallback((updated: AdminProvider) => {
        setProviders((prev) =>
            prev.map((provider) =>
                provider.id === updated.id ? updated : provider
            )
        );
    }, []);

    const updateProviderStatus = useCallback(
        async (
            id: number,
            action: ProviderAction,
            adminComment?: string
        ): Promise<AdminProvider> => {
            let updated: AdminProvider;

            if (action === "approve") {
                updated = await approveProvider(id);
            } else if (action === "reject") {
                updated = await rejectProvider(id);
            } else if (action === "suspend") {
                updated = await suspendProvider(id);
            } else {
                updated = await reactivateProvider(id);
            }

            if (adminComment) {
                updated = { ...updated, adminComment };
            }

            replaceProvider(updated);
            return updated;
        },
        [replaceProvider]
    );

    const updateProvider = useCallback(
        (updated: AdminProvider) => {
            replaceProvider(updated);
        },
        [replaceProvider]
    );

    const getProviderById = useCallback(
        (id: number) => providers.find((provider) => provider.id === id),
        [providers]
    );

    const isProviderVisible = useCallback((provider: AdminProvider) => {
        return provider.status === "approved";
    }, []);

    return (
        <ProvidersContext.Provider
            value={{
                providers,
                loadingProviders,
                providersError,
                refreshProviders,
                updateProviderStatus,
                updateProvider,
                getProviderById,
                isProviderVisible,
            }}
        >
            {children}
        </ProvidersContext.Provider>
    );
}

export function useProviders() {
    const ctx = useContext(ProvidersContext);

    if (!ctx) {
        throw new Error("useProviders must be used within ProvidersProvider");
    }

    return ctx;
}