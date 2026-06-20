import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import type { Client } from "../../Data/Client";

type ClientFormModalProps = {
    open: boolean;
    client: Client | null;
    onClose: () => void;
    onSave: (client: Client) => void | Promise<void>;
};

export default function ClientFormModal({ open, client, onClose, onSave }: ClientFormModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [ville, setVille] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (client) {
            setFirstName(client.firstName);
            setLastName(client.lastName);
            setEmail(client.email);
            setPhone(client.phone || "");
            setVille(client.ville || "");
        } else {
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setVille("");
        }
    }, [client, open]);

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || saving) return;

        try {
            setSaving(true);

            await onSave({
                id: client?.id ?? crypto.randomUUID(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                ville: ville.trim() || undefined,
                createdAt: client?.createdAt ?? new Date().toISOString().slice(0, 10),
                isActive: client?.isActive ?? true,
            });

            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "rgba(10, 37, 77, 0.98)",
                    border: "1px solid rgba(147, 181, 218, 0.3)",
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle sx={{ color: "text.primary", fontWeight: 700 }}>
                {client ? "Modifier le client" : "Créer un client"}
            </DialogTitle>

            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Prénom"
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)" } }}
                />

                <TextField
                    margin="dense"
                    label="Nom"
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)" } }}
                />

                <TextField
                    margin="dense"
                    label="Email"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)" } }}
                />

                <TextField
                    margin="dense"
                    label="Téléphone"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)" } }}
                />

                <TextField
                    margin="dense"
                    label="Ville"
                    fullWidth
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "rgba(0,0,0,0.2)" } }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: "none" }}>
                    Annuler
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
