import type { AdminAccount, AuditEntry } from "./Admin";

export const adminsMock: AdminAccount[] = [
    {
        id: "a1", nom: "Super Admin", email: "admin@rilybricoule.ma",
        role: "super_admin", twoFAEnabled: true,
        lastActivity: "2026-03-20", createdAt: "2025-01-01",
    },
    {
        id: "a2", nom: "Karim Moderateur", email: "karim@rilybricoule.ma",
        role: "moderateur", twoFAEnabled: false,
        lastActivity: "2026-03-19", createdAt: "2025-02-15",
    },
    {
        id: "a3", nom: "Sara Support", email: "sara@rilybricoule.ma",
        role: "support", twoFAEnabled: false,
        lastActivity: "2026-03-18", createdAt: "2025-03-01",
    },
    {
        id: "a4", nom: "Omar Moderateur", email: "omar@rilybricoule.ma",
        role: "moderateur", twoFAEnabled: false,
        lastActivity: "2026-02-10", createdAt: "2025-04-01",
    },
];

export const auditMock: AuditEntry[] = [
    { id: "log1", adminId: "a1", adminName: "Super Admin", action: "Suppression compte client", module: "Clients", details: "Client ID c5 supprimé", date: "2026-03-20" },
    { id: "log2", adminId: "a2", adminName: "Karim Moderateur", action: "Offre masquée", module: "Offres", details: "Offre ID offer3 masquée — tarif irréaliste", date: "2026-03-19" },
    { id: "log3", adminId: "a1", adminName: "Super Admin", action: "Commission modifiée", module: "Paramètres", details: "Taux commission: 12% → 15%", date: "2026-03-18" },
    { id: "log4", adminId: "a3", adminName: "Sara Support", action: "Ticket résolu", module: "Support", details: "Ticket ID tkt3 résolu", date: "2026-03-17" },
    { id: "log5", adminId: "a2", adminName: "Karim Moderateur", action: "Prestataire suspendu", module: "Prestataires", details: "Prestataire ID p6 suspendu — litiges multiples", date: "2026-03-16" },
    { id: "log6", adminId: "a1", adminName: "Super Admin", action: "Admin créé", module: "Sécurité", details: "Nouveau compte admin: Sara Support", date: "2026-03-15" },
    { id: "log7", adminId: "a1", adminName: "Super Admin", action: "Prestataire approuvé", module: "Prestataires", details: "Prestataire ID p3 approuvé", date: "2026-03-14" },
    { id: "log8", adminId: "a3", adminName: "Sara Support", action: "Réponse ticket", module: "Support", details: "Ticket ID tkt1 — réponse envoyée", date: "2026-03-13" },
];
