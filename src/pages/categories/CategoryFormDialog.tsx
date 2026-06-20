import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import type {CategoryAttribute, ServiceCategory} from "../../Data/ServiceCategory";
import type { ServiceCategory as Category } from "../../Data/ServiceCategory";

type CategoryFormData = Omit<ServiceCategory, "id" | "createdAt" | "updatedAt">;


type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => void;
    category: ServiceCategory | null;
    categories: ServiceCategory[];
};

export default function CategoryFormDialog({ open, onClose, onSubmit, category, categories }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState<string>("");
    const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);

    const parentOptions = categories.filter((c) => !c.parentId && c.id !== category?.id);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description ?? "");
            setParentId(category.parentId ?? "");
            setAttributes(category.attributes ?? []);
        } else {
            setName("");
            setDescription("");
            setParentId("");
            setAttributes([]);
        }
    }, [category, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({
            name: name.trim(),
            description: description.trim() || undefined,
            parentId: parentId || undefined,
            attributes: attributes.length > 0 ? attributes : undefined,
        });
        onClose();
    };

    const addAttribute = () => {
        setAttributes((prev) => [
            ...prev,
            { id: `attr_${Date.now()}`, name: "", type: "text", required: false },
        ]);
    };

    const updateAttribute = (index: number, updates: Partial<CategoryAttribute>) => {
        setAttributes((prev) =>
            prev.map((a, i) => (i === index ? { ...a, ...updates } : a))
        );
    };

    const removeAttribute = (index: number) => {
        setAttributes((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <TextField
                            label="Nom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                        />
                        <FormControl fullWidth size="small">
                            <InputLabel>Sous-catégorie de</InputLabel>
                            <Select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                label="Sous-catégorie de"
                            >
                                <MenuItem value="">Aucune</MenuItem>
                                {parentOptions.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                <strong>Attributs spécifiques</strong>
                                <Button size="small" onClick={addAttribute}>+ Ajouter</Button>
                            </Box>
                            {attributes.map((attr, i) => (
                                <Box key={attr.id} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                                    <TextField
                                        placeholder="Nom"
                                        value={attr.name}
                                        onChange={(e) => updateAttribute(i, { name: e.target.value })}
                                        size="small"
                                        sx={{ flex: 1 }}
                                    />
                                    <Select
                                        value={attr.type}
                                        onChange={(e) => updateAttribute(i, { type: e.target.value as CategoryAttribute["type"] })}
                                        size="small"
                                        sx={{ minWidth: 100 }}
                                    >
                                        <MenuItem value="text">Texte</MenuItem>
                                        <MenuItem value="number">Nombre</MenuItem>
                                        <MenuItem value="select">Liste</MenuItem>
                                    </Select>
                                    {attr.type === "number" && (
                                        <TextField
                                            placeholder="Unité (m²)"
                                            value={attr.unit ?? ""}
                                            onChange={(e) => updateAttribute(i, { unit: e.target.value })}
                                            size="small"
                                            sx={{ width: 80 }}
                                        />
                                    )}
                                    <Button size="small" color="error" onClick={() => removeAttribute(i)}>×</Button>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Annuler</Button>
                    <Button type="submit" variant="contained" disabled={!name.trim()}>
                        {category ? "Enregistrer" : "Créer"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}