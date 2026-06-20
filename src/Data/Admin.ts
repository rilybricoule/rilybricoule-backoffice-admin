export type AdminRole =
    | "super_admin"
    | "moderateur"
    | "support";

export type AdminAccount = {

    id: string;

    nom: string;

    email: string;

    role: AdminRole;

    enabled: boolean;

    twoFAEnabled: boolean;

    createdAt: string;

    lastActivity: string;

};
export interface AuditEntry {
    id:        string;
    adminId:   string;
    adminName: string;
    action:    string;
    module:    string;
    details:   string;
    date:      string;
}

export type CreateAdminInput = {
    nom: string;
    email: string;
    role: AdminRole;
    enabled: boolean;
    twoFAEnabled: boolean;
    motDePasse: string;
};

// ── Mapping helpers (backend ↔ frontend) ──────────────────────────────────────

const ROLE_TO_FRONTEND: Record<string, AdminRole> = {
    ROLE_SUPER_ADMIN: "super_admin",
    ROLE_MODERATEUR:  "moderateur",
    ROLE_SUPPORT:     "support",
};

const ROLE_TO_BACKEND: Record<AdminRole, string> = {
    super_admin: "ROLE_SUPER_ADMIN",
    moderateur:  "ROLE_MODERATEUR",
    support:     "ROLE_SUPPORT",
};

export function mapBackendToAdmin(dto:any):AdminAccount{

    return {

        id: String(dto.id),

        nom: `${dto.firstName} ${dto.lastName}`,

        email: dto.email,

        role: ROLE_TO_FRONTEND[dto.roleName] ?? "support",

        enabled: Boolean(dto.enabled),

        twoFAEnabled: Boolean(dto.twoFAEnabled),


        createdAt:
            dto.createdAt?.split("T")[0] ?? "—",

        lastActivity:
            dto.updatedAt?.split("T")[0] ?? "—",

    };
}

export function roleToBackend(role: AdminRole): string {
    return ROLE_TO_BACKEND[role];
}
