import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import {getFallbackPermissionsForRole, normalizeAdminRole} from "./authPermissions.ts";

type Props = {
    required: string;
    children: ReactNode;
};

type StoredAdminUser = {
    role?: string;
    roleName?: string;
    roles?: string[];
    permissions?: string[];
};



function readAdminUser(): StoredAdminUser | null {
    const raw =
        localStorage.getItem("adminUser") ??
        sessionStorage.getItem("adminUser") ??
        localStorage.getItem("user") ??
        sessionStorage.getItem("user");

    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredAdminUser;
    } catch {
        return null;
    }
}




export default function PermissionRoute({ required, children }: Props) {
    const token =
        localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");

    if (!token) return <Navigate to="/" replace />;

    const adminUser = readAdminUser();
    const roleRaw =
        adminUser?.roleName ??
        adminUser?.role ??
        adminUser?.roles?.[0] ??
        localStorage.getItem("role") ??
        sessionStorage.getItem("role") ??
        "";

    const role = normalizeAdminRole(roleRaw);

    const explicitPermissions = Array.isArray(adminUser?.permissions)
        ? adminUser.permissions.map((p) => String(p).trim().toUpperCase())
        : [];

    const fallbackPermissions = getFallbackPermissionsForRole(role);
    const effectivePermissions = Array.from(new Set([
        ...fallbackPermissions,
        ...explicitPermissions,
    ]));

    const allowed =
        effectivePermissions.includes("*") ||
        effectivePermissions.includes(required.toUpperCase());

    if (!allowed) return <UnauthorizedPage />;

    return <>{children}</>;
}
