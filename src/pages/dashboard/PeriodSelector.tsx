import { ToggleButton, ToggleButtonGroup} from "@mui/material";
import type { Period } from "../../Data/dashboardStats";

type PeriodSelectorProps = {
    value: Period;
    onChange: (period: Period) => void;
};

const periods: { value: Period; label: string }[] = [
    { value: "week", label: "Semaine" },
    { value: "month", label: "Mois" },
    { value: "year", label: "Année" },
];

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, newVal) => newVal && onChange(newVal)}
            size="small"
            sx={{
                bgcolor: "rgba(10, 37, 77, 0.6)",
                border: "1px solid rgba(147, 181, 218, 0.2)",
                "& .MuiToggleButton-root": {
                    color: "text.secondary",
                    "&.Mui-selected": {
                        bgcolor: "rgba(47, 124, 201, 0.3)",
                        color: "primary.light",
                        "&:hover": { bgcolor: "rgba(47, 124, 201, 0.4)" },
                    },
                },
            }}
        >
            {periods.map((p) => (
                <ToggleButton key={p.value} value={p.value}>
                    {p.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}