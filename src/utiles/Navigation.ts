import type {NavigateFunction} from "react-router-dom";

export function navigateTo(id: string, navigate: NavigateFunction): void {
    const routes: Record<string, string> = {
        dashboard:     "/dashboard",
        clients:       "/clients",
        categories:    "/categories",
        offers:        "/offers",
        reservations:  "/reservations",
        payments: "/payments",
        promo:         "/promo",
        notifications: "/notifications",
        support:       "/support",
        content:       "/content",
        security: "/security",
        version:"/version",
        settings: "/settings",
        marketing:     "/marketing",

    };

    const providerStatusMap: Record<string, string> = {
        providers:           "/providers",
        providers_pending:   "/providers?status=pending",
        providers_approved:  "/providers?status=approved",
        providers_suspended: "/providers?status=suspended",
    };

    if (routes[id]) {
        navigate(routes[id]);
    } else if (id in providerStatusMap) {
        navigate(providerStatusMap[id]);
    }
}