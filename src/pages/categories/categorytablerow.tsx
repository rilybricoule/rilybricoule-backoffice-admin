import { Box, Chip, IconButton, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import AddIcon                    from "@mui/icons-material/Add";
import EditIcon                   from "@mui/icons-material/Edit";
import DeleteOutlineIcon          from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon             from "@mui/icons-material/ExpandMore";
import ExpandLessIcon             from "@mui/icons-material/ExpandLess";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import type { ServiceCategory as Category } from "../../Data/ServiceCategory";


interface Props {
    category:       Category;
    allCategories:  Category[];
    depth:          number;
    expandedRows:   Set<string>;
    toggleRow:      (id: string) => void;
    selectedCat:    Category | null;
    setSelectedCat: (c: Category | null) => void;
    openEdit:       (c: Category) => void;
    openAddSub:     (c: Category) => void;
    setDeleteTarget:(c: Category) => void;
}

export default function CategoryTableRow({
                                             category, allCategories, depth, expandedRows, toggleRow,
                                             selectedCat, setSelectedCat, openEdit, openAddSub, setDeleteTarget,
                                         }: Props) {
    const children      = allCategories.filter((c) => c.parentId === category.id);
    const serviceCount = category.serviceCount ?? 0;
    const providerCount = category.providerCount ?? 0;

    const isExpanded    = expandedRows.has(category.id);
    const isSelected    = selectedCat?.id === category.id;
    const indentPx      = depth * 20;

    const cellSx = { borderBottom: "1px solid rgba(147,181,218,0.08)" };

    return (
        <>
            <TableRow
                onClick={() => setSelectedCat(isSelected ? null : category)}
                sx={{
                    cursor: "pointer",
                    bgcolor: isSelected
                        ? "rgba(47,124,201,0.1)"
                        : depth === 0 ? "transparent" : `rgba(0,0,0,${Math.min(depth * 0.05, 0.2)})`,
                    "&:hover": {
                        bgcolor: isSelected ? "rgba(47,124,201,0.1)" : "rgba(255,255,255,0.03)",
                    },
                }}
            >
                {/* Name */}
                <TableCell sx={{ ...cellSx, py: depth === 0 ? 1.5 : 1.25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: `${indentPx}px` }}>
                        {depth > 0 && (
                            <SubdirectoryArrowRightIcon sx={{
                                fontSize: 13, flexShrink: 0,
                                color: `rgba(148,163,184,${Math.max(0.15, 0.4 - depth * 0.05)})`,
                            }} />
                        )}
                        {children.length > 0 ? (
                            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25, flexShrink: 0 }}
                                        onClick={(e) => { e.stopPropagation(); toggleRow(category.id); }}>
                                {isExpanded ? <ExpandLessIcon sx={{ fontSize: 15 }} /> : <ExpandMoreIcon sx={{ fontSize: 15 }} />}
                            </IconButton>
                        ) : (
                            <Box sx={{ width: 26, flexShrink: 0 }} />
                        )}
                        <Box sx={{
                            width: depth === 0 ? 32 : 26,
                            height: depth === 0 ? 32 : 26,
                            borderRadius: depth === 0 ? 1.5 : 1, flexShrink: 0,
                            bgcolor: isSelected ? "rgba(47,124,201,0.2)" : "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(147,181,218,0.12)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: depth === 0 ? "1rem" : "0.85rem",
                        }}>
                            {category.icon ?? "📁"}
                        </Box>
                        <Box>
                            <Typography variant="body2" fontWeight={depth === 0 ? 700 : 600} sx={{
                                fontSize: depth === 0 ? "0.85rem" : "0.8rem",
                                color: isSelected ? "primary.light" : depth === 0 ? "text.primary" : "text.secondary",
                            }}>
                                {category.name}
                            </Typography>
                            {category.description && (
                                <Typography sx={{ fontSize: "0.68rem", color: "text.disabled", lineHeight: 1.3 }}>
                                    {category.description.length > 50 ? category.description.slice(0, 50) + "…" : category.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </TableCell>

                {/* Direct children chips */}
                <TableCell sx={cellSx}>
                    {children.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {children.slice(0, 2).map((child) => (
                                <Chip key={child.id} label={`${child.icon ?? ""} ${child.name}`} size="small" sx={{
                                    height: 20, fontSize: "0.65rem", fontWeight: 600,
                                    bgcolor: "rgba(255,255,255,0.04)", color: "text.secondary",
                                    border: "1px solid rgba(147,181,218,0.12)", "& .MuiChip-label": { px: 0.75 },
                                }} />
                            ))}
                            {children.length > 2 && (
                                <Chip label={`+${children.length - 2}`} size="small" sx={{
                                    height: 20, fontSize: "0.65rem", bgcolor: "transparent",
                                    color: "text.disabled", border: "1px solid rgba(147,181,218,0.08)",
                                    "& .MuiChip-label": { px: 0.75 },
                                }} />
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                </TableCell>

                {/* Providers */}
                <TableCell sx={cellSx}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1, py: 0.25, borderRadius: "20px", bgcolor: providerCount > 0 ? "rgba(99,102,241,0.08)" : "transparent" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(165,180,252,0.6)", flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: providerCount > 0 ? "rgba(165,180,252,0.9)" : "text.disabled" }}>
                            {providerCount}
                        </Typography>
                    </Box>
                </TableCell>

                {/* Services */}
                <TableCell sx={cellSx}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1, py: 0.25, borderRadius: "20px", bgcolor: serviceCount > 0 ? "rgba(16,185,129,0.08)" : "transparent" }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(52,211,153,0.6)", flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={600} sx={{ color: serviceCount > 0 ? "rgba(52,211,153,0.9)" : "text.disabled" }}>
                            {serviceCount}
                        </Typography>
                    </Box>
                </TableCell>

                {/* Created at */}
                <TableCell sx={cellSx}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                        {new Date(category.createdAt).toLocaleDateString("fr-FR")}
                    </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }} align="right"
                           onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Ajouter sous-catégorie">
                        <IconButton size="small" sx={{ p: 0.5, color: "primary.light" }} onClick={() => openAddSub(category)}>
                            <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                        <IconButton size="small" sx={{ p: 0.5, color: "text.secondary" }} onClick={() => openEdit(category)}>
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <IconButton size="small" sx={{ p: 0.5, color: "error.main" }} onClick={() => setDeleteTarget(category)}>
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>

            {/* Recursively render children */}
            {isExpanded && children.map((child) => (
                <CategoryTableRow
                    key={child.id}
                    category={child}
                    allCategories={allCategories}
                    depth={depth + 1}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    selectedCat={selectedCat}
                    setSelectedCat={setSelectedCat}
                    openEdit={openEdit}
                    openAddSub={openAddSub}
                    setDeleteTarget={setDeleteTarget}
                />
            ))}
        </>
    );
}