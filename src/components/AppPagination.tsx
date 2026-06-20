import { Box, IconButton, MenuItem, Select, Typography } from "@mui/material";
import ChevronLeftIcon  from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon    from "@mui/icons-material/FirstPage";
import LastPageIcon     from "@mui/icons-material/LastPage";

type Props = {
    total:         number;
    page:          number;
    rowsPerPage:   number;
    onPageChange:  (page: number) => void;
    onRowsPerPage: (rows: number) => void;
    options?:      number[];
};

export default function AppPagination({
                                          total, page, rowsPerPage, onPageChange, onRowsPerPage, options = [5, 10, 25],
                                      }: Props) {
    const totalPages = Math.ceil(total / rowsPerPage);
    const from       = total === 0 ? 0 : page * rowsPerPage + 1;
    const to         = Math.min(page * rowsPerPage + rowsPerPage, total);

    const btnSx = (disabled: boolean) => ({
        width: 30, height: 30, borderRadius: "8px",
        border: "1px solid rgba(147,181,218,0.15)",
        bgcolor: disabled ? "transparent" : "rgba(147,181,218,0.06)",
        color: disabled ? "rgba(147,181,218,0.2)" : "rgba(226,232,240,0.7)",
        transition: "all 0.15s ease",
        "&:hover": disabled ? {} : {
            bgcolor: "rgba(56,189,248,0.12)",
            borderColor: "rgba(56,189,248,0.35)",
            color: "#38bdf8",
        },
    });

    return (
        <Box sx={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            1.5,
            px:             2,
            py:             0.9,
            bgcolor: "transparent",
            borderTop: "white",
            borderRadius: 0,
        }}>

            {/* Left: rows per page */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(148,163,184,0.6)", fontWeight: 500 }}>
                    Lignes par page
                </Typography>
                <Select
                    value={rowsPerPage}
                    onChange={e => { onRowsPerPage(Number(e.target.value)); onPageChange(0); }}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontSize: 12, fontWeight: 600,
                        color: "rgba(226,232,240,0.8)",
                        height: 28,
                        ".MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(147,181,218,0.2)",
                            borderRadius: "8px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(56,189,248,0.35)",
                        },
                        ".MuiSelect-icon": { color: "rgba(148,163,184,0.5)" },
                        bgcolor: "rgba(147,181,218,0.06)",
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: "rgba(8,18,40,0.97)",
                                border: "1px solid rgba(56,189,248,0.2)",
                                borderRadius: 2,
                                "& .MuiMenuItem-root": {
                                    fontSize: 12, color: "rgba(226,232,240,0.8)",
                                    "&:hover": { bgcolor: "rgba(56,189,248,0.1)" },
                                    "&.Mui-selected": { bgcolor: "rgba(56,189,248,0.15)", color: "#38bdf8" },
                                },
                            },
                        },
                    }}
                >
                    {options.map(o => (
                        <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                </Select>
            </Box>

            {/* Center: counter */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>
                    {from}–{to}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "rgba(148,163,184,0.3)" }}>
                    sur
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "rgba(226,232,240,0.7)" }}>
                    {total}
                </Typography>
            </Box>

            {/* Right: navigation buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <IconButton
                    size="small"
                    onClick={() => onPageChange(0)}
                    disabled={page === 0}
                    sx={btnSx(page === 0)}
                >
                    <FirstPageIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    sx={btnSx(page === 0)}
                >
                    <ChevronLeftIcon sx={{ fontSize: 16 }} />
                </IconButton>

                {/* Page number pills */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    {Array.from({ length: totalPages }, (_, i) => i)
                        .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                        .reduce<(number | "...")[]>((acc, i, idx, arr) => {
                            if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("...");
                            acc.push(i);
                            return acc;
                        }, [])
                        .map((item, idx) =>
                            item === "..." ? (
                                <Typography key={`ellipsis-${idx}`} sx={{
                                    fontSize: 12, color: "rgba(148,163,184,0.4)",
                                    px: 0.5, alignSelf: "center",
                                }}>
                                    ···
                                </Typography>
                            ) : (
                                <Box
                                    key={item}
                                    onClick={() => onPageChange(item as number)}
                                    sx={{
                                        width: 28, height: 28, borderRadius: "8px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer",
                                        fontSize: 12, fontWeight: page === item ? 700 : 500,
                                        transition: "all 0.15s ease",
                                        bgcolor: page === item
                                            ? "rgba(56,189,248,0.18)"
                                            : "rgba(147,181,218,0.06)",
                                        border: page === item
                                            ? "1px solid rgba(56,189,248,0.45)"
                                            : "1px solid rgba(147,181,218,0.12)",
                                        color: page === item ? "#38bdf8" : "rgba(226,232,240,0.6)",
                                        "&:hover": page === item ? {} : {
                                            bgcolor: "rgba(56,189,248,0.08)",
                                            borderColor: "rgba(56,189,248,0.25)",
                                            color: "#7dd3fc",
                                        },
                                    }}
                                >
                                    {(item as number) + 1}
                                </Box>
                            )
                        )
                    }
                </Box>

                <IconButton
                    size="small"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    sx={btnSx(page >= totalPages - 1)}
                >
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onPageChange(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    sx={btnSx(page >= totalPages - 1)}
                >
                    <LastPageIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>

        </Box>
    );
}