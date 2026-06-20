import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

function getActiveStorage(): Storage | null {
    if (localStorage.getItem("authStorage") === "local") return localStorage;
    if (sessionStorage.getItem("authStorage") === "session") return sessionStorage;

    // fallback if old sessions exist
    if (localStorage.getItem("accessToken")) return localStorage;
    if (sessionStorage.getItem("accessToken")) return sessionStorage;

    return null;
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const location = useLocation();
    const storage = getActiveStorage();

    const accessToken = storage?.getItem("accessToken") ?? null;

    const pendingPasswordReset = storage?.getItem("pendingPasswordReset") === "true";
    if (pendingPasswordReset) {
        const email = storage?.getItem("pendingPasswordResetEmail") ?? "";
        const query = email ? `?email=${encodeURIComponent(email)}` : "";
        const target = `/change-password-required${query}`;

        if (location.pathname !== "/change-password-required") {
            return <Navigate to={target} replace />;
        }
    }

    // use token as source of truth, not isAuthenticated
    if (!accessToken) {
        if (location.pathname !== "/") return <Navigate to="/" replace />;
        return null;
    }

    return <>{children}</>;
}
