import axios, { AxiosHeaders } from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { navigateFromAnywhere } from "./navigationbridge.ts";

type RetryableRequestConfig = AxiosRequestConfig & {
    _retry?: boolean;
};

type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
};

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8085/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

function getAuthStorage(): Storage | null {
    if (localStorage.getItem("authStorage") === "local") return localStorage;
    if (sessionStorage.getItem("authStorage") === "session") return sessionStorage;
    return null;
}

export function clearAuth(): void {
    const keys = [
        "authStorage",
        "accessToken",
        "isAuthenticated",
        "refreshToken",
        "role",
        "adminUser",
        "temp2FAToken",
    ];

    for (const key of keys) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }

    window.dispatchEvent(new Event("admin-auth-changed"));
}

function readStoredAdminEmail(): string {
    const raw =
        localStorage.getItem("adminUser") ??
        sessionStorage.getItem("adminUser");

    if (!raw) return "";

    try {
        const parsed = JSON.parse(raw) as { email?: string };
        return parsed.email ?? "";
    } catch {
        return "";
    }
}

function getAccessToken(): string | null {
    return getAuthStorage()?.getItem("accessToken") ?? null;
}

function setAuthorizationHeader(
    config: AxiosRequestConfig,
    token: string
): void {
    const headers = AxiosHeaders.from(
        config.headers as unknown as AxiosHeaders | Record<string, string> | undefined
    );

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
}

async function refreshAccessToken(): Promise<string> {
    const storage = getAuthStorage();
    const refreshToken = storage?.getItem("refreshToken");

    if (!storage || !refreshToken) {
        throw new Error("No refresh token available");
    }

    const response = await axios.post<RefreshResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
    );

    storage.setItem("accessToken", response.data.accessToken);
    storage.setItem("refreshToken", response.data.refreshToken);

    return response.data.accessToken;
}

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        setAuthorizationHeader(config, token);
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as RetryableRequestConfig | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url ?? "";
        const isLoginRequest = requestUrl.includes("/auth/login");
        const isTwoFALoginRequest = requestUrl.includes("/auth/login/2fa");
        const isRefreshRequest = requestUrl.includes("/auth/refresh");

        if (status === 403) {
            const backendMessage =
                (error.response?.data as { message?: string } | undefined)?.message ?? "";

            const message = backendMessage.toLowerCase();
            const isDisabledAccount =
                message.includes("disabled") ||
                message.includes("désactiv") ||
                message.includes("desactiv");

            if (isDisabledAccount || isLoginRequest || isTwoFALoginRequest) {
                clearAuth();

                if (window.location.pathname !== "/") {
                    navigateFromAnywhere("/");
                }
            }

            return Promise.reject(error);
        }

        if (
            status === 401 &&
            !originalRequest._retry &&
            !isLoginRequest &&
            !isRefreshRequest
        ) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                setAuthorizationHeader(originalRequest, newToken);

                return api(originalRequest);
            } catch (refreshError) {
                const axiosErr = refreshError as AxiosError<{ message?: string }>;
                const backendMessage = axiosErr.response?.data?.message ?? "";

                if (backendMessage === "PASSWORD_CHANGE_REQUIRED") {
                    const email = readStoredAdminEmail();

                    localStorage.setItem("pendingPasswordReset", "true");
                    sessionStorage.setItem("pendingPasswordReset", "true");

                    if (email) {
                        localStorage.setItem("pendingPasswordResetEmail", email);
                        sessionStorage.setItem("pendingPasswordResetEmail", email);
                    }

                    clearAuth();

                    navigateFromAnywhere(
                        `/change-password-required${
                            email ? `?email=${encodeURIComponent(email)}` : ""
                        }`
                    );

                    return Promise.reject(refreshError);
                }

                clearAuth();

                if (window.location.pathname !== "/") {
                    navigateFromAnywhere("/");
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;