import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { promoMock } from "../../Data/PromoMockData";
import type { Promo, PromoStatus } from "../../Data/Promo";

export type { Promo, PromoStatus };

const STORAGE_KEY = "adminapp_promos";

function load(): Promo[] {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
    } catch (_) {}
    return promoMock;
}

function save(data: Promo[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

type ContextType = {
    promos:       Promo[];
    addPromo:     (promo: Omit<Promo, "id" | "usageCount" | "createdAt">) => void;
    updatePromo:  (id: string, updates: Partial<Promo>) => void;
    deletePromo:  (id: string) => void;
    toggleStatus: (id: string) => void;
};

const PromoContext = createContext<ContextType | null>(null);

export function PromoProvider({ children }: { children: ReactNode }) {
    const [promos, setPromos] = useState<Promo[]>(load);

    const addPromo = useCallback((promo: Omit<Promo, "id" | "usageCount" | "createdAt">) => {
        setPromos(prev => {
            const next = [...prev, {
                ...promo,
                id:         `promo_${Date.now()}`,
                usageCount: 0,
                createdAt:  new Date().toISOString().split("T")[0],
            }];
            save(next);
            return next;
        });
    }, []);

    const updatePromo = useCallback((id: string, updates: Partial<Promo>) => {
        setPromos(prev => {
            const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
            save(next);
            return next;
        });
    }, []);

    const deletePromo = useCallback((id: string) => {
        setPromos(prev => {
            const next = prev.filter(p => p.id !== id);
            save(next);
            return next;
        });
    }, []);

    const toggleStatus = useCallback((id: string) => {
        setPromos(prev => {
            const next = prev.map(p => {
                if (p.id !== id) return p;
                const newStatus: PromoStatus = p.status === "active" ? "inactive" : "active";
                return { ...p, status: newStatus };
            });
            save(next);
            return next;
        });
    }, []);

    return (
        <PromoContext.Provider value={{ promos, addPromo, updatePromo, deletePromo, toggleStatus }}>
            {children}
        </PromoContext.Provider>
    );
}

export function usePromos() {
    const ctx = useContext(PromoContext);
    if (!ctx) throw new Error("usePromos must be used within PromoProvider");
    return ctx;
}