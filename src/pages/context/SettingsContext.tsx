import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { defaultSettings } from "../../Data/SettingsMockData";
import type { AppSettings } from "../../Data/AppSettings";

export type { AppSettings };

const STORAGE_KEY = "adminapp_settings";

function load(): AppSettings {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) return { ...defaultSettings, ...JSON.parse(s) };
    } catch (_) {}
    return defaultSettings;
}

function save(data: AppSettings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
}

type ContextType = {
    settings:       AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
    resetSettings:  () => void;
};

const SettingsContext = createContext<ContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(load);

    const updateSettings = useCallback((updates: Partial<AppSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...updates };
            save(next);
            return next;
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
        save(defaultSettings);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}