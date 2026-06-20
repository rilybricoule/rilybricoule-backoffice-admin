import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type {
    AdminPayment,
    PaymentStatus,
    PayoutStatus,
    CommissionStatus,
} from "../../Data/Payment";

import {
    getAdminPayments,
    updateAdminPaymentStatus,
    updateAdminPayoutStatus,
    updateAdminCommissionStatus,
} from "../../api/payments";

export type {
    AdminPayment,
    PaymentStatus,
    PayoutStatus,
    CommissionStatus,
};

type ContextType = {
    payments: AdminPayment[];
    transactions: AdminPayment[];

    loadingPayments: boolean;
    paymentsError: string;
    refreshPayments: (reservationId?: string) => Promise<void>;

    updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
    updatePayoutStatus: (id: string, status: PayoutStatus) => Promise<void>;
    updateCommissionStatus: (id: string, status: CommissionStatus) => Promise<void>;

    updateTransaction: (id: string, updates: Partial<AdminPayment>) => Promise<void>;
    markAsVerse: (id: string) => Promise<void>;
};

const TransactionsContext = createContext<ContextType | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
    const [payments, setPayments] = useState<AdminPayment[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [paymentsError, setPaymentsError] = useState("");

    const replacePayment = useCallback((saved: AdminPayment) => {
        setPayments((prev) =>
            prev.map((payment) => payment.id === saved.id ? saved : payment)
        );
    }, []);

    const refreshPayments = useCallback(async (reservationId?: string) => {
        try {
            setLoadingPayments(true);
            setPaymentsError("");

            const data = await getAdminPayments(reservationId);
            setPayments(data);
        } catch (error) {
            console.error("Failed to load payments", error);
            setPayments([]);
            setPaymentsError("Erreur chargement paiements");
        } finally {
            setLoadingPayments(false);
        }
    }, []);

    useEffect(() => {
        void refreshPayments();
    }, [refreshPayments]);

    const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus) => {
        const saved = await updateAdminPaymentStatus(id, status);
        replacePayment(saved);
    }, [replacePayment]);

    const updatePayoutStatus = useCallback(async (id: string, status: PayoutStatus) => {
        const saved = await updateAdminPayoutStatus(id, status);
        replacePayment(saved);
    }, [replacePayment]);

    const updateCommissionStatus = useCallback(async (id: string, status: CommissionStatus) => {
        const saved = await updateAdminCommissionStatus(id, status);
        replacePayment(saved);
    }, [replacePayment]);

    const updateTransaction = useCallback(async (id: string, updates: Partial<AdminPayment>) => {
        if (updates.paymentStatus) {
            await updatePaymentStatus(id, updates.paymentStatus);
            return;
        }

        if (updates.payoutStatus) {
            await updatePayoutStatus(id, updates.payoutStatus);
            return;
        }

        if (updates.commissionStatus) {
            await updateCommissionStatus(id, updates.commissionStatus);
        }
    }, [updatePaymentStatus, updatePayoutStatus, updateCommissionStatus]);

    const markAsVerse = useCallback(async (id: string) => {
        await updatePayoutStatus(id, "verse");
    }, [updatePayoutStatus]);

    return (
        <TransactionsContext.Provider value={{
            payments,
            transactions: payments,

            loadingPayments,
            paymentsError,
            refreshPayments,

            updatePaymentStatus,
            updatePayoutStatus,
            updateCommissionStatus,

            updateTransaction,
            markAsVerse,
        }}>
            {children}
        </TransactionsContext.Provider>
    );
}

export function useTransactions() {
    const ctx = useContext(TransactionsContext);
    if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
    return ctx;
}