import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Offer } from "../../Data/Offer";
import {
    approveServiceOffer,
    getAdminServiceOffers,
    hideServiceOffer,
    requestServiceOfferAdjustment,
} from "../../api/serviceOffers";

export type { Offer };

type OffresContextType = {
    offers: Offer[];
    loadingOffers: boolean;
    offersError: string;
    refreshOffers: () => Promise<void>;
    approveOffer: (id: string) => Promise<Offer>;
    hideOffer: (id: string, note?: string) => Promise<Offer>;
    requestAdjustment: (id: string, note?: string) => Promise<Offer>;
};

const OffresContext = createContext<OffresContextType | null>(null);

export function OffresProvider({ children }: { children: ReactNode }) {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [offersError, setOffersError] = useState("");

    const refreshOffers = useCallback(async () => {
        try {
            setLoadingOffers(true);
            setOffersError("");

            const data = await getAdminServiceOffers();
            setOffers(data);
        } catch (error) {
            console.error("Failed to load service offers", error);
            setOffers([]);
            setOffersError("Erreur chargement offres");
        } finally {
            setLoadingOffers(false);
        }
    }, []);

    useEffect(() => {
        void refreshOffers();
    }, [refreshOffers]);

    const replaceOffer = useCallback((saved: Offer) => {
        setOffers((prev) =>
            prev.map((offer) => offer.id === saved.id ? saved : offer)
        );
    }, []);

    const approveOffer = useCallback(async (id: string) => {
        const saved = await approveServiceOffer(id);
        replaceOffer(saved);
        return saved;
    }, [replaceOffer]);

    const hideOffer = useCallback(async (id: string, note?: string) => {
        const saved = await hideServiceOffer(id, note);
        replaceOffer(saved);
        return saved;
    }, [replaceOffer]);

    const requestAdjustment = useCallback(async (id: string, note?: string) => {
        const saved = await requestServiceOfferAdjustment(id, note);
        replaceOffer(saved);
        return saved;
    }, [replaceOffer]);

    return (
        <OffresContext.Provider
            value={{
                offers,
                loadingOffers,
                offersError,
                refreshOffers,
                approveOffer,
                hideOffer,
                requestAdjustment,
            }}
        >
            {children}
        </OffresContext.Provider>
    );
}

export function useOffres() {
    const ctx = useContext(OffresContext);

    if (!ctx) {
        throw new Error("useOffres must be used within OffresProvider");
    }

    return ctx;
}