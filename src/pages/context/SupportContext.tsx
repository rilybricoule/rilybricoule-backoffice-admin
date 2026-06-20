import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Ticket, TicketCategory, TicketMessage, TicketStatus } from "../../Data/Ticket";
import {
    getAdminTickets,
    replyAdminTicket,
    resolveAdminTicket,
    updateAdminTicketCategory,
    updateAdminTicketLitige,
    updateAdminTicketNote,
    updateAdminTicketStatus,
} from "../../api/support";

export type { Ticket, TicketStatus, TicketCategory, TicketMessage };

type ContextType = {
    tickets: Ticket[];
    loading: boolean;
    error: string;
    reloadTickets: () => Promise<void>;
    replyTicket: (id: string, message: string) => Promise<void>;
    updateStatus: (id: string, status: TicketStatus) => Promise<void>;
    updateCategory: (id: string, category: TicketCategory) => Promise<void>;
    toggleLitige: (id: string) => Promise<void>;
    setAdminNote: (id: string, note: string) => Promise<void>;
    resolveTicket: (id: string, action: string, note: string, newPrestataireId?: string) => Promise<void>;
};

const SupportContext = createContext<ContextType | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const replaceTicket = useCallback((saved: Ticket) => {
        setTickets((prev) => prev.map((ticket) => (ticket.id === saved.id ? saved : ticket)));
    }, []);



    const reloadTickets = useCallback(async () => {
        const hasToken =
            Boolean(localStorage.getItem("accessToken")) ||
            Boolean(sessionStorage.getItem("accessToken"));

        if (!hasToken) {
            setTickets([]);
            setError("");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await getAdminTickets();
            setTickets(response);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur chargement tickets");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const hasToken =
            Boolean(localStorage.getItem("accessToken")) ||
            Boolean(sessionStorage.getItem("accessToken"));

        if (hasToken) {
            void reloadTickets();
        } else {
            setLoading(false);
        }
    }, [reloadTickets]);

    const replyTicket = useCallback(
        async (id: string, message: string) => {
            try {
                const saved = await replyAdminTicket(id, message);
                setError("");
                replaceTicket(saved);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur envoi reponse ticket");
                throw err;
            }
        },
        [replaceTicket]
    );

    const updateStatus = useCallback(
        async (id: string, status: TicketStatus) => {
            try {
                const saved = await updateAdminTicketStatus(id, status);
                setError("");
                replaceTicket(saved);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur mise a jour statut ticket");
                throw err;
            }
        },
        [replaceTicket]
    );

    const updateCategory = useCallback(
        async (id: string, category: TicketCategory) => {
            try {
                const saved = await updateAdminTicketCategory(id, category);
                setError("");
                replaceTicket(saved);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur mise a jour categorie ticket");
                throw err;
            }
        },
        [replaceTicket]
    );

    const toggleLitige = useCallback(
        async (id: string) => {
            const ticket = tickets.find((item) => item.id === id);
            if (!ticket) return;

            try {
                const saved = await updateAdminTicketLitige(id, !ticket.isLitige);
                setError("");
                replaceTicket(saved);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur mise a jour litige ticket");
                throw err;
            }
        },
        [replaceTicket, tickets]
    );

    const setAdminNote = useCallback(
        async (id: string, note: string) => {
            try {
                const saved = await updateAdminTicketNote(id, note);
                setError("");
                replaceTicket(saved);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur sauvegarde note ticket");
                throw err;
            }
        },
        [replaceTicket]
    );

    const resolveTicket = useCallback(
        async (id: string, action: string, note: string, newPrestataireId?: string) => {
            try {
                const saved = await resolveAdminTicket(id, action, note, newPrestataireId);
                setError("");
                replaceTicket(saved);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur resolution ticket");
                throw err;
            }
        },
        [replaceTicket]
    );


    return (
        <SupportContext.Provider
            value={{
                tickets,
                loading,
                error,
                reloadTickets,
                replyTicket,
                updateStatus,
                updateCategory,
                toggleLitige,
                setAdminNote,
                resolveTicket,
            }}
        >
            {children}
        </SupportContext.Provider>
    );
}

export function useSupport() {
    const ctx = useContext(SupportContext);
    if (!ctx) throw new Error("useSupport must be used within SupportProvider");
    return ctx;
}
