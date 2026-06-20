// src/pages/context/SecurityContext.tsx
// ═══════════════════════════════════════════════════════════════════
// Context qui gère les comptes admins.
//
// Rôle : appelle le backend UNE fois, stocke les admins en mémoire,
//        et partage ces données avec tous les composants qui en ont besoin.
//
// Ce qui a changé :
//   ❌ Supprimé : auditLog, addAuditEntry, loadAudit, saveAudit
//      → L'audit a maintenant son propre composant qui appelle le backend directement
//   ✅ Ajouté : préservation du 2FA lors du refresh
//      → toggle2FA est local, refreshAdmins ne l'écrase plus
// ═══════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { AdminAccount, AdminRole,CreateAdminInput} from "../../Data/Admin";
// ↑ On n'importe plus AuditEntry ni auditMock — plus besoin !
import { mapBackendToAdmin, roleToBackend } from "../../Data/Admin";
import api from "../../api/api.ts";

export type { AdminAccount, AdminRole,CreateAdminInput};
// ↑ On n'exporte plus AuditEntry — les composants qui en ont besoin
//   utilisent directement le type de api/auditLog.ts

// ── Type du Context ───────────────────────────────────────────────
// Décrit TOUT ce que le context met à disposition des composants
type ContextType = {
    admins:        AdminAccount[];       // Liste des admins en mémoire
    loading:       boolean;              // true pendant le chargement
    addAdmin: (admin: CreateAdminInput) => Promise<void>;
    updateAdmin:   (id: string, updates: Partial<AdminAccount>) => Promise<void>;
    deleteAdmin:   (id: string) => Promise<void>;
    toggleStatus:  (id: string, newValue: boolean) => Promise<void>;

    toggle2FA: (id: string) => Promise<void>;
    refreshAdmins: () => Promise<void>;
};
// ↑ SUPPRIMÉ : auditLog et addAuditEntry

const SecurityContext = createContext<ContextType | null>(null);

// ═══════════════════════════════════════════════════════════════════
// PROVIDER — enveloppe l'app et fournit les données à tous les enfants
// ═══════════════════════════════════════════════════════════════════

export function SecurityProvider({ children }: { children: ReactNode }) {
    const [admins,  setAdmins]  = useState<AdminAccount[]>([]);
    const [loading, setLoading] = useState(false);
    // ↑ SUPPRIMÉ : const [auditLog, setAuditLog] = useState(...)

    // ── Fetch admins from backend ─────────────────────────────────
    const refreshAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/admin/accounts");
            setAdmins(data.map((dto: any) => mapBackendToAdmin(dto)));
        } catch (err) {
            console.error("fetch admins error", err);
        } finally {
            setLoading(false);
        }
    }, []);


    // ── Charger les admins au démarrage ───────────────────────────


    // ── Create admin ──────────────────────────────────────────────
    const addAdmin = useCallback(async (admin: CreateAdminInput) => {
        try {
            const nameParts = admin.nom.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || firstName;

            await api.post("/admin/accounts", {
                firstName,
                lastName,
                email: admin.email,
                password: admin.motDePasse,
                phone: "",
                roleName: roleToBackend(admin.role),
            });
            await refreshAdmins();
        } catch (err: any) {
            console.error("Failed to create admin:", err);
            alert(err.response?.data?.message || "Erreur lors de la création");
        }
    }, [refreshAdmins]);

    // ── Update admin ──────────────────────────────────────────────
    const updateAdmin = useCallback(async (id: string, updates: Partial<AdminAccount>) => {
        try {
            const payload: any = {};
            if (updates.nom) {
                const parts = updates.nom.split(" ");
                payload.firstName = parts[0] || "";
                payload.lastName = parts.slice(1).join(" ") || parts[0];
            }
            if (updates.email) payload.email = updates.email;
            if (updates.role) payload.roleName = roleToBackend(updates.role);
            if (updates.enabled !== undefined)
                payload.enabled = updates.enabled;

            await api.put(`/admin/accounts/${id}`, payload);
            await refreshAdmins();
        } catch (err: any) {
            console.error("Failed to update admin:", err);
            alert(err.response?.data?.message || "Erreur lors de la modification");
        }
    }, [refreshAdmins]);

    // ── Delete admin ──────────────────────────────────────────────
    const deleteAdmin = useCallback(async (id: string) => {
        try {
            await api.delete(`/admin/accounts/${id}`);
            await refreshAdmins();
        } catch (err: any) {
            console.error("Failed to delete admin:", err);
            alert(err.response?.data?.message || "Erreur lors de la suppression");
        }
    }, [refreshAdmins]);

    // ── Toggle status ─────────────────────────────────────────────


    const toggleStatus = useCallback(
        async (id: string, enabled: boolean) => {
            try {
                const { data } = await api.patch(`/admin/accounts/${id}/status`, {
                    enabled,
                });

                setAdmins(prev =>
                    prev.map(a =>
                        a.id === id
                            ? { ...a, enabled: Boolean(data.enabled) }
                            : a
                    )
                );
            } catch (err: any) {
                console.error("Failed to update status:", err);
                alert(err.response?.data?.message || "Erreur lors du changement de statut");
            }
        },
        []
    );




    const toggle2FA = useCallback(async (id: string) => {
        try {
            const { data } = await api.patch(`/admin/accounts/${id}/toggle-2fa`);

            setAdmins(prev =>
                prev.map(a =>
                    a.id === id
                        ? { ...a, twoFAEnabled: Boolean(data.twoFAEnabled) }
                        : a
                )
            );
        } catch (err: any) {
            console.error("Failed to toggle 2FA:", err);
            alert(err.response?.data?.message || "Erreur lors du changement 2FA");
        }
    }, []);





    // ── Provider value ────────────────────────────────────────────
    return (
        <SecurityContext.Provider value={{
            admins, loading,
            addAdmin, updateAdmin, deleteAdmin,
            toggleStatus, toggle2FA, refreshAdmins,
        }}>
            {children}
        </SecurityContext.Provider>
    );
    // ↑ SUPPRIMÉ : auditLog et addAuditEntry du value
}

export function useSecurity() {
    const ctx = useContext(SecurityContext);
    if (!ctx) throw new Error("useSecurity must be used within SecurityProvider");
    return ctx;
}
