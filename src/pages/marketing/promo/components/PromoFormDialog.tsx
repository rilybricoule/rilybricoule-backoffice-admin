import { useEffect, useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, Typography,
} from "@mui/material";
import type { Promo } from "../../../../Data/Promo";

const dialogPaperSx = {
    bgcolor:  "rgba(10,37,77,0.98)",
    border:   "1px solid rgba(147,181,218,0.2)",
    minWidth: 440,
};

type FormState = {
    code:        string;
    discount:    string;
    startDate:   string;
    endDate:     string;
    maxUsage:    string;
    description: string;
};

const empty: FormState = {
    code: "", discount: "", startDate: "", endDate: "", maxUsage: "", description: "",
};

type Props = {
    open:      boolean;
    editPromo: Promo | null;
    onClose:   () => void;
    onSave:    (data: Omit<Promo, "id" | "usageCount" | "createdAt">) => void;
};

export default function PromoFormDialog({ open, editPromo, onClose, onSave }: Props) {
    const [form, setForm] = useState<FormState>(empty);

    useEffect(() => {
        if (editPromo) {
            setForm({
                code:        editPromo.code,
                discount:    String(editPromo.discount),
                startDate:   editPromo.startDate,
                endDate:     editPromo.endDate,
                maxUsage:    String(editPromo.maxUsage),
                description: editPromo.description ?? "",
            });
        } else {
            setForm(empty);
        }
    }, [editPromo, open]);

    const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const isValid =
        form.code.trim() &&
        Number(form.discount) > 0 && Number(form.discount) <= 100 &&
        form.startDate && form.endDate &&
        form.endDate >= form.startDate &&
        Number(form.maxUsage) > 0;

    const handleSave = () => {
        if (!isValid) return;
        const today = new Date().toISOString().split("T")[0];
        const status = form.endDate < today ? "expired" : "active";
        onSave({
            code:        form.code.toUpperCase().trim(),
            discount:    Number(form.discount),
            startDate:   form.startDate,
            endDate:     form.endDate,
            maxUsage:    Number(form.maxUsage),
            status,
            description: form.description.trim() || undefined,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle>{editPromo ? "Modifier le code promo" : "Nouveau code promo"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Code promo" size="small" fullWidth
                        value={form.code}
                        onChange={set("code")}
                        placeholder="Ex: SUMMER25"
                        inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                    <TextField
                        label="Réduction (%)" size="small" fullWidth
                        type="number" value={form.discount}
                        onChange={set("discount")}
                        inputProps={{ min: 1, max: 100 }}
                        helperText="Entre 1 et 100"
                    />
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            label="Date de début" size="small" fullWidth
                            type="date" value={form.startDate}
                            onChange={set("startDate")}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Date de fin" size="small" fullWidth
                            type="date" value={form.endDate}
                            onChange={set("endDate")}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                    {form.endDate && form.startDate && form.endDate < form.startDate && (
                        <Typography variant="caption" color="error.main">
                            La date de fin doit être après la date de début.
                        </Typography>
                    )}
                    <TextField
                        label="Nombre max d'utilisations" size="small" fullWidth
                        type="number" value={form.maxUsage}
                        onChange={set("maxUsage")}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        label="Description (optionnel)" size="small" fullWidth
                        value={form.description}
                        onChange={set("description")}
                        placeholder="Ex: Offre de lancement"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Annuler</Button>
                <Button variant="contained" onClick={handleSave} disabled={!isValid}>
                    {editPromo ? "Enregistrer" : "Créer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}