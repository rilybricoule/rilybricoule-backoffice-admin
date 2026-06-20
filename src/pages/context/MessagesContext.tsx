import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {
    getChatMessages,
    sendChatMessage,
    getUserChats,
    markChatRead,
    type BackendChatDto,
    type BackendMessageDto,
} from "../../api/chats";
import { getCurrentAdminUser } from "../../api/auth";
import {subscribeTopic} from "../../api/realtime.ts";
import type {BackendNotificationDto} from "../../api/notifications.ts";

export interface Message {
    id: string;
    senderName: string;
    senderAvatar: string;
    preview: string;
    time: string;
    unread: boolean;
    providerId?: string;
    receiverId?: string;
}

export interface ChatMessage {
    id?: number;
    from: "admin" | "provider";
    text: string;
    time: string;
    read?: boolean;
    readAt?: string | null;
    failed?: boolean;
}


export interface OpenChat {
    id: string;
    providerName: string;
    avatar: string;
    providerId: string;
    minimized: boolean;
    messages: ChatMessage[];
    readonly?: boolean;
    receiverId?: string;
    sending?: boolean;
}

interface MessagesContextType {
    messages: Message[];
    addMessage: (msg: Message) => void;
    markAllRead: () => void;
    markRead: (id: string) => void;
    openDropdown: boolean;
    setOpenDropdown: (v: boolean) => void;
    openChats: OpenChat[];
    openChat: (chat: Omit<OpenChat, "minimized" | "messages">) => void;
    closeChat: (id: string) => void;
    toggleMinimize: (id: string) => void;
    sendMessage: (chatId: string, text: string) => Promise<void>;
    refreshMessages: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | null>(null);

function formatTime(value?: string) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function mapChatMessages(items: BackendMessageDto[], adminId?: number): ChatMessage[] {
    return items.map((item) => ({
        id: item.id,
        from: item.senderId === adminId ? "admin" : "provider",
        text: item.content,
        time: formatTime(item.createdAt),
        read: item.read,
        readAt: item.readAt,
    }));
}


function mapNavbarMessage(item: BackendChatDto): Message {
    const displayName =
        item.displayName ||
        `${item.clientFirstName ?? ""} ${item.clientLastName ?? ""}`.trim() ||
        `${item.prestataireFirstName ?? ""} ${item.prestataireLastName ?? ""}`.trim() ||
        "Conversation";

    return {
        id: String(item.chatId),
        senderName: displayName,
        senderAvatar: item.avatarLetter || displayName.charAt(0).toUpperCase() || "C",
        preview: item.lastMessagePreview || item.messages.at(-1)?.content || "",
        time: formatTime(item.lastMessageAt || item.messages.at(-1)?.createdAt),
        unread: (item.unreadCount ?? 0) > 0,
        providerId: String(item.prestataireId),
        receiverId: String(item.prestataireId),
    };
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openChats, setOpenChats] = useState<OpenChat[]>([]);

    const refreshMessages = useCallback(async () => {
        const admin = getCurrentAdminUser();

        if (!admin?.id) {
            setMessages([]);
            return;
        }

        try {
            const chats = await getUserChats(admin.id);
            setMessages(chats.map(mapNavbarMessage));
        } catch (error) {
            console.error("Failed to load chats", error);
            setMessages([]);
        }
    }, []);

    useEffect(() => {
        void refreshMessages();

        window.addEventListener("admin-auth-changed", refreshMessages);
        window.addEventListener("focus", refreshMessages);

        return () => {
            window.removeEventListener("admin-auth-changed", refreshMessages);
            window.removeEventListener("focus", refreshMessages);
        };
    }, [refreshMessages]);


    useEffect(() => {
        const admin = getCurrentAdminUser();
        const userId = admin?.id;

        if (!userId || openChats.length === 0) return;

        const unsubscribers = openChats.map((chat) =>
            subscribeTopic<BackendMessageDto>(
                `/topic/chat/${chat.id}`,
                (message) => {
                    if (message.senderId === userId) return;

                    setOpenChats((prev) =>
                        prev.map((item) => {
                            if (item.id !== chat.id) return item;

                            if (item.messages.some((m) => m.id === message.id)) {
                                return item;
                            }

                            return {
                                ...item,
                                messages: [
                                    ...item.messages,
                                    {
                                        id: message.id,
                                        from: "provider",
                                        text: message.content,
                                        time: formatTime(message.createdAt),
                                        read: message.read,
                                        readAt: message.readAt ?? null,
                                    },
                                ],
                            };
                        })
                    );

                    void refreshMessages();
                }
            )
        );

        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    }, [openChats.map((chat) => chat.id).join(",")]);


    useEffect(() => {
        const admin = getCurrentAdminUser();
        const userId = admin?.id;

        if (!userId) return;

        return subscribeTopic<BackendNotificationDto>(
            `/topic/notifications/${userId}`,
            (notification) => {
                if (notification.type === "MESSAGE") {
                    void refreshMessages();
                }
            }
        );
    }, []);

    const addMessage = (msg: Message) => {
        setMessages((prev) => {
            const exists = prev.find((item) => item.id === msg.id);
            if (exists) {
                return prev.map((item) =>
                    item.id === msg.id
                        ? { ...item, unread: true, preview: msg.preview, time: msg.time, senderName: msg.senderName, senderAvatar: msg.senderAvatar }
                        : item
                );
            }

            return [msg, ...prev];
        });
    };

    const markAllRead = () =>
        setMessages((prev) => prev.map((item) => ({ ...item, unread: false })));

    const markRead = (id: string) =>
        setMessages((prev) => prev.map((item) => item.id === id ? { ...item, unread: false } : item));

    const openChat = (chat: Omit<OpenChat, "minimized" | "messages">) => {
        setOpenChats((prev) => {
            const exists = prev.find((item) => item.id === chat.id);
            if (exists) {
                return prev.map((item) => item.id === chat.id ? { ...item, minimized: false } : item);
            }

            const trimmed = prev.length >= 3 ? prev.slice(1) : prev;
            return [
                ...trimmed,
                {
                    ...chat,
                    minimized: false,
                    messages: [],
                    readonly: false,
                    sending: false,
                },
            ];
        });

        markRead(chat.id);

        const admin = getCurrentAdminUser();
        const userId = admin?.id;
        const numericId = Number(chat.id);

        if (!userId || Number.isNaN(numericId)) return;

        void (async () => {
            try {
                const items = await getChatMessages(numericId);

                setOpenChats((prev) =>
                    prev.map((item) =>
                        item.id === chat.id
                            ? { ...item, readonly: false, messages: mapChatMessages(items, userId) }
                            : item
                    )
                );

                await markChatRead(numericId, userId);
                markRead(chat.id);
            } catch (error) {
                console.error("Failed to load chat messages", error);
            }
        })();
    };

    const closeChat = (id: string) =>
        setOpenChats((prev) => prev.filter((item) => item.id !== id));

    const toggleMinimize = (id: string) =>
        setOpenChats((prev) => prev.map((item) => item.id === id ? { ...item, minimized: !item.minimized } : item));

    const sendMessage = async (chatId: string, text: string) => {
        const admin = getCurrentAdminUser();
        const senderId = admin?.id;
        const numericChatId = Number(chatId);

        if (!senderId || Number.isNaN(numericChatId)) return;

        const openedChat = openChats.find((item) => item.id === chatId);
        if (!openedChat || openedChat.readonly || openedChat.sending) return;

        const optimisticId = Date.now();
        const optimisticTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        const optimisticMessage: ChatMessage = {
            id: optimisticId,
            from: "admin",
            text,
            time: optimisticTime,
        };

        setOpenChats((prev) =>
            prev.map((item) =>
                item.id === chatId
                    ? { ...item, sending: true, messages: [...item.messages, optimisticMessage] }
                    : item
            )
        );

        setMessages((prev) =>
            prev.map((item) =>
                item.id === chatId
                    ? { ...item, preview: `Vous : ${text}`, time: "A l'instant", unread: false }
                    : item
            )
        );

        try {
            const saved = await sendChatMessage({
                chatId: numericChatId,
                senderId,
                receiverId: openedChat.receiverId ? Number(openedChat.receiverId) : undefined,
                content: text,
                messageType: "TEXT",
            });

            setOpenChats((prev) =>
                prev.map((item) =>
                    item.id === chatId
                        ? {
                            ...item,
                            sending: false,
                            messages: item.messages.map((message) =>
                                message.id === optimisticId
                                    ? {
                                        id: saved.id,
                                        from: "admin",
                                        text: saved.content,
                                        time: formatTime(saved.createdAt),
                                    }
                                    : message
                            ),
                        }
                        : item
                )
            );

            await refreshMessages();
        } catch (error) {
            console.error("Failed to send chat message", error);

            setOpenChats((prev) =>
                prev.map((item) =>
                    item.id === chatId
                        ? {
                            ...item,
                            sending: false,
                            messages: item.messages.map((message) =>
                                message.id === optimisticId
                                    ? { ...message, failed: true }
                                    : message
                            ),
                        }
                        : item
                )
            );

            await refreshMessages();
        }
    };

    return (
        <MessagesContext.Provider value={{
            messages,
            addMessage,
            markAllRead,
            markRead,
            openDropdown,
            setOpenDropdown,
            openChats,
            openChat,
            closeChat,
            toggleMinimize,
            sendMessage,
            refreshMessages,
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    const ctx = useContext(MessagesContext);
    if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
    return ctx;
}
