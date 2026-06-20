import * as React from "react";
import {
    Box, Button, Checkbox, Dialog, DialogContent, DialogTitle,
    Divider, FormControl, FormControlLabel, IconButton, InputLabel,
    MenuItem, Select, Stack, TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import type { AppVersion, NoteType, Platform, VersionStatus } from "../../Data/AppVersion";

const dialogPaperSx = {
    bgcolor: "rgba(8,18,40,0.97)",
    border: "1px solid rgba(148,163,184,0.25)",
    boxShadow: "0 20px 50px rgba(2,6,23,0.6)",
    borderRadius: 3,
    backdropFilter: "blur(12px)",
    minWidth: { xs: "90vw", sm: 560 },
};

const fieldSx = {
    "& .MuiInputBase-root": { color: "#e2e8f0", bgcolor: "rgba(255,255,255,0.04)" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(148,163,184,0.3)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" },
    "& .MuiInputLabel-root": { color: "rgba(226,232,240,0.7)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#93c5fd" },
    "& .MuiSelect-icon": { color: "rgba(226,232,240,0.6)" },
};

const menuPaperSx = {
    bgcolor: "rgba(8,18,40,0.97)",
    border: "1px solid rgba(148,163,184,0.25)",
    "& .MuiMenuItem-root": { color: "#e2e8f0" },
    "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.08)" },
    "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(96,165,250,0.2)" },
};

type Props = {
    open: boolean;
    version: AppVersion | null;
    onClose: () => void;
    onSave: (v: AppVersion) => void;
};

type NoteRow = { type: NoteType; text: string };

function emptyForm(): Omit<AppVersion, 'id'> & { notes: NoteRow[] } {
    return {
        version: '', build: 0, platform: 'android', status: 'upcoming',
        releaseDate: '', minSupported: '',
        updatedAt: new Date().toISOString().slice(0, 10),
        forcedUpdate: false,
        notes: [{ type: 'new', text: '' }],
    };
}

export default function NewVersionDialog({ open, version, onClose, onSave }: Props) {
    const [form, setForm] = React.useState(emptyForm());

    React.useEffect(() => {
        if (version) setForm({ ...version });
        else setForm(emptyForm());
    }, [version, open]);

    const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    const updateNote = (i: number, key: keyof NoteRow, val: string) => {
        const notes = [...form.notes];
        notes[i] = { ...notes[i], [key]: val };
        set('notes', notes);
    };

    const addNote = () => set('notes', [...form.notes, { type: 'new' as NoteType, text: '' }]);
    const removeNote = (i: number) => set('notes', form.notes.filter((_, idx) => idx !== i));

    const handleSave = () => {
        if (!form.version || !form.releaseDate || !form.minSupported) return;
        onSave({ ...form, id: version?.id ?? Date.now().toString(), notes: form.notes.filter((n) => n.text.trim()) });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: dialogPaperSx } }}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#f8fafc" }}>
                    {version ? "Modifier la version" : "Nouvelle version"}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "rgba(148,163,184,0.15)" }} />

            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <FormControl fullWidth size="small" sx={fieldSx}>
                            <InputLabel>Plateforme</InputLabel>
                            <Select value={form.platform} label="Plateforme"
                                    onChange={(e) => set('platform', e.target.value as Platform)}
                                    MenuProps={{ slotProps: { paper: { sx: menuPaperSx } } }}>
                                <MenuItem value="android">Android</MenuItem>
                                <MenuItem value="ios">iOS</MenuItem>
                                <MenuItem value="web">Web</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" sx={fieldSx}>
                            <InputLabel>Statut</InputLabel>
                            <Select value={form.status} label="Statut"
                                    onChange={(e) => set('status', e.target.value as VersionStatus)}
                                    MenuProps={{ slotProps: { paper: { sx: menuPaperSx } } }}>
                                <MenuItem value="upcoming">À venir</MenuItem>
                                <MenuItem value="beta">Bêta en cours</MenuItem>
                                <MenuItem value="live">Live</MenuItem>
                                <MenuItem value="deprecated">Obsolète</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Numéro de version" placeholder="ex: 1.4.0" value={form.version}
                                   onChange={(e) => set('version', e.target.value)} size="small" fullWidth sx={fieldSx} />
                        <TextField label="Build #" type="number" value={form.build || ''}
                                   onChange={(e) => set('build', parseInt(e.target.value) || 0)} size="small" fullWidth sx={fieldSx} />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Date de sortie" type="date" value={form.releaseDate}
                                   onChange={(e) => set('releaseDate', e.target.value)} size="small" fullWidth
                                   slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
                        <TextField label="Version min. supportée" placeholder="ex: 1.2.0" value={form.minSupported}
                                   onChange={(e) => set('minSupported', e.target.value)} size="small" fullWidth sx={fieldSx} />
                    </Box>

                    <FormControlLabel
                        control={<Checkbox checked={form.forcedUpdate} onChange={(e) => set('forcedUpdate', e.target.checked)}
                                           sx={{ color: "rgba(255,255,255,0.5)", "&.Mui-checked": { color: "#fbbf24" } }} />}
                        label={<Typography variant="body2" sx={{ color: "#e2e8f0" }}>Mise à jour forcée</Typography>}
                    />

                    <Divider sx={{ borderColor: "rgba(148,163,184,0.15)" }} />

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 1.5 }}>Notes de version</Typography>
                        <Stack spacing={1.2}>
                            {form.notes.map((note, i) => (
                                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    <FormControl size="small" sx={{ ...fieldSx, minWidth: 140 }}>
                                        <Select value={note.type} onChange={(e) => updateNote(i, 'type', e.target.value)}
                                                MenuProps={{ slotProps: { paper: { sx: menuPaperSx } } }}>
                                            <MenuItem value="new">Nouveauté</MenuItem>
                                            <MenuItem value="improvement">Amélioration</MenuItem>
                                            <MenuItem value="fix">Correction</MenuItem>
                                            <MenuItem value="security">Sécurité</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField value={note.text} onChange={(e) => updateNote(i, 'text', e.target.value)}
                                               placeholder="Description..." size="small" fullWidth sx={fieldSx} />
                                    <IconButton size="small" onClick={() => removeNote(i)} disabled={form.notes.length === 1}
                                                sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                        <Button startIcon={<AddIcon />} onClick={addNote} size="small"
                                sx={{ mt: 1.2, textTransform: "none", color: "#60a5fa" }}>
                            Ajouter une note
                        </Button>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(148,163,184,0.15)" }} />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                        <Button onClick={onClose} variant="outlined"
                                sx={{ textTransform: "none", borderColor: "rgba(148,163,184,0.3)", color: "#94a3b8" }}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} variant="contained"
                                sx={{ textTransform: "none", fontWeight: 700, background: "linear-gradient(90deg, #2563eb 0%, #f97316 100%)", "&:hover": { background: "linear-gradient(90deg, #1d4ed8 0%, #ea580c 100%)" } }}>
                            {version ? "Enregistrer" : "Créer"}
                        </Button>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
