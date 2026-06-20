import { useEffect, useMemo, useState } from "react";
import PaymentsIcon from "@mui/icons-material/Payments";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import { getDashboardPaymentStatus, type DashboardPaymentStatus } from "../../api/dashboard";

export default function PaymentStatusCard() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardPaymentStatus | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const res = await getDashboardPaymentStatus();
                if (mounted) setData(res);
            } catch {
                if (mounted) {
                    setData({
                        paid: 0,
                        pending: 0,
                        refunded: 0,
                        failed: 0,
                        total: 0,
                    });
                }
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const paid = data?.paid ?? 0;
    const pending = data?.pending ?? 0;
    const refunded = data?.refunded ?? 0;
    const failed = data?.failed ?? 0;
    const total = data?.total ?? 0;

    const rows = useMemo(
        () => [
            { label: "Payées", value: paid, color: "#22c55e" },
            { label: "En attente", value: pending, color: "#f59e0b" },
            { label: "Remboursées", value: refunded, color: "#ef4444" },
            { label: "Échouées", value: failed, color: "#94a3b8" },
        ],
        [paid, pending, refunded, failed]
    );

    const expandContent = (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            {rows.map((r) => {
                const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;

                return (
                    <Box key={r.label}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(180,210,245,0.7)" }}>
                                {r.label}
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: r.color }}>
                                {r.value}
                            </Typography>
                        </Box>

                        <Box sx={{ height: 4, borderRadius: 999, bgcolor: "rgba(147,181,218,0.12)" }}>
                            <Box
                                sx={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    borderRadius: 999,
                                    bgcolor: r.color,
                                }}
                            />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );

    return (
        <StatCard
            label="Statut des paiements"
            value={`${paid}`}
            subtitle={`${pending} en attente · ${total} total`}
            icon={<PaymentsIcon />}
            accentColor="green"
            expandContent={expandContent}
            onClick={() => navigate("/payments")}
        />
    );
}
