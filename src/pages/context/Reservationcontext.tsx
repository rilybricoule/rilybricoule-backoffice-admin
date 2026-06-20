import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
    getAdminReservations,
    updateAdminReservationStatus,
    cancelAdminReservation,
    updateAdminReservationNote,
} from "../../api/reservation";

import type {
    Reservation,
    ReservationStatus,
    PaymentStatus,
    PayoutStatus,
    CommissionStatus,
} from "../../Data/Reservation";

export type {
    Reservation,
    ReservationStatus,
    PaymentStatus,
    PayoutStatus,
    CommissionStatus,
};

type ReservationsContextType = {
    reservations: Reservation[];
    loadingReservations: boolean;
    reservationsError: string;
    refreshReservations: () => Promise<void>;

    updateReservation: (id: string, updates: Partial<Reservation>) => void;
    markAsRéservé: (id: string) => Promise<void>;
    markAsCompleted: (id: string) => Promise<void>;
    markAsAnnulee: (id: string, reason?: string) => Promise<void>;
    updateReservationNote: (id: string, note: string) => Promise<void>;

    markAsVerse: (id: string) => void;
    unmarkAsVerse: (id: string) => void;
    markCommissionRecue: (id: string) => void;
    unmarkCommissionRecue: (id: string) => void;
    forcePaymentStatus: (id: string, status: PaymentStatus) => void;
    addAdminMessage: (id: string, message: string) => void;
    refundReservation: (id: string) => void;
};

const ReservationsContext = createContext<ReservationsContextType | null>(null);

export function ReservationsProvider({ children }: { children: ReactNode }) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(false);
    const [reservationsError, setReservationsError] = useState("");

    const now = () => new Date().toISOString().split("T")[0];

    const refreshReservations = useCallback(async () => {
        try {
            setLoadingReservations(true);
            setReservationsError("");

            const data = await getAdminReservations();
            setReservations(data);
        } catch (error) {
            console.error("Failed to load reservations", error);
            setReservations([]);
            setReservationsError("Erreur chargement réservations");
        } finally {
            setLoadingReservations(false);
        }
    }, []);

    useEffect(() => {
        void refreshReservations();
    }, [refreshReservations]);

    const updateReservation = useCallback((id: string, updates: Partial<Reservation>) => {
        setReservations((prev) =>
            prev.map((reservation) =>
                reservation.id === id
                    ? { ...reservation, ...updates, updatedAt: now() }
                    : reservation
            )
        );
    }, []);

    const markAsRéservé = useCallback(async (id: string) => {
        const saved = await updateAdminReservationStatus(id, "CONFIRMED");
        setReservations((prev) =>
            prev.map((reservation) => reservation.id === id ? saved : reservation)
        );
    }, []);

    const markAsCompleted = useCallback(async (id: string) => {
        const saved = await updateAdminReservationStatus(id, "COMPLETED");
        setReservations((prev) =>
            prev.map((reservation) => reservation.id === id ? saved : reservation)
        );
    }, []);

    const markAsAnnulee = useCallback(async (id: string, reason?: string) => {
        const saved = await cancelAdminReservation(id, reason);
        setReservations((prev) =>
            prev.map((reservation) => reservation.id === id ? saved : reservation)
        );
    }, []);

    const updateReservationNote = useCallback(async (id: string, note: string) => {
        const saved = await updateAdminReservationNote(id, note);
        setReservations((prev) =>
            prev.map((reservation) => reservation.id === id ? saved : reservation)
        );
    }, []);

    const forcePaymentStatus = useCallback((id: string, status: PaymentStatus) => {
        updateReservation(id, { paymentStatus: status });
    }, [updateReservation]);

    const refundReservation = useCallback((id: string) => {
        updateReservation(id, { paymentStatus: "rembourse" });
    }, [updateReservation]);

    const markAsVerse = useCallback((id: string) => {
        updateReservation(id, { payoutStatus: "verse" });
    }, [updateReservation]);

    const unmarkAsVerse = useCallback((id: string) => {
        updateReservation(id, { payoutStatus: "en_attente" });
    }, [updateReservation]);

    const markCommissionRecue = useCallback((id: string) => {
        updateReservation(id, { commissionStatus: "recue" });
    }, [updateReservation]);

    const unmarkCommissionRecue = useCallback((id: string) => {
        updateReservation(id, { commissionStatus: "en_attente" });
    }, [updateReservation]);

    const addAdminMessage = useCallback((id: string, message: string) => {
        const date = now();

        setReservations((prev) =>
            prev.map((reservation) =>
                reservation.id === id
                    ? {
                        ...reservation,
                        messages: [
                            ...reservation.messages,
                            { from: "admin", name: "Admin", message, date },
                        ],
                        updatedAt: date,
                    }
                    : reservation
            )
        );
    }, []);

    return (
        <ReservationsContext.Provider value={{
            reservations,
            loadingReservations,
            reservationsError,
            refreshReservations,

            updateReservation,
            markAsRéservé,
            markAsCompleted,
            markAsAnnulee,
            updateReservationNote,

            markAsVerse,
            unmarkAsVerse,
            markCommissionRecue,
            unmarkCommissionRecue,
            forcePaymentStatus,
            addAdminMessage,
            refundReservation,
        }}>
            {children}
        </ReservationsContext.Provider>
    );
}

export function useReservations() {
    const ctx = useContext(ReservationsContext);
    if (!ctx) throw new Error("useReservations must be used within ReservationsProvider");
    return ctx;
}