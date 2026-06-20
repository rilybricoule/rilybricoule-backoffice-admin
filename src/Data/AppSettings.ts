export type Currency = "MAD" | "EUR" | "USD";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type Timezone = "Africa/Casablanca" | "Europe/Paris" | "Europe/London" | "America/New_York";
export type Language = "fr" | "ar";

export interface AppSettings {
    currency:    Currency;
    dateFormat:  DateFormat;
    timezone:    Timezone;
    language:    Language;
    platformName: string;
    supportEmail: string;
    commissionRate: number;
}