import { useState } from "react";
import {
    Box, Button, Chip, Collapse, Divider, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TuneIcon from "@mui/icons-material/Tune";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import type { ServiceCategory as Category } from "../../Data/ServiceCategory";

import { getCategoryDepth } from "./Categoryhelpers";

interface Props {
    category: Category;
    allCategories: Category[];
    onEdit: (c: Category) => void;
    onAddSub: (c: Category) => void;
    onDelete: (c: Category) => void;
}

export default function CategoryDetailPanel({ category, allCategories, onEdit, onAddSub, onDelete }: Props) {
    const [subExpanded, setSubExpanded] = useState(true);

    const children = allCategories.filter((c) => c.parentId === category.id);
    const parent = category.parentId ? allCategories.find((c) => c.id === category.parentId) : null;

    const serviceCount = category.serviceCount ?? 0;
    const providerCount = category.providerCount ?? 0;
    const attributes = category.attributes ?? [];
    const depth = getCategoryDepth(category.id, allCategories);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Hero */}
            <Box sx={{
                p: 2.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, rgba(47,124,201,0.12) 0%, rgba(99,102,241,0.08) 100%)",
                border: "1px solid rgba(147,181,218,0.15)",
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: category.description ? 1.5 : 0 }}>
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        flexShrink: 0,
                        bgcolor: "rgba(47,124,201,0.12)",
                        border: "1px solid rgba(147,181,218,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                    }}>
                        {category.icon ?? "📁"}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                {category.name}
                            </Typography>

                            {depth > 0 && (
                                <Chip label={`Niveau ${depth + 1}`} size="small" sx={{
                                    height: 18,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    bgcolor: "rgba(147,181,218,0.1)",
                                    color: "text.secondary",
                                    border: "1px solid rgba(147,181,218,0.2)",
                                    "& .MuiChip-label": { px: 0.75 },
                                }} />
                            )}
                        </Box>

                        {parent && (
                            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                                Sous-catégorie de {parent.icon} {parent.name}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {category.description && (
                    <Typography color="text.secondary" sx={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
                        {category.description}
                    </Typography>
                )}
            </Box>

            {/* Stats */}
            <Box sx={{ display: "flex", gap: 1 }}>
                {[
                    { label: "Prestataires", value: providerCount, color: "rgba(165,180,252,0.9)", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
                    { label: "Services", value: serviceCount, color: "rgba(52,211,153,0.9)", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
                    { label: "Sous-cats", value: children.length, color: "rgba(147,181,218,0.9)", bg: "rgba(47,124,201,0.08)", border: "rgba(47,124,201,0.2)" },
                ].map((stat) => (
                    <Box key={stat.label} sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: stat.bg,
                        border: `1px solid ${stat.border}`,
                        textAlign: "center",
                    }}>
                        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                            {stat.value}
                        </Typography>
                        <Typography sx={{
                            fontSize: "0.62rem",
                            color: "text.secondary",
                            mt: 0.4,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}>
                            {stat.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onAddSub(category)}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        borderColor: "rgba(147,181,218,0.2)",
                        color: "text.secondary",
                        "&:hover": { borderColor: "primary.light", color: "primary.light" },
                    }}
                >
                    Sous-catégorie
                </Button>

                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onEdit(category)}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        borderColor: "rgba(147,181,218,0.2)",
                        color: "text.secondary",
                        "&:hover": { borderColor: "primary.light", color: "primary.light" },
                    }}
                >
                    Modifier
                </Button>

                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onDelete(category)}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        borderColor: "rgba(211,47,47,0.2)",
                        color: "error.main",
                        "&:hover": { borderColor: "error.main", bgcolor: "rgba(211,47,47,0.07)" },
                    }}
                >
                    Supprimer
                </Button>
            </Box>

            <Divider sx={{ borderColor: "rgba(147,181,218,0.1)" }} />

            {/* Direct children */}
            {children.length > 0 && (
                <Box>
                    <Box
                        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25, cursor: "pointer" }}
                        onClick={() => setSubExpanded((v) => !v)}
                    >
                        <Typography sx={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "text.secondary",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}>
                            Sous-catégories directes ({children.length})
                        </Typography>
                        <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                    </Box>

                    <Collapse in={subExpanded}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                            {children.map((child) => (
                                <Box key={child.id} sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    p: 1.25,
                                    borderRadius: 1.5,
                                    bgcolor: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(147,181,218,0.08)",
                                }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography sx={{ fontSize: "1rem" }}>{child.icon ?? "📁"}</Typography>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
                                                {child.name}
                                            </Typography>
                                            {child.description && (
                                                <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                                                    {child.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                        {(child.providerCount ?? 0) > 0 && (
                                            <Chip label={`${child.providerCount ?? 0}p`} size="small" sx={{
                                                height: 18,
                                                fontSize: "0.6rem",
                                                fontWeight: 700,
                                                bgcolor: "rgba(99,102,241,0.1)",
                                                color: "rgba(165,180,252,0.8)",
                                                border: "1px solid rgba(99,102,241,0.2)",
                                                "& .MuiChip-label": { px: 0.6 },
                                            }} />
                                        )}

                                        {(child.serviceCount ?? 0) > 0 && (
                                            <Chip label={`${child.serviceCount ?? 0}s`} size="small" sx={{
                                                height: 18,
                                                fontSize: "0.6rem",
                                                fontWeight: 700,
                                                bgcolor: "rgba(16,185,129,0.08)",
                                                color: "rgba(52,211,153,0.8)",
                                                border: "1px solid rgba(16,185,129,0.2)",
                                                "& .MuiChip-label": { px: 0.6 },
                                            }} />
                                        )}

                                        {(child.attributes?.length ?? 0) > 0 && (
                                            <Chip label={`${child.attributes?.length ?? 0} attr`} size="small" sx={{
                                                height: 18,
                                                fontSize: "0.6rem",
                                                fontWeight: 700,
                                                bgcolor: "rgba(245,158,11,0.08)",
                                                color: "#f59e0b",
                                                border: "1px solid rgba(245,158,11,0.2)",
                                                "& .MuiChip-label": { px: 0.6 },
                                            }} />
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {/* Attributes */}
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                    <TuneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                    }}>
                        Attributs spécifiques ({attributes.length})
                    </Typography>
                </Box>

                {attributes.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                        {attributes.map((attr) => (
                            <Box key={attr.id} sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                bgcolor: "rgba(245,158,11,0.04)",
                                border: "1px solid rgba(245,158,11,0.15)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                            }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
                                        {attr.name}
                                        {attr.required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                                        {attr.type}
                                        {attr.unit ? ` • ${attr.unit}` : ""}
                                        {attr.options?.length ? ` • ${attr.options.join(", ")}` : ""}
                                    </Typography>
                                </Box>

                                <Chip label={attr.type} size="small" sx={{
                                    height: 18,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    bgcolor: "rgba(245,158,11,0.1)",
                                    color: "#f59e0b",
                                    border: "1px solid rgba(245,158,11,0.2)",
                                    "& .MuiChip-label": { px: 0.75 },
                                }} />
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: "0.78rem", color: "text.disabled" }}>
                        Aucun attribut configuré pour cette catégorie.
                    </Typography>
                )}
            </Box>

            {/* Services */}
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                    <MiscellaneousServicesIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                    }}>
                        Services ({serviceCount})
                    </Typography>
                </Box>

                {serviceCount > 0 ? (
                    <Box sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: "rgba(16,185,129,0.04)",
                        border: "1px solid rgba(16,185,129,0.14)",
                    }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                            {serviceCount > 0
                                ? `${serviceCount} service${serviceCount > 1 ? "s" : ""} lié${serviceCount > 1 ? "s" : ""} à cette catégorie.`
                                : "Aucun service lié à cette catégorie."}
                        </Typography>

                    </Box>
                ) : (
                    <Typography sx={{ fontSize: "0.78rem", color: "text.disabled" }}>
                        Aucun service lié à cette catégorie.
                    </Typography>
                )}
            </Box>

            <Divider sx={{ borderColor: "rgba(147,181,218,0.1)" }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.65rem", color: "text.disabled" }}>
                    Créé le {new Date(category.createdAt).toLocaleDateString("fr-FR")}
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "text.disabled" }}>
                    Modifié le {new Date(category.updatedAt).toLocaleDateString("fr-FR")}
                </Typography>
            </Box>
        </Box>
    );
}
