import api from "./api.ts";

export type AdminAccount = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    photoUrl: string | null;
    enabled: boolean;
    twoFAEnabled: boolean;
    roleName: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
};

export type CreateAdminPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    roleName: string;
};

export type UpdateAdminPayload = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    roleName?: string;
    enabled?: boolean;
};

export async function fetchAdmins(): Promise<AdminAccount[]> {
    const { data } = await api.get<AdminAccount[]>("/admin/accounts");
    return data;
}

export async function fetchAdminById(id: number): Promise<AdminAccount> {
    const { data } = await api.get<AdminAccount>(`/admin/accounts/${id}`);
    return data;
}

export async function createAdmin(payload: CreateAdminPayload): Promise<AdminAccount> {
    const { data } = await api.post<AdminAccount>("/admin/accounts", payload);
    return data;
}

export async function updateAdmin(id: number, payload: UpdateAdminPayload): Promise<AdminAccount> {
    const { data } = await api.put<AdminAccount>(`/admin/accounts/${id}`, payload);
    return data;
}

export async function deleteAdmin(id: number): Promise<void> {
    await api.delete(`/admin/accounts/${id}`);
}

export async function toggleAdminStatus(
    id: number,
    enabled: boolean
): Promise<AdminAccount> {
    const { data } = await api.patch<AdminAccount>(`/admin/accounts/${id}/status`, {
        enabled,
    });

    return data;
}
export async function sendAdminPasswordResetEmail(id: string | number): Promise<void> {
    await api.post(`/admin/accounts/${id}/password-reset-email`);
}

export async function forceAdminLogout(id: string | number): Promise<void> {
    await api.post(`/admin/accounts/${id}/force-logout`);
}

export async function toggleAdmin2FA(id: string | number): Promise<AdminAccount> {
    const { data } = await api.patch<AdminAccount>(`/admin/accounts/${id}/toggle-2fa`);
    return data;
}

