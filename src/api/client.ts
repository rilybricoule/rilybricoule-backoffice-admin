import api from "./api";

export type ClientApi = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
    reservationsCount?: number;
    cancelledReservationsCount?: number;
    lastActivityAt?: string;
};

export type ClientPayload = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    active?: boolean;
};

export type AvisApi = {
    id: number;
    rating: number;
    comment?: string;
    createdDate?: string;
    reservationId: number;
    prestaireId?: number;
    prestaireName?: string;
};

export type ReservationApi = {
    id: number;
    reservationDate?: string;
    reservationTime?: string;
    date?: string;
    description?: string;
    totalPrice?: number;
    amount?: number;
    status: string;
    prestataire?: {
        id?: number;
        name?: string;
        firstName?: string;
        lastName?: string;
        description?: string;
    };
    avis?: AvisApi | null;
};

export async function getClients(): Promise<ClientApi[]> {
    const { data } = await api.get<ClientApi[]>("/admin/clients");
    return data;
}

export async function getClient(clientId: number): Promise<ClientApi> {
    const { data } = await api.get<ClientApi>(`/admin/clients/${clientId}`);
    return data;
}

export async function createClient(payload: ClientPayload): Promise<ClientApi> {
    const { data } = await api.post<ClientApi>("/clients", payload);
    return data;
}

export async function updateClient(clientId: number, payload: ClientPayload): Promise<ClientApi> {
    const { data } = await api.put<ClientApi>(`/clients/${clientId}`, payload);
    return data;
}

export async function activateClient(clientId: number): Promise<ClientApi> {
    const { data } = await api.patch<ClientApi>(`/admin/clients/${clientId}/activate`);
    return data;
}

export async function deactivateClient(clientId: number): Promise<ClientApi> {
    const { data } = await api.patch<ClientApi>(`/admin/clients/${clientId}/deactivate`);
    return data;
}

export async function deleteClient(clientId: number): Promise<void> {
    await api.delete(`/clients/${clientId}`);
}

export async function getClientReservations(clientId: number): Promise<ReservationApi[]> {
    const { data } = await api.get<ReservationApi[]>(`/reservations/client/${clientId}`);
    return data;
}
