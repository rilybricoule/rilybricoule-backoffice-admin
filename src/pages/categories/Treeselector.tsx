import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import CategoryIcon               from "@mui/icons-material/Category";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import type { Category } from "../../Data/Category";
import { buildFlatTree, getAllDescendantIds } from "./Categoryhelpers";

interface Props {
    categories: Category[];
    value:      string | null;
    onChange:   (id: string | null) => void;
    excludeId?: string;
}

export default function TreeSelector({ categories, value, onChange, excludeId }: Props) {
    const flatTree = useMemo(() => buildFlatTree(categories), [categories]);

    const excludedIds = useMemo(() => {
        if (!excludeId) return new Set<string>();
        return new Set([excludeId, ...getAllDescendantIds(excludeId, categories)]);
    }, [excludeId, categories]);

    return (
        <Box sx={{
            maxHeight: 200, overflowY: "auto",
            border: "1px solid rgba(147,181,218,0.2)", borderRadius: "8px",
            bgcolor: "rgba(0,0,0,0.2)",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(148,163,184,0.2)", borderRadius: 10 },
        }}>
            {/* None option */}
            <Box
                onClick={() => onChange(null)}
                sx={{
                    display: "flex", alignItems: "center", gap: 1,
                    px: 1.5, py: 0.9, cursor: "pointer",
                    bgcolor: value === null ? "rgba(47,124,201,0.15)" : "transparent",
                    borderBottom: "1px solid rgba(147,181,218,0.08)",
                    "&:hover": { bgcolor: value === null ? "rgba(47,124,201,0.15)" : "rgba(255,255,255,0.04)" },
                }}
            >
                <CategoryIcon sx={{ fontSize: 14, color: value === null ? "primary.light" : "text.secondary" }} />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: value === null ? 700 : 500, color: value === null ? "primary.light" : "text.secondary" }}>
                    Catégorie principale (aucun parent)
                </Typography>
            </Box>

            {flatTree
                .filter(({ category }) => !excludedIds.has(category.id))
                .map(({ category, depth }) => (
                    <Box
                        key={category.id}
                        onClick={() => onChange(category.id)}
                        sx={{
                            display: "flex", alignItems: "center", gap: 1,
                            pl: 1.5 + depth * 2, pr: 1.5, py: 0.9,
                            cursor: "pointer",
                            bgcolor: value === category.id ? "rgba(47,124,201,0.15)" : "transparent",
                            borderBottom: "1px solid rgba(147,181,218,0.06)",
                            "&:hover": { bgcolor: value === category.id ? "rgba(47,124,201,0.15)" : "rgba(255,255,255,0.04)" },
                        }}
                    >
                        {depth > 0 && (
                            <SubdirectoryArrowRightIcon sx={{ fontSize: 11, color: "rgba(148,163,184,0.3)", flexShrink: 0 }} />
                        )}
                        <Typography sx={{ fontSize: "0.85rem", flexShrink: 0 }}>{category.icon ?? "📁"}</Typography>
                        <Typography sx={{
                            fontSize: "0.78rem",
                            fontWeight: value === category.id ? 700 : 400,
                            color: value === category.id ? "primary.light" : depth === 0 ? "text.primary" : "text.secondary",
                        }}>
                            {category.name}
                        </Typography>
                    </Box>
                ))
            }
        </Box>
    );
}