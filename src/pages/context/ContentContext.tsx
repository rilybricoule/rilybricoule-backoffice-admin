import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { contentMock } from "../../Data/ContentMockData";
import type { ContentPage, ContentPageKey } from "../../Data/ContentData";

export type { ContentPage, ContentPageKey };

const STORAGE_KEY = "adminapp_content";

function load(): ContentPage[] {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
    } catch (_) {}
    return contentMock;
}

function save(data: ContentPage[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

type ContextType = {
    pages:       ContentPage[];
    updatePage:  (key: ContentPageKey, content: string) => void;
};

const ContentContext = createContext<ContextType | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [pages, setPages] = useState<ContentPage[]>(load);

    const updatePage = useCallback((key: ContentPageKey, content: string) => {
        setPages(prev => {
            const next = prev.map(p => p.key === key
                ? { ...p, content, updatedAt: new Date().toISOString().split("T")[0] }
                : p
            );
            save(next);
            return next;
        });
    }, []);

    return (
        <ContentContext.Provider value={{ pages, updatePage }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const ctx = useContext(ContentContext);
    if (!ctx) throw new Error("useContent must be used within ContentProvider");
    return ctx;
}