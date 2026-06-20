// ── Shared enums ──────────────────────────────────────────────────────────────

export type NotificationTarget  = "all_clients" | "all_providers" | "category_providers" | "specific_user";
export type NotificationChannel = "push" | "email" | "sms";
export type NotificationStatus  = "sent" | "draft" | "failed" | "scheduled" | "cancelled";
export type NotificationPurpose =
    | "promotion"
    | "maintenance"
    | "feature"
    | "cgu"
    | "support";

export type NotificationType =
    | "booking"
    | "payment"
    | "chat"
    | "review"
    | "dispute"
    | "account"
    | "promo"
    | "system";

// ── Sent (admin-broadcast) ────────────────────────────────────────────────────

export interface SentNotification {
    id:              string;
    title:           string;
    message:         string;
    target:          NotificationTarget;
    category?:       string;
    titleAr?:    string;   // ← new
    messageAr?:  string;
    purpose?:        NotificationPurpose;
    cityFilter?:     string;
    userId?:         string;
    userName?:       string;
    channel:         NotificationChannel;
    status:          NotificationStatus;
    recipientCount?: number;
    scheduledAt?:    string;
    sentAt?:         string;
    createdAt:       string;
}

// ── Received (admin inbox — events that require admin attention) ───────────────

export interface ReceivedNotification {
    id:               string;
    title:            string;
    message:          string;
    type:             NotificationType;
    channel:          NotificationChannel;
    triggeredBy:      string;
    triggeredByRole:  "client" | "provider" | "system" | "admin";
    triggeredById:    string;
    read:             boolean;
    sentAt:           string;
}

// ── Legacy alias ──────────────────────────────────────────────────────────────

export type Notification = SentNotification;
