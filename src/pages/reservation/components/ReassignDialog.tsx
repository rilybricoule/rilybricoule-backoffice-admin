import {  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useState } from "react";
import { useProviders } from "../../context/ProviderContext";
import type { Reservation } from "../../../Data/Reservation";

type Props = {
    reservation: Reservation | null;
    onClose:     () => void;
    onConfirm:   (newProviderId: string, newProviderName: string) => void;
};

const dialogPaperSx = {
    bgcolor: "rgba(10,37,77,0.98)",
    border:  "1px solid rgba(147,181,218,0.2)",
    minWidth: 420,
};

export default function ReassignDialog({ reservation, onClose, onConfirm }: Props) {
    const { providers } = useProviders();
    const [newProviderId, setNewProviderId] = useState("");

    const eligible = providers.filter(p =>
        p.status === "approved" &&
        p.id !== reservation?.providerId &&
        p.serviceCategories.includes(reservation?.category ?? "")
    );

    const handleConfirm = () => {
        const provider = providers.find(p => p.id === newProviderId);
        if (!provider) return;
        onConfirm(newProviderId, `${provider.firstName} ${provider.lastName}`);
        setNewProviderId("");
    };

    return (
        <Dialog open={Boolean(reservation)} onClose={onClose} PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle>Réassigner la réservation</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Choisir un nouveau prestataire pour <strong>"{reservation?.offerTitle}"</strong>.
                    La réservation sera rebasculée en <strong>En attente</strong>.
                </DialogContentText>
                <FormControl fullWidth size="small">
                    <InputLabel>Nouveau prestataire</InputLabel>
                    <Select
                        value={newProviderId}
                        label="Nouveau prestataire"
                        onChange={(e) => setNewProviderId(e.target.value)}
                    >
                        {eligible.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.firstName} {p.lastName}
                                {p.businessName ? ` — ${p.businessName}` : ""}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {eligible.length === 0 && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: "block" }}>
                        Aucun prestataire approuvé disponible pour "{reservation?.category}".
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Annuler</Button>
                <Button variant="contained" color="warning" onClick={handleConfirm} disabled={!newProviderId}>
                    Réassigner
                </Button>
            </DialogActions>
        </Dialog>
    );
}