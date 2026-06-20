export type AdminRole =
    | "ROLE_SUPER_ADMIN"
    | "ROLE_MODERATEUR"
    | "ROLE_SUPPORT";

export function normalizeAdminRole(input?: string): AdminRole | "" {
    const role = (input ?? "").trim().toUpperCase();

    if (role === "ROLE_SUPER_ADMIN" || role === "SUPER_ADMIN") return "ROLE_SUPER_ADMIN";
    if (role === "ROLE_MODERATEUR" || role === "MODERATEUR") return "ROLE_MODERATEUR";
    if (role === "ROLE_SUPPORT" || role === "SUPPORT") return "ROLE_SUPPORT";

    return "";
}

export const roleFallbackPermissions: Record<AdminRole, string[]> = {
    ROLE_SUPER_ADMIN: ["*"],
    ROLE_MODERATEUR: [
        "DASHBOARD_VIEW",
        "CLIENTS_VIEW",
        "CLIENTS_EDIT",
        "PROVIDERS_VIEW",
        "PROVIDERS_APPROVE",
        "PROVIDERS_SUSPEND",
        "RESERVATIONS_VIEW",
        "RESERVATIONS_INTERVENE",
        "PAYMENTS_VIEW",
        "CATEGORIES_VIEW",
        "CATEGORIES_MANAGE",
        "SERVICES_VIEW",
        "SERVICES_MANAGE",
        "PROMOS_VIEW",
        "PROMOS_MANAGE",
        "NOTIFICATIONS_VIEW",
        "NOTIFICATIONS_SEND_TARGETED",
        "TICKETS_VIEW",
        "TICKETS_RESPOND",
        "TICKETS_MANAGE",
        "CONTENT_VIEW",
        "CONTENT_MODERATE",
        "AUDIT_VIEW_OWN",
    ],
    ROLE_SUPPORT: [
        "DASHBOARD_VIEW",
        "CLIENTS_VIEW",
        "PROVIDERS_VIEW",
        "RESERVATIONS_VIEW",
        "PAYMENTS_VIEW",
        "NOTIFICATIONS_VIEW",
        "TICKETS_VIEW",
        "TICKETS_RESPOND",
    ],
};

export function getFallbackPermissionsForRole(role?: string): string[] {
    const normalizedRole = normalizeAdminRole(role);

    if (!normalizedRole) return [];

    return roleFallbackPermissions[normalizedRole] ?? [];
}