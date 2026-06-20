import { Box, Chip, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { ReservationStatus } from "../../../Data/Reservation";

const filterTabs: { key: "all" | ReservationStatus; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "pending_payment", label: "Paiement en attente" },
    { key: "confirmed", label: "Confirmées" },
    { key: "completed", label: "Terminées" },
    { key: "cancelled", label: "Annulées" },
];

type Counts = {
    all: number;
    pending_payment: number;
    confirmed: number;
    completed: number;
    cancelled: number;
};

type Props = {
    search: string;
    onSearch: (v: string) => void;
    statusFilter: "all" | ReservationStatus;
    onStatusFilter: (v: "all" | ReservationStatus) => void;
    categoryFilter: string;
    onCategoryFilter: (v: string) => void;
    methodFilter: string;
    onMethodFilter: (v: string) => void;
    categories: string[];
    counts: Counts;
};

export default function ReservationFilters({
                                               search,
                                               onSearch,
                                               statusFilter,
                                               onStatusFilter,
                                               categoryFilter,
                                               onCategoryFilter,
                                               methodFilter,
                                               onMethodFilter,
                                               categories,
                                               counts,
                                           }: Props) {
    const selectSx = {
        bgcolor: "rgba(0,0,0,0.2)",
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(147,181,218,0.2)" },
    };

    return (
        <Box sx={{
            p: 2,
            mb: 3,
            bgcolor: "rgba(10,37,77,0.6)",
            border: "1px solid rgba(147,181,218,0.2)",
            borderRadius: 2,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
        }}>
            <TextField
                placeholder="Rechercher client, prestataire, service..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    flex: 1,
                    minWidth: 240,
                    "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(0,0,0,0.2)",
                        "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                    },
                }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Catégorie</InputLabel>
                <Select
                    value={categoryFilter}
                    label="Catégorie"
                    onChange={(e) => onCategoryFilter(e.target.value)}
                    sx={selectSx}
                >
                    <MenuItem value="all">Toutes</MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Méthode</InputLabel>
                <Select
                    value={methodFilter}
                    label="Méthode"
                    onChange={(e) => onMethodFilter(e.target.value)}
                    sx={selectSx}
                >
                    <MenuItem value="all">Toutes</MenuItem>
                    <MenuItem value="carte">Carte</MenuItem>
                    <MenuItem value="especes">Espèces</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {filterTabs.map((tab) => {
                    const active = statusFilter === tab.key;

                    return (
                        <Chip
                            key={tab.key}
                            label={`${tab.label} (${counts[tab.key] ?? 0})`}
                            onClick={() => onStatusFilter(tab.key)}
                            size="small"
                            sx={{
                                cursor: "pointer",
                                fontWeight: active ? 700 : 500,
                                bgcolor: active ? "rgba(56,189,248,0.18)" : "rgba(147,181,218,0.08)",
                                color: active ? "#f8fafc" : "rgba(226,232,240,0.72)",
                                border: active ? "1px solid rgba(56,189,248,0.45)" : "1px solid rgba(147,181,218,0.18)",
                                "&:hover": {
                                    bgcolor: active ? "rgba(56,189,248,0.24)" : "rgba(147,181,218,0.14)",
                                },
                            }}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}
