import { Card, Typography, Box } from "@mui/material";

type StatCardProps = {
    label: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    change?: number;
    changeLabel?: string;
};

export default function StatCard({ label, value, subtitle, icon, change, changeLabel }: StatCardProps) {
    const isPositive = change !== undefined && change > 0;

    return (
        <Card
            sx={{
                p: 2.5,
                borderRadius: 2,
                minHeight: 140,
                bgcolor: "rgba(10, 37, 77, 0.6)",
                border: "1px solid rgba(147, 181, 218, 0.2)",
                boxShadow: "0 4px 20px rgba(2, 6, 23, 0.25)",
                transition: "all 0.25s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                "&:hover": {
                    borderColor: "rgba(147, 181, 218, 0.35)",
                    boxShadow: "0 8px 28px rgba(2, 6, 23, 0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        letterSpacing: 0.15,
                        lineHeight: 1.4,
                    }}
                >
                    {label}
                </Typography>
                {icon && (
                    <Box
                        sx={{
                            color: "primary.light",
                            opacity: 0.9,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: "rgba(83, 161, 232, 0.12)",
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Box>

            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="h4"
                    sx={{
                        color: "text.primary",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        mb: 0.5,
                    }}
                >
                    {value}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            opacity: 0.9,
                            display: "block",
                            letterSpacing: 0.1,
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {change !== undefined && change !== 0 && (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 1.5,
                        pt: 1,
                        display: "block",
                        color: isPositive ? "success.main" : "error.main",
                        fontWeight: 600,
                        letterSpacing: 0.1,
                        borderTop: "1px solid rgba(147, 181, 218, 0.15)",
                    }}
                >
                    {isPositive ? "↑" : "↓"} {Math.abs(change)}%
                    {changeLabel && ` ${changeLabel}`}
                </Typography>
            )}
        </Card>
    );
}