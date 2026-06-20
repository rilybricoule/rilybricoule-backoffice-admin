import api, { clearAuth } from "./api";
import {
    getFallbackPermissionsForRole,
    normalizeAdminRole,
} from "../components/authPermissions";

export type LoginResponse = {
    id?: number;
    accessToken: string;
    refreshToken: string;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];
    roleName?: string;
    permissions?: string[];
    requires2FA?: false;
    requiresPasswordChange?: false;
};

export type PasswordChangeRequiredResponse = {
    requiresPasswordChange: true;
    email: string;
};

export type TwoFARequiredResponse = {
    requires2FA: true;
    tempToken: string;
};

export type LoginApiResponse =
    | LoginResponse
    | PasswordChangeRequiredResponse
    | TwoFARequiredResponse;

type StoredAdminUser = {
    id?: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    role: string;
    roleName: string;
    permissions: string[];
};

export type TwoFASetupResponse = {
    email: string;
    secret: string;
    qrCodeBase64: string;
    enabled: boolean;
};



export function storeAuth(data: LoginResponse, remember: boolean): void {
    clearAuth();

    const storage = remember ? localStorage : sessionStorage;
    const authStorageType = remember ? "local" : "session";

    const roleFromApi = data.roleName ?? data.roles?.[0] ?? "";
    const normalizedRole = normalizeAdminRole(roleFromApi);

    const apiPermissions = Array.isArray(data.permissions)
        ? data.permissions.map((permission) => String(permission).toUpperCase())
        : [];

    const effectivePermissions = Array.from(
        new Set([
            ...getFallbackPermissionsForRole(normalizedRole),
            ...apiPermissions,
        ])
    );

    const adminUser: StoredAdminUser = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles ?? (normalizedRole ? [normalizedRole] : []),
        role: normalizedRole,
        roleName: normalizedRole,
        permissions: effectivePermissions,
    };

    storage.setItem("authStorage", authStorageType);
    storage.setItem("accessToken", data.accessToken);
    storage.setItem("refreshToken", data.refreshToken);
    storage.setItem("isAuthenticated", "true");
    storage.setItem("role", normalizedRole);
    storage.setItem("adminUser", JSON.stringify(adminUser));

    window.dispatchEvent(new Event("admin-auth-changed"));
}

export function logoutAdmin(): void {
    clearAuth();
    window.location.href = "/";
}

export function getCurrentAdminUser(): StoredAdminUser | null {
    const storage =
        localStorage.getItem("authStorage") === "local"
            ? localStorage
            : sessionStorage.getItem("authStorage") === "session"
                ? sessionStorage
                : null;

    const raw = storage?.getItem("adminUser");
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredAdminUser;
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    const storage =
        localStorage.getItem("authStorage") === "local"
            ? localStorage
            : sessionStorage.getItem("authStorage") === "session"
                ? sessionStorage
                : null;

    return storage?.getItem("isAuthenticated") === "true";
}

export async function loginAdmin(
    email: string,
    password: string
): Promise<LoginApiResponse> {
    const { data } = await api.post<LoginApiResponse>("/auth/login", {
        email,
        password,
    });

    return data;
}

export async function verify2FALogin(
    tempToken: string,
    code: string
): Promise<LoginResponse> {
    const authHeader = tempToken.startsWith("Bearer ")
        ? tempToken
        : `Bearer ${tempToken}`;

    const { data } = await api.post<LoginResponse>(
        "/auth/login/2fa",
        { code },
        { headers: { Authorization: authHeader } }
    );

    return data;
}

export async function changePasswordRequired(
    email: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/change-password-required", {
        email,
        currentPassword,
        newPassword,
        confirmPassword,
    });

    return data;
}

export async function validateToken(): Promise<boolean> {
    try {
        const { data } = await api.get<{ valid: boolean }>("/auth/validate");
        return data.valid;
    } catch {
        return false;
    }
}

export async function setupMy2FA(): Promise<TwoFASetupResponse> {
    const { data } = await api.post<TwoFASetupResponse>("/auth/2fa/setup");
    return data;
}

export async function enableMy2FA(code: string): Promise<void> {
    await api.post("/auth/2fa/enable", { code });
}

export async function disableMy2FA(code: string): Promise<void> {
    await api.post("/auth/2fa/disable", { code });
}

