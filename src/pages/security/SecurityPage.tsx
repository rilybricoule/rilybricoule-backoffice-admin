import {useState, useMemo,useEffect} from "react";
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Divider, FormControl, IconButton,
    InputAdornment, InputLabel, MenuItem, Paper, Select, Switch,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tab, Tabs, TextField, Toolbar, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ShieldIcon from "@mui/icons-material/Shield";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import OpenArtBg from "../../assets/openart.png";
import {useNavigate} from "react-router-dom";
import {navigateTo} from "../../utiles/Navigation";
import {useSecurity, type AdminAccount, type AdminRole} from "../context/SecurityContext";
import AuditLog from "./Auditlog"; // ← import the improved component
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { sendAdminPasswordResetEmail, forceAdminLogout } from "../../api/adminAccounts";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { getCurrentAdminUser } from "../../api/auth";
import { openAdminChat } from "../../api/chats";
import { useMessages } from "../context/MessagesContext";



// ── Config ────────────────────────────────────────────────────────────────────
function calculateRisk(admin: AdminAccount) {
    const lastLoginDays = null;

    if (!admin.enabled) {
        return {
            label: "Info",
            color: "default" as const,
            reason: "Compte désactivé par un Super Admin.",
        };
    }

    if (admin.role === "super_admin" && !admin.twoFAEnabled) {
        return {
            label: "High",
            color: "error" as const,
            reason: "Super Admin sans authentification à deux facteurs (2FA).",
        };
    }

    if (!admin.twoFAEnabled) {
        return {
            label: "Medium",
            color: "warning" as const,
            reason: "2FA désactivé sur ce compte.",
        };
    }

    if (lastLoginDays !== null && lastLoginDays > 60) {
        return {
            label: "High",
            color: "error" as const,
            reason: `Dernière connexion ancienne (${lastLoginDays} jours).`,
        };
    }

    return {
        label: "Low",
        color: "success" as const,
        reason: "2FA activé et activité récente.",
    };
}


const roleConfig: Record<AdminRole, { label: string; color: "error" | "warning" | "info"; permissions: string[] }> = {
    super_admin: {
        label: "Super Admin",
        color: "error",
        permissions: [
            "Accès complet à tous les modules",
            "Gestion des comptes admins",
            "Modification des paramètres globaux",
            "Journal d'audit complet",
            "Suppression de données",
        ]
    },
    moderateur: {
        label: "Modérateur",
        color: "warning",
        permissions: [
            "Gestion des prestataires (approuver/rejeter/suspendre)",
            "Modération des offres (masquer/approuver)",
            "Gestion des tickets support & litiges",
            "Consultation des réservations",
            "Pas d'accès aux paiements ni paramètres",
        ]
    },
    support: {
        label: "Support",
        color: "info",
        permissions: [
            "Consultation et réponse aux tickets support",
            "Consultation des réservations (lecture seule)",
            "Consultation des profils clients & prestataires",
            "Aucun accès aux paiements, paramètres ou sécurité",
        ]
    },
};

const dialogPaperSx = {
    bgcolor: "rgba(10,37,77,0.98)",
    border: "1px solid rgba(147,181,218,0.2)",
    minWidth: 440,
};

type FormState = {
    nom: string;
    email: string;
    role: AdminRole;
    motDePasse: string;
};

const emptyForm: FormState = {
    nom: "", email: "", role: "support", motDePasse: "",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SecurityPage() {
    const {admins, loading, addAdmin, updateAdmin, deleteAdmin, toggleStatus, toggle2FA, refreshAdmins} = useSecurity();


    const navigate = useNavigate();
    const { openChat, refreshMessages } = useMessages();
    const currentAdmin = getCurrentAdminUser();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("security");

    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [roleFilter, setRoleFilter] = useState<AdminRole | "all">("all");
    const [twoFAFilter, setTwoFAFilter] = useState<"all" | "on" | "off">("all");
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
    const [auditAdminFilter, setAuditAdminFilter] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<null | "reset" | "logout">(null);
    const [snack, setSnack] = useState<{open: boolean; message: string; severity: "success" | "error"}>({
        open: false, message: "", severity: "success"
    });



    // 2) Dans SecurityPage(), juste après tes useState/useSecurity:
    useEffect(() => {
        const token =
            localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken");

        if (token && admins.length === 0) {
            refreshAdmins();
        }
    }, [admins.length, refreshAdmins]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const handleOpenCreate = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setFormOpen(true);
    };

    const handleOpenEdit = (admin: AdminAccount | null) => {
        if (!admin) return;
        setEditTarget(admin);
        setForm({
            nom: admin.nom,
            email: admin.email,
            role: admin.role,
            motDePasse: "",
        });
        setFormOpen(true);
    };
    const handleResetPassword = async () => {
        if (!selectedAdmin) return;

        const targetId = Number(selectedAdmin.id);
        const targetEmail = selectedAdmin.email;

        setMenuAnchor(null);

        try {
            setBusyAction("reset");

            // 1) reset password (sets mustChangePassword=true backend)
            await sendAdminPasswordResetEmail(targetId);

            // 2) force logout immediately (invalidate current sessions now)
            await forceAdminLogout(targetId);

            setSnack({
                open: true,
                message: `Reset envoyé pour ${targetEmail} (id=${targetId}) + déconnexion forcée.`,
                severity: "success",
            });
        } catch (e: any) {
            setSnack({
                open: true,
                message: e?.response?.data?.message || "Échec de la réinitialisation.",
                severity: "error",
            });
        } finally {
            setBusyAction(null);
        }
    };


    const handleForceLogout = async () => {
        if (!selectedAdmin) return;
        setMenuAnchor(null);
        try {
            setBusyAction("logout");
            await forceAdminLogout(selectedAdmin.id);
            setSnack({ open: true, message: "Déconnexion forcée effectuée avec succès.", severity: "success" });

        } catch (e: any) {
            setSnack({ open: true, message: e?.response?.data?.message || "Échec de la déconnexion forcée.", severity: "error" });
        } finally {
            setBusyAction(null);
        }
    };


    const openMenu = (event: React.MouseEvent<HTMLElement>, admin: AdminAccount) => {
        setMenuAnchor(event.currentTarget);
        setSelectedAdmin(admin);
    };


    const handleMessageAdmin = async (
        event: React.MouseEvent<HTMLElement>,
        admin: AdminAccount
    ) => {
        event.stopPropagation();

        if (!currentAdmin?.id) {
            setSnack({
                open: true,
                message: "Admin courant introuvable. Reconnectez-vous.",
                severity: "error",
            });
            return;
        }

        if (Number(admin.id) === Number(currentAdmin.id)) {
            setSnack({
                open: true,
                message: "Vous ne pouvez pas ouvrir une discussion avec vous-même.",
                severity: "error",
            });
            return;
        }

        try {
            const chat = await openAdminChat({
                adminId: currentAdmin.id,
                participantId: Number(admin.id),
                type: "INTERNAL",
            });

            openChat({
                id: String(chat.chatId),
                providerName: chat.displayName || admin.nom || admin.email,
                avatar: chat.avatarLetter || admin.nom.charAt(0).toUpperCase() || "A",
                providerId: String(admin.id),
                receiverId: String(admin.id),
            });

            await refreshMessages();
        } catch (e: any) {
            setSnack({
                open: true,
                message: e?.response?.data?.message || "Impossible d'ouvrir la discussion.",
                severity: "error",
            });
        }
    };

    const handleSave = async () => {
        if (editTarget) {
            await updateAdmin(editTarget.id, {
                nom: form.nom,
                email: form.email,
                role: form.role,
            });
        } else {
            await addAdmin({
                nom: form.nom,
                email: form.email,
                role: form.role,
                enabled: true,
                twoFAEnabled: false,
                motDePasse: form.motDePasse,
            } as any);
        }

        setFormOpen(false);
        setForm(emptyForm);
    };

    const isValid = form.nom.trim() && form.email.trim() && (editTarget || form.motDePasse.trim());

    const filteredAdmins = useMemo(() => {
        let result = admins;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(a =>
                a.nom.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
            );
        }
        if (roleFilter !== "all") result = result.filter(a => a.role === roleFilter);
        if (twoFAFilter === "on") result = result.filter(a => a.twoFAEnabled);
        if (twoFAFilter === "off") result = result.filter(a => !a.twoFAEnabled);
        return result;
    }, [admins, search, roleFilter, twoFAFilter]);

    const tableSx = {
        bgcolor: "rgba(10,37,77,0.6)", border: "1px solid rgba(147,181,218,0.2)", borderRadius: 2,
        "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 600, color: "text.secondary",
            borderBottom: "1px solid rgba(147,181,218,0.25)"
        },
        "& .MuiTableBody-root .MuiTableRow-root:hover": {bgcolor: "rgba(255,255,255,0.04)"},
        "& .MuiTableCell-root": {borderBottom: "1px solid rgba(147,181,218,0.12)", color: "text.primary"},
    };

    return (
        <Box sx={{display: "flex"}}>
            <Navbar onToggleSidebar={() => setSidebarOpen(v => !v)} onLogout={handleLogout}/>
            <Sidebar open={sidebarOpen} selected={selected} onSelect={(id) => {
                setSelected(id);
                navigateTo(id, navigate);
            }}/>

            <Box component="main" sx={{
                flexGrow: 1, p: 3, minHeight: "100vh",
                backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                backgroundSize: "cover", backgroundPosition: "center",
            }}>
                <Toolbar/>

                {/* Header */}
                <Box sx={{mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{mb: 0.5}}>
                            Sécurité & Administration
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestion des comptes admins, rôles et journal d'audit
                        </Typography>
                    </Box>
                    {activeTab === 0 && (
                        <Button variant="contained" startIcon={<AddIcon/>} onClick={handleOpenCreate}>
                            Nouvel admin
                        </Button>
                    )}
                </Box>

                {/* Tabs container */}
                <Box sx={{
                    mb: 3,
                    bgcolor: "rgba(10,37,77,0.6)",
                    border: "1px solid rgba(147,181,218,0.2)",
                    borderRadius: 2,
                    overflow: "hidden",
                }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{
                        borderBottom: "1px solid rgba(147,181,218,0.2)",
                        "& .MuiTab-root": {color: "text.secondary"},
                        "& .Mui-selected": {color: "primary.light"},
                        "& .MuiTabs-indicator": {bgcolor: "primary.main"},
                    }}>
                        <Tab icon={<PeopleIcon sx={{fontSize: 18}}/>} iconPosition="start" label="Comptes admins"/>
                        <Tab icon={<ShieldIcon sx={{fontSize: 18}}/>} iconPosition="start" label="Rôles & permissions"/>
                        <Tab icon={<HistoryIcon sx={{fontSize: 18}}/>} iconPosition="start" label="Journal d'audit"/>
                    </Tabs>

                    {/* ── Tab 0: Admins ── */}
                    {activeTab === 0 && (
                        <Box sx={{p: 2}}>
                            <TextField
                                placeholder="Rechercher un admin..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small" fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">
                                        <SearchIcon sx={{color: "text.secondary"}}/>
                                    </InputAdornment>
                                }}
                                sx={{
                                    mb: 2,
                                    "& .MuiOutlinedInput-root": {
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        "& fieldset": {borderColor: "rgba(147,181,218,0.2)"}
                                    }
                                }}
                            />
                            <Box sx={{display: "flex", gap: 1.5, mb: 2}}>
                                <FormControl size="small">
                                    <InputLabel>Rôle</InputLabel>
                                    <Select value={roleFilter} label="Rôle"
                                            onChange={e => setRoleFilter(e.target.value as any)}>
                                        <MenuItem value="all">Tous</MenuItem>
                                        <MenuItem value="super_admin">Super Admin</MenuItem>
                                        <MenuItem value="moderateur">Modérateur</MenuItem>
                                        <MenuItem value="support">Support</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl size="small">
                                    <InputLabel>2FA</InputLabel>
                                    <Select value={twoFAFilter} label="2FA"
                                            onChange={e => setTwoFAFilter(e.target.value as any)}>
                                        <MenuItem value="all">Tous</MenuItem>
                                        <MenuItem value="on">Activé</MenuItem>
                                        <MenuItem value="off">Désactivé</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <TableContainer component={Paper} sx={tableSx}>
                                <Table size="small">

                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Admin</TableCell>
                                            <TableCell>Rôle</TableCell>
                                            <TableCell align="center">Statut</TableCell>
                                            <TableCell align="center">2FA</TableCell>
                                            <TableCell align="center">Risque</TableCell>
                                            <TableCell>Créé</TableCell>
                                            <TableCell>Dernière connexion</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>

                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    Loading...
                                                </TableCell>
                                            </TableRow>

                                        ) : filteredAdmins.length === 0 ? (

                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    Aucun admin
                                                </TableCell>
                                            </TableRow>

                                        ) : (

                                            filteredAdmins.map(admin => {

                                                const rc = roleConfig[admin.role];
                                                const risk = calculateRisk(admin);

                                                return (

                                                    <TableRow
                                                        key={admin.id}
                                                        sx={{opacity: !admin.enabled ? 0.6 : 1}}
                                                    >

                                                        <TableCell>
                                                            <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                                                                <Avatar
                                                                    sx={{width: 32, height: 32, bgcolor: "primary.main", fontSize: 13}}
                                                                >
                                                                    {admin.nom[0]}
                                                                </Avatar>

                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {admin.nom}
                                                                    </Typography>

                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {admin.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Chip
                                                                label={rc.label}
                                                                size="small"
                                                                color={rc.color}
                                                                variant="outlined"
                                                            />
                                                        </TableCell>

                                                        <TableCell align="center">

                                                            <Tooltip title={admin.enabled ? "Désactiver" : "Activer"}>


                                                            <Switch
                                                                    size="small"
                                                                    checked={admin.enabled}
                                                                    onChange={(e)=> toggleStatus(admin.id, e.target.checked)}
                                                                    disabled={admin.role === "super_admin"}
                                                                />

                                                            </Tooltip>

                                                        </TableCell>


                                                        <TableCell align="center">

                                                            <Switch
                                                                size="small"
                                                                checked={admin.twoFAEnabled}
                                                                onChange={() => toggle2FA(admin.id)}
                                                            />


                                                        </TableCell>

                                                        <TableCell align="center">
                                                            <Tooltip
                                                                title={risk.reason}
                                                                arrow
                                                                slotProps={{
                                                                    tooltip: {
                                                                        sx: {
                                                                            bgcolor: "rgba(8, 24, 52, 0.98)",
                                                                            color: "#eaf4ff",
                                                                            fontSize: "0.78rem",
                                                                            fontWeight: 500,
                                                                            lineHeight: 1.45,
                                                                            px: 1.3,
                                                                            py: 0.9,
                                                                            borderRadius: 1.4,
                                                                            border: "1px solid rgba(147,181,218,0.35)",
                                                                            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                                                                            maxWidth: 260,
                                                                            backdropFilter: "blur(4px)",
                                                                            backgroundImage:
                                                                                "linear-gradient(135deg, rgba(10,37,77,0.96), rgba(15,23,42,0.96))",
                                                                        },
                                                                    },
                                                                    arrow: {
                                                                        sx: {
                                                                            color: "rgba(8, 24, 52, 0.98)",
                                                                            "&::before": {
                                                                                border: "1px solid rgba(147,181,218,0.35)",
                                                                            },
                                                                        },
                                                                    },
                                                                }}
                                                            >
                                                                <Chip
                                                                    label={risk.label}
                                                                    color={risk.color as any}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        minWidth: 68,
                                                                        cursor: "help",
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </TableCell>



                                                        <TableCell>

                                                            {admin.createdAt}

                                                        </TableCell>

                                                        <TableCell>

                                                            {admin.lastActivity}

                                                        </TableCell>

                                                        <TableCell align="right">
                                                            {Number(admin.id) !== Number(currentAdmin?.id) && (
                                                                <Tooltip title="Envoyer un message">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => handleMessageAdmin(e, admin)}
                                                                        sx={{ color: "primary.light" }}
                                                                    >
                                                                        <ChatBubbleOutlineIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => openMenu(e, admin)}
                                                            >
                                                                <MoreVertIcon/>
                                                            </IconButton>
                                                        </TableCell>

                                                    </TableRow>

                                                );

                                            })

                                        )}

                                    </TableBody>

                                </Table>

                                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)}
                                      onClose={() => setMenuAnchor(null)}>
                                    <MenuItem onClick={() => { handleOpenEdit(selectedAdmin); setMenuAnchor(null); }}>
                                        Modifier
                                    </MenuItem>
                                    <MenuItem onClick={handleResetPassword} disabled={busyAction !== null}>
                                        Réinitialiser le mot de passe
                                    </MenuItem>
                                    <MenuItem onClick={handleForceLogout} disabled={busyAction !== null}>
                                        Forcer la déconnexion
                                    </MenuItem>
                                    <MenuItem onClick={() => {
                                        setAuditAdminFilter(selectedAdmin?.id ?? null);
                                        // ↑ On stocke l'ID de l'admin sélectionné
                                        setActiveTab(2);
                                        // ↑ On bascule vers l'onglet "Journal d'audit" (index 2)
                                        setMenuAnchor(null);
                                        // ↑ On ferme le menu dropdown
                                    }}>
                                        Voir l'activité
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            if(selectedAdmin){
                                                setDeleteTarget(selectedAdmin);
                                            }
                                            setMenuAnchor(null);
                                        }}
                                        sx={{color:"error.main"}}
                                    >
                                        Supprimer
                                    </MenuItem>
                                </Menu>
                            </TableContainer>
                        </Box>
                    )}

                    {/* ── Tab 1: Roles ── */}
                    {activeTab === 1 && (
                        <Box sx={{p: 2}}>
                            <Box sx={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2}}>
                                {(Object.entries(roleConfig) as [AdminRole, typeof roleConfig[AdminRole]][]).map(([role, config]) => (
                                    <Box key={role} sx={{
                                        p: 2.5,
                                        bgcolor: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(147,181,218,0.15)",
                                        borderRadius: 2,
                                    }}>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}>
                                            <ShieldIcon sx={{color: `${config.color}.main`, fontSize: 20}}/>
                                            <Typography variant="subtitle2" fontWeight={700}>{config.label}</Typography>
                                            <Chip label={`${admins.filter(a => a.role === role).length} admin(s)`}
                                                  size="small" sx={{ml: "auto", fontSize: "0.65rem", height: 18}}/>
                                        </Box>
                                        <Divider sx={{borderColor: "rgba(147,181,218,0.12)", mb: 1.5}}/>
                                        <Box sx={{display: "flex", flexDirection: "column", gap: 0.75}}>
                                            {config.permissions.map((p, i) => (
                                                <Box key={i} sx={{display: "flex", alignItems: "flex-start", gap: 0.75}}>
                                                    <Typography sx={{color: "success.main", fontSize: 14, mt: "1px"}}>✓</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{lineHeight: 1.5}}>{p}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ── Tab 2: Audit Log — replaced with AuditLog component ── */}
                    {activeTab === 2 && (
                        <Box sx={{p: 2}}>
                            <AuditLog
                                adminFilter={auditAdminFilter}
                                onClearFilter={() => setAuditAdminFilter(null)}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── Create/Edit Dialog ── */}
            <Dialog open={formOpen} onClose={() => setFormOpen(false)} PaperProps={{sx: dialogPaperSx}}>
                <DialogTitle>{editTarget ? "Modifier l'admin" : "Nouvel admin"}</DialogTitle>
                <DialogContent>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 2, mt: 1}}>
                        <TextField label="Nom complet" size="small" fullWidth value={form.nom}
                                   onChange={e => setForm(f => ({...f, nom: e.target.value}))}/>
                        <TextField label="Email" size="small" fullWidth value={form.email}
                                   onChange={e => setForm(f => ({...f, email: e.target.value}))}/>
                        {!editTarget && (
                            <TextField label="Mot de passe" size="small" fullWidth type="password"
                                       value={form.motDePasse}
                                       onChange={e => setForm(f => ({...f, motDePasse: e.target.value}))}/>
                        )}
                        <FormControl size="small" fullWidth>
                            <InputLabel>Rôle</InputLabel>
                            <Select value={form.role} label="Rôle"
                                    onChange={e => setForm(f => ({...f, role: e.target.value as AdminRole}))}>
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                                <MenuItem value="moderateur">Modérateur</MenuItem>
                                <MenuItem value="support">Support</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            p: 1.5, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1.5,
                            border: "1px solid rgba(147,181,218,0.15)",
                        }}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <SecurityIcon sx={{fontSize: 18, color: "primary.light"}}/>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>Authentification 2FA</Typography>
                                    <Typography variant="caption" color="text.secondary">Vérification en deux étapes</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2}}>
                    <Button onClick={() => setFormOpen(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!isValid}>
                        {editTarget ? "Enregistrer" : "Créer"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{sx: dialogPaperSx}}>
                <DialogTitle>Supprimer l'admin ?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.nom}</strong> ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2}}>
                    <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={async () => {
                            if(deleteTarget){
                                await deleteAdmin(deleteTarget.id);
                                setDeleteTarget(null);
                            }
                        }}
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
            open={snack.open}
            autoHideDuration={3200}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                severity={snack.severity}
                variant="filled"
                sx={{
                    minWidth: 320,
                    borderRadius: 2,
                    border: "1px solid rgba(147,181,218,0.35)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    fontWeight: 600,
                    color: "#eaf4ff",
                    background:
                        snack.severity === "success"
                            ? "linear-gradient(90deg, rgba(16,185,129,0.95), rgba(14,116,144,0.95))"
                            : "linear-gradient(90deg, rgba(239,68,68,0.95), rgba(249,115,22,0.95))",
                    "& .MuiAlert-icon": { color: "#fff" },
                    "& .MuiAlert-action svg": { color: "rgba(255,255,255,0.9)" },
                }}
            >
                {snack.message}
            </Alert>
        </Snackbar>


        </Box>
    );
}
