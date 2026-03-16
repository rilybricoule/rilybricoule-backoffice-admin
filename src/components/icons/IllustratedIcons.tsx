type IconProps = { size?: number };

/** Dashboard: blue app tiles */
export function DashboardIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#0b1220" stroke="#1e3a8a" strokeWidth="1" />
            <rect x="6.2" y="6.2" width="4.8" height="4.8" rx="0.8" fill="#2563eb" />
            <rect x="13" y="6.2" width="4.8" height="4.8" rx="0.8" fill="#60a5fa" />
            <rect x="6.2" y="13" width="4.8" height="4.8" rx="0.8" fill="#60a5fa" />
            <rect x="13" y="13" width="4.8" height="4.8" rx="0.8" fill="#2563eb" />
        </svg>
    );
}

/** Users: multi-color people icon */
export function UsersIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="8.8" cy="8.4" r="2.4" fill="#3b82f6" />
            <circle cx="15.4" cy="8.9" r="2.1" fill="#22c55e" />
            <path d="M4.6 17.1c.5-2.5 2.4-4.2 4.9-4.2h.2c2.4 0 4.4 1.7 4.9 4.2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <path d="M13.3 16.8c.4-1.9 1.9-3.1 3.7-3.1" stroke="#22c55e" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="5.6" cy="16.3" r="1.1" fill="#f59e0b" />
        </svg>
    );
}

/** Services: crossed tools in orange */
export function ServicesIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M6 18l6-6" stroke="#f97316" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M11.5 6.5l6 6" stroke="#fb923c" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="5.2" cy="18.8" r="1.6" fill="#ea580c" />
            <circle cx="18.8" cy="12.5" r="1.6" fill="#f59e0b" />
        </svg>
    );
}

/** Category: stacked blocks */
export function CategoryIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="6" height="6" rx="1.2" fill="#f97316" />
            <rect x="14" y="5" width="6" height="6" rx="1.2" fill="#fb923c" />
            <rect x="9" y="13" width="6" height="6" rx="1.2" fill="#f59e0b" />
        </svg>
    );
}

/** Offers: crossed tickets */
export function OffersIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M6 6h8v3a1.8 1.8 0 000 3v3H6v-3a1.8 1.8 0 000-3V6z" fill="#eab308" />
            <path d="M10 10h8v3a1.8 1.8 0 000 3v3h-8v-3a1.8 1.8 0 000-3v-3z" fill="#f59e0b" opacity="0.9" />
        </svg>
    );
}

/** Calendar: red header banner, white body with date */
export function CalendarIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="16" height="18" rx="2" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
            <rect x="4" y="3" width="16" height="7" rx="1.5" fill="#dc2626" />
            <text x="12" y="8.2" textAnchor="middle" fill="#fff" fontSize="4.5" fontWeight="700">JUL</text>
            <text x="12" y="16" textAnchor="middle" fill="#1e293b" fontSize="7" fontWeight="800">17</text>
        </svg>
    );
}

/** Credit card: orange card with chip area */
export function CreditCardIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />
            <rect x="5" y="11" width="10" height="4" rx="0.8" fill="rgba(255,255,255,0.5)" />
        </svg>
    );
}

/** Ticket: red ticket with notch */
export function TicketIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M4 4h16v4c-1.1 0-2 .9-2 2s.9 2 2 2v4H4v-4c1.1 0 2-.9 2-2s-.9-2-2-2V4z"
                fill="#dc2626"
            />
            <circle cx="12" cy="11" r="2" fill="#fecaca" />
        </svg>
    );
}

/** Document: white paper, folded corner */
export function DocumentIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M5 2h11l5 5v14H5V2z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M16 2v5h5" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="8" y1="10" x2="16" y2="10" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="13" x2="16" y2="13" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="16" x2="12" y2="16" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    );
}

/** Headphones: dark grey with light blue music notes */
export function HeadphonesIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M5 12v5a2 2 0 002 2h2a2 2 0 002-2v-5a7 7 0 1114 0v5a2 2 0 01-2 2h-2a2 2 0 01-2-2v-5"
                stroke="#64748b"
                strokeWidth="2"
                fill="none"
            />
            <path d="M10 8v6M12 6v8M14 8v6" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="10" cy="7" r="0.8" fill="#06b6d4" />
            <circle cx="14" cy="7" r="0.8" fill="#06b6d4" />
        </svg>
    );
}

/** Gear: dark grey cogwheel */
export function GearIllustratedIcon({ size = 22 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 15a3 3 0 100-6 3 3 0 000 6zm4.24-5.24a5 5 0 010 7.07 5 5 0 01-7.07 0 5 5 0 010-7.07m-8.48 0a5 5 0 000 7.07 5 5 0 007.07 0 5 5 0 000-7.07M3 12h2m14 0h2M12 3v2m0 14v2"
                stroke="#64748b"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
}
