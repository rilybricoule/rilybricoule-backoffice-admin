// src/auth/routePermissionMap.ts

export type AppPermission =
    | "DASHBOARD_VIEW"
    | "CLIENTS_VIEW"
    | "PROVIDERS_VIEW"
    | "RESERVATIONS_VIEW"
    | "PAYMENTS_VIEW"
    | "CATEGORIES_VIEW"
    | "CONTENT_VIEW"
    | "PROMOS_VIEW"
    | "NOTIFICATIONS_SEND_TARGETED"
    | "TICKETS_VIEW"
    | "ADMINS_VIEW"
    | "NOTIFICATIONS_VIEW"
    | "SETTINGS_VIEW";

export const routePermissionMap = {
    "/": null,
    "/forbidden": null,
    "/login-2fa": null,
    "/change-password-required": null,

    "/dashboard": "DASHBOARD_VIEW",
    "/clients": "CLIENTS_VIEW",
    "/clients/:id": "CLIENTS_VIEW",
    "/providers": "PROVIDERS_VIEW",
    "/providers/:id": "PROVIDERS_VIEW",
    "/categories": "CATEGORIES_VIEW",
    "/offers": "CONTENT_VIEW",
    "/reservations": "RESERVATIONS_VIEW",
    "/payments": "PAYMENTS_VIEW",
    "/promo": "PROMOS_VIEW",
    "/notifications": "NOTIFICATIONS_VIEW",
    "/support": "TICKETS_VIEW",
    "/content": "CONTENT_VIEW",
    "/security": "ADMINS_VIEW",
    "/settings": "SETTINGS_VIEW",
    "/version": "CONTENT_VIEW",
    "/marketing": "PROMOS_VIEW",
    "/profile": null,


    // page protégée mais pas permission métier backend (self-service 2FA)
    "/settings/2fa": null,
} as const;
