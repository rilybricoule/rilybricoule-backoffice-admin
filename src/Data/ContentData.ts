export type ContentPageKey = "about" | "faq" | "cgu";

export interface ContentPage {
    key:       ContentPageKey;
    title:     string;
    content:   string;
    updatedAt: string;
}