import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { Client } from "../../Data/Client";

type ConfirmDeactivateDialogProps = {
    open: boolean;
    client: Client | null;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDeactivateDialog({ open, client, onConfirm, onCancel }: ConfirmDeactivateDialogProps) {
    if (!client) return null;

    return (
        <Dialog
            open={open}
    onClose={onCancel}
    PaperProps={{
        sx: {
            bgcolor: "rgba(10, 37, 77, 0.98)",
                border: "1px solid rgba(147, 181, 218, 0.3)",
                borderRadius: 2,
        },
    }}
>
    <DialogTitle sx={{ color: "text.primary", fontWeight: 700 }}>
    Confirmer la désactivation
    </DialogTitle>
    <DialogContent>
    <span style={{ color: "var(--mui-palette-text-secondary)" }}>
    Désactiver le compte de{" "}
    <strong style={{ color: "var(--mui-palette-text-primary)" }}>
    {client.firstName} {client.lastName}
    </strong>
        ? Le client ne pourra plus se connecter.
    </span>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button onClick={onCancel} sx={{ textTransform: "none" }}>
    Annuler
    </Button>
    <Button
    variant="contained"
    color="warning"
    onClick={onConfirm}
    sx={{ textTransform: "none", fontWeight: 600 }}
>
    Désactiver
    </Button>
    </DialogActions>
    </Dialog>
);
}