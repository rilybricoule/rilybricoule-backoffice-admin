import { Box, Button, Paper, Typography } from "@mui/material";

import type { ServiceCategory as Category } from "../../Data/ServiceCategory";


interface Props {
    open:      boolean;
    category:  Category | null;
    onConfirm: () => void;
    onCancel:  () => void;
}

export default function DeleteConfirmDialog({ open, category, onConfirm, onCancel }: Props) {
    if (!open || !category) return null;

    return (
        <Box sx={{
            position: "fixed", inset: 0, zIndex: 1600,
            bgcolor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", p: 2,
        }}>
            <Paper sx={{
                width: "100%", maxWidth: 400, p: 3,
                bgcolor: "rgba(10,37,77,0.97)", border: "1px solid rgba(211,47,47,0.3)", borderRadius: 3,
            }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    Supprimer la catégorie
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.85rem", mb: 2.5 }}>
                    Êtes-vous sûr de vouloir supprimer <strong>{category.icon} {category.name}</strong> ?
                    Cette action est irréversible et supprimera également toutes les sous-catégories associées.
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                    <Button variant="outlined" onClick={onCancel} size="small"
                            sx={{ textTransform: "none", fontWeight: 600, borderColor: "rgba(147,181,218,0.2)", color: "text.secondary" }}>
                        Annuler
                    </Button>
                    <Button variant="contained" color="error" onClick={onConfirm} size="small"
                            sx={{ textTransform: "none", fontWeight: 700 }}>
                        Supprimer
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}