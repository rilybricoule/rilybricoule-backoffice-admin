import api from "./api";

export interface BackendMessageDto {
    id: number;
    senderId?: number;
    receiverId?: number;
    content: string;
    senderName?: string;
    receiverName?: string;
    createdAt: string;
    messageType?: string;
    mediaUrl?: string | null;
    read?: boolean;
    readAt?: string | null;
}

export interface BackendChatDto {
    chatId: number;
    clientId?: number | null;
    prestataireId?: number | null;
    clientFirstName?: string | null;
    clientLastName?: string | null;
    prestataireFirstName?: string | null;
    prestataireLastName?: string | null;
    reservationId?: number | null;
    createdAt: string;
    active: boolean;
    lastMessageAt?: string | null;
    messages: BackendMessageDto[];
    displayName?: string;
    avatarLetter?: string;
    lastMessagePreview?: string;
    unreadCount?: number;
}





export interface OpenAdminChatPayload {
    adminId: number;
    clientId?: number;
    prestataireId?: number;
    participantId?: number;
    type?: "ADMIN_SUPPORT" | "INTERNAL";
}

export interface SendChatMessagePayload {
    chatId: number;
    senderId: number;
    receiverId?: number;
    content: string;
    messageType?: string;
}

export async function getUserChats(userId: number): Promise<BackendChatDto[]> {
    const { data } = await api.get<BackendChatDto[]>(`/chats/user/${userId}`);
    return data;
}

export async function getChatMessages(chatId: number): Promise<BackendMessageDto[]> {
    const { data } = await api.get<BackendMessageDto[]>(`/messages/${chatId}`);
    return data;
}

export async function sendChatMessage(payload: SendChatMessagePayload): Promise<BackendMessageDto> {
    const { data } = await api.post<BackendMessageDto>("/messages/send", payload);
    return data;
}

export async function markChatRead(chatId: number, receiverId: number): Promise<void> {
    await api.post(`/messages/chats/${chatId}/read`, null, {
        params: { receiverId },
    });
}

export async function openAdminChatFromTicket(ticketId: number, adminId: number): Promise<BackendChatDto> {
    const { data } = await api.post<BackendChatDto>(`/chats/admin/open-from-ticket/${ticketId}`, null, {
        params: { adminId },
    });
    return data;
}





export async function openAdminChat(payload: OpenAdminChatPayload): Promise<BackendChatDto> {
    const participantId = payload.participantId ?? payload.clientId ?? payload.prestataireId;

    if (!participantId) {
        throw new Error("Missing chat participant id");
    }

    const { data } = await api.post<BackendChatDto>("/chats/admin/open", {
        adminId: payload.adminId,
        participantId,
        type: payload.type ?? "ADMIN_SUPPORT",
    });

    return data;
}




