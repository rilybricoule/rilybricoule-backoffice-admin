import { useState, useRef, useEffect } from "react";
import {
    Box, Button, IconButton, Paper, TextField, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { ServiceCategory as Category, CategoryAttribute } from "../../Data/ServiceCategory";
import TreeSelector from "./Treeselector";

// ── Icon options ──────────────────────────────────────────────────────────────


// ── Icon Dropdown ─────────────────────────────────────────────────────────────

function IconInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
            <Box
                sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.5,
                    bgcolor: "rgba(47,124,201,0.1)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                }}
            >
                {value || "📁"}
            </Box>

            <TextField
                label="Icône"
                placeholder="Collez un emoji ou symbole"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                fullWidth
                helperText="Exemples : 🔧, ⚡, 🧹, 🏠, 📦"
                sx={{
                    "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(0,0,0,0.2)",
                        "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
                        "&:hover fieldset": { borderColor: "rgba(147,181,218,0.35)" },
                    },
                    "& .MuiInputLabel-root": { color: "text.secondary" },
                }}
            />
        </Box>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

interface Props {
    open:           boolean;
    onClose:        () => void;
    onSave:         (cat: Category) => void;
    editCategory:   Category | null;
    parentCategory: Category | null;
    categories:     Category[];
}

export default function CategoryFormModal({
                                              open, onClose, onSave, editCategory, parentCategory, categories,
                                          }: Props) {
    const isEdit = Boolean(editCategory);

    const [name,        setName]        = useState(editCategory?.name        ?? "");
    const [description, setDescription] = useState(editCategory?.description ?? "");
    const [icon,        setIcon]        = useState(editCategory?.icon        ?? "");

    const [attributes,  setAttributes]  = useState<CategoryAttribute[]>(editCategory?.attributes ?? []);
    const [attrName,    setAttrName]    = useState("");
    const [attrType,    setAttrType]    = useState<"text"|"number"|"select">("text");
    const [attrUnit,    setAttrUnit]    = useState("");
    const [attrOpts,    setAttrOpts]    = useState("");
    const [attrReq,     setAttrReq]     = useState(false);

    const handleAddAttr = () => {
        if (!attrName.trim()) return;
        setAttributes((prev) => [...prev, {
            id:       `attr_${Date.now()}`,
            name:     attrName.trim(),
            type:     attrType,
            unit:     attrUnit.trim() || undefined,
            options:  attrType === "select" ? attrOpts.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
            required: attrReq,
        }]);
        setAttrName(""); setAttrUnit(""); setAttrOpts(""); setAttrReq(false); setAttrType("text");
    };


    const [parentId, setParentId] = useState<string | null>(() => {
        if (editCategory?.parentId) return editCategory.parentId;
        if (parentCategory?.id) return parentCategory.id;
        return null;
    });


    const handleSave = () => {
        if (!name.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        onSave({
            id:          editCategory?.id ?? `cat_${Date.now()}`,
            parentId:    parentId ?? null,
            name:        name.trim(),
            description: description.trim() || undefined,
            icon:        icon.trim() || undefined,
            attributes:  attributes.length > 0 ? attributes : undefined,
            createdAt:   editCategory?.createdAt ?? now,
            updatedAt:   now,
        });
    };

    if (!open) return null;

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(0,0,0,0.2)",
            "& fieldset": { borderColor: "rgba(147,181,218,0.2)" },
            "&:hover fieldset": { borderColor: "rgba(147,181,218,0.35)" },
        },
        "& .MuiInputLabel-root": { color: "text.secondary" },
    };

    return (
        <Box sx={{
            position: "fixed", inset: 0, zIndex: 1500,
            bgcolor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", p: 2,
        }}>
            <Paper sx={{
                width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto",
                bgcolor: "rgba(10,37,77,0.97)", border: "1px solid rgba(147,181,218,0.25)", borderRadius: 3,
                "&::-webkit-scrollbar": { width: 5 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(148,163,184,0.2)", borderRadius: 10 },
            }}>
                {/* Header */}
                <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(147,181,218,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem" }}>
                        {isEdit ? "Modifier la catégorie" : parentId ? "Nouvelle sous-catégorie" : "Nouvelle catégorie"}
                    </Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>

                    {/* Parent selector */}
                    <Box>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
                            Catégorie parente
                        </Typography>
                        <TreeSelector
                            categories={categories}
                            value={parentId}
                            onChange={setParentId}
                            excludeId={editCategory?.id}
                        />
                    </Box>

                    {/* Icon dropdown */}
                    <Box>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
                            Icône
                        </Typography>
                        <IconInput value={icon} onChange={setIcon} />
                    </Box>

                    {/* Name */}
                    <TextField
                        label="Nom de la catégorie"
                        value={name} onChange={(e) => setName(e.target.value)}
                        size="small" fullWidth sx={inputSx} required
                    />

                    {/* Description */}
                    <TextField
                        label="Description"
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        size="small" fullWidth multiline rows={2} sx={inputSx}
                    />

                    {/* Attributes */}
                    <Box>
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.25 }}>
                            Attributs spécifiques
                        </Typography>

                        {attributes.length > 0 && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1.5 }}>
                                {attributes.map((attr, i) => (
                                    <Box key={attr.id} sx={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        p: 1.25, borderRadius: 1.5,
                                        bgcolor: "rgba(255,255,255,0.03)", border: "1px solid rgba(147,181,218,0.1)",
                                    }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
                                                {attr.name}
                                                {attr.unit && <span style={{ color: "rgba(148,163,184,0.6)", fontWeight: 400 }}> ({attr.unit})</span>}
                                                {attr.required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                                                {attr.type}{attr.options ? ` • ${attr.options.join(", ")}` : ""}
                                            </Typography>
                                        </Box>
                                        <IconButton size="small" sx={{ color: "error.main", opacity: 0.6 }}
                                                    onClick={() => setAttributes((prev) => prev.filter((_, j) => j !== i))}>
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(147,181,218,0.1)", borderRadius: 1.5 }}>
                            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "text.secondary", mb: 1.25, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                + Ajouter un attribut
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                                <TextField label="Nom" value={attrName} onChange={(e) => setAttrName(e.target.value)}
                                           size="small" sx={{ flex: 1, minWidth: 120, ...inputSx }} />
                                <TextField label="Unité" value={attrUnit} onChange={(e) => setAttrUnit(e.target.value)}
                                           size="small" sx={{ width: 80, ...inputSx }} placeholder="m², kg..." />
                                <Box component="select" value={attrType}
                                     onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAttrType(e.target.value as any)}
                                     sx={{
                                         px: 1, bgcolor: "rgba(0,0,0,0.2)", border: "1px solid rgba(147,181,218,0.2)",
                                         borderRadius: "8px", color: "text.primary", fontSize: "0.8rem",
                                         fontFamily: "inherit", outline: "none", cursor: "pointer",
                                     }}>
                                    <option value="text">Texte</option>
                                    <option value="number">Nombre</option>
                                    <option value="select">Sélection</option>
                                </Box>
                            </Box>
                            {attrType === "select" && (
                                <TextField label="Options (séparées par virgule)" value={attrOpts}
                                           onChange={(e) => setAttrOpts(e.target.value)}
                                           size="small" fullWidth sx={{ mb: 1, ...inputSx }}
                                           placeholder="Option 1, Option 2, Option 3" />
                            )}
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                                     onClick={() => setAttrReq((v) => !v)}>
                                    <Box sx={{
                                        width: 16, height: 16, borderRadius: 0.5,
                                        border: "1px solid rgba(147,181,218,0.3)",
                                        bgcolor: attrReq ? "primary.main" : "transparent",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {attrReq && <CheckIcon sx={{ fontSize: 11, color: "white" }} />}
                                    </Box>
                                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Requis</Typography>
                                </Box>
                                <Button size="small" variant="outlined" onClick={handleAddAttr} disabled={!attrName.trim()}
                                        sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600,
                                            borderColor: "rgba(147,181,218,0.25)", color: "text.primary" }}>
                                    Ajouter
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ p: 2.5, borderTop: "1px solid rgba(147,181,218,0.12)", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                    <Button variant="outlined" onClick={onClose} size="small"
                            sx={{ textTransform: "none", fontWeight: 600, borderColor: "rgba(147,181,218,0.2)", color: "text.secondary" }}>
                        Annuler
                    </Button>
                    <Button variant="contained" onClick={handleSave} size="small" disabled={!name.trim()}
                            sx={{ textTransform: "none", fontWeight: 700 }}>
                        {isEdit ? "Enregistrer" : "Créer"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}