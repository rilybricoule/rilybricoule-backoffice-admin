import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type {
    SentNotification,
    ReceivedNotification,
    NotificationStatus,
    NotificationChannel,
    NotificationType,
} from "../../Data/Notification";
import type { BackendNotificationDto } from "../../api/notifications";


import {
    getUserNotifications,
    markNotificationRead,
} from "../../api/notifications";
import {getCurrentAdminUser} from "../../api/auth.ts";
import {subscribeTopic} from "../../api/realtime.ts";

const SENT_KEY = "adminapp_notifications_sent";

function loadSent(): SentNotification[] {
    try {
        const raw = localStorage.getItem(SENT_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveSent(data: SentNotification[]) {
    try {
        localStorage.setItem(SENT_KEY, JSON.stringify(data));
    } catch {
        // ignore storage errors
    }
}

type ContextType = {
    sent: SentNotification[];
    sendNotification: (n: Omit<SentNotification, "id" | "createdAt" | "sentAt" | "status">) => void;
    scheduleNotification: (n: Omit<SentNotification, "id" | "createdAt" | "sentAt" | "status">, scheduledAt: string) => void;
    deleteSent: (id: string) => void;
    received: ReceivedNotification[];
    markAllRead: () => void;
    markOneRead: (id: string) => void;
    unreadCount: number;
    notifications: SentNotification[];
    deleteNotification: (id: string) => void;
};

const NotificationsContext = createContext<ContextType | null>(null);

function mapType(type: string): NotificationType {
    switch (type) {
        case "booking":
        case "RESERVATION":
            return "booking";
        case "payment":
        case "PAIEMENT":
            return "payment";
        case "chat":
        case "MESSAGE":
            return "chat";
        case "review":
        case "AVIS":
            return "review";
        case "dispute":
        case "DISPUTE":
            return "dispute";
        case "account":
        case "ACCOUNT":
            return "account";
        case "promo":
        case "MARKETING":
            return "promo";
        default:
            return "system";
    }
}

function mapChannel(channel?: string): NotificationChannel {
    if (channel === "email") return "email";
    if (channel === "sms") return "sms";
    return "push";
}

function mapReceived(item: BackendNotificationDto): ReceivedNotification {
    const raw = item as any;

    const role = String(raw.triggeredByRole || "").toLowerCase();

    const triggeredByRole =
        role === "client" ||
        role === "provider" ||
        role === "admin"
            ? role
            : "system";

    return {
        id: String(raw.id),
        title: raw.title || "Notification",
        message: raw.message || raw.contenu || "",
        type: mapType(raw.type),
        channel: mapChannel(raw.channel),
        triggeredBy: raw.triggeredBy || "Système",
        triggeredByRole,
        triggeredById: raw.triggeredById == null ? "0" : String(raw.triggeredById),
        read: Boolean(raw.read ?? raw.vu),
        sentAt: raw.sentAt || raw.date || new Date().toISOString(),
    };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [sent, setSent] = useState<SentNotification[]>(loadSent);
    const [received, setReceived] = useState<ReceivedNotification[]>([]);

    const loadReceived = useCallback(async () => {
        try {
            const currentAdmin = getCurrentAdminUser();

            if (!currentAdmin?.id) {
                setReceived([]);
                return;
            }

            const data = await getUserNotifications(currentAdmin.id);
            setReceived(data.map(mapReceived));
        } catch (error) {
            console.error("Failed to load admin notifications", error);
            setReceived([]);
        }
    }, []);

    useEffect(() => {
        void loadReceived();

        window.addEventListener("admin-auth-changed", loadReceived);
        window.addEventListener("focus", loadReceived);

        return () => {
            window.removeEventListener("admin-auth-changed", loadReceived);
            window.removeEventListener("focus", loadReceived);
        };
    }, [loadReceived]);


    useEffect(() => {
        const currentAdmin = getCurrentAdminUser();

        if (!currentAdmin?.id) return;

        return subscribeTopic<BackendNotificationDto>(
            `/topic/notifications/${currentAdmin.id}`,
            (notification) => {
                setReceived((prev) => {
                    const mapped = mapReceived(notification);

                    if (prev.some((item) => item.id === mapped.id)) {
                        return prev;
                    }

                    return [mapped, ...prev];
                });
            }
        );
    }, []);


    const sendNotification = useCallback(
        (n: Omit<SentNotification, "id" | "createdAt" | "sentAt" | "status">) => {
            const now = new Date().toISOString().split("T")[0];
            setSent((prev) => {
                const next: SentNotification[] = [
                    ...prev,
                    {
                        ...n,
                        id: `s_${Date.now()}`,
                        status: "sent" as NotificationStatus,
                        sentAt: now,
                        createdAt: now,
                    },
                ];
                saveSent(next);
                return next;
            });
        },
        []
    );

    const scheduleNotification = useCallback(
        (n: Omit<SentNotification, "id" | "createdAt" | "sentAt" | "status">, scheduledAt: string) => {
            const now = new Date().toISOString().split("T")[0];
            setSent((prev) => {
                const next: SentNotification[] = [
                    ...prev,
                    {
                        ...n,
                        id: `s_${Date.now()}`,
                        status: "scheduled" as NotificationStatus,
                        scheduledAt,
                        sentAt: undefined,
                        createdAt: now,
                    },
                ];
                saveSent(next);
                return next;
            });
        },
        []
    );

    const deleteSent = useCallback((id: string) => {
        setSent((prev) => {
            const next = prev.filter((n) => n.id !== id);
            saveSent(next);
            return next;
        });
    }, []);

    const markAllRead = useCallback(() => {
        const unread = received.filter((item) => !item.read);

        setReceived((prev) =>
            prev.map((item) => ({ ...item, read: true }))
        );

        void Promise.all(
            unread.map((item) => markNotificationRead(Number(item.id)))
        ).catch((error) => {
            console.error("Failed to mark all notifications as read", error);
        });
    }, [received]);


    const markOneRead = useCallback((id: string) => {
        setReceived((prev) =>
            prev.map((item) => item.id === id ? { ...item, read: true } : item)
        );

        markNotificationRead(Number(id)).catch((error) => {
            console.error("Failed to mark notification as read", error);
        });
    }, []);



    const unreadCount = useMemo(
        () => received.filter((item) => !item.read).length,
        [received]
    );

    const value: ContextType = {
        sent,
        sendNotification,
        scheduleNotification,
        deleteSent,
        received,
        markAllRead,
        markOneRead,
        unreadCount,
        notifications: sent,
        deleteNotification: deleteSent,
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
    return ctx;
}
