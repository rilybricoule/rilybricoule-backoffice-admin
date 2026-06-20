import {
    AppBar, Avatar, Badge, Box, Button, Divider,
    IconButton, ListItemIcon, ListItemText, Menu,
    MenuItem, Toolbar, Typography,
} from "@mui/material";
import MenuRoundedIcon              from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon            from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon     from "@mui/icons-material/PersonOutlineRounded";
import SettingsRoundedIcon          from "@mui/icons-material/SettingsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DoneAllIcon                  from "@mui/icons-material/DoneAll";
import NotificationsIcon            from "@mui/icons-material/Notifications";
import NotificationsNoneIcon        from "@mui/icons-material/NotificationsNone";
import BgWorkshop from "../assets/openart.png";
import RilyLogo   from "../assets/rily-logo.png";
import { useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import { useMessages }       from "../pages/context/MessagesContext";
import { useNotifications }  from "../pages/context/NotificationsContext";
import { useNavigate }       from "react-router-dom";
import type { NotificationType, NotificationChannel } from "../Data/Notification";
import { getCurrentAdminUser } from "../api/auth";

// ── Avatar color ──────────────────────────────────────────────────────────────

function avatarColor(letter: string) {
    const palette = [
        "rgba(47,124,201,0.9)", "rgba(99,102,241,0.9)",
        "rgba(16,185,129,0.9)", "rgba(245,158,11,0.9)",
        "rgba(239,68,68,0.9)",  "rgba(236,72,153,0.9)",
    ];
    return palette[letter.charCodeAt(0) % palette.length];
}

// ── Type / channel chip configs ───────────────────────────────────────────────

const typeConfig: Record<NotificationType, { label: string; color: string; bg: string }> = {
    booking: { label: "Réservation", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
    payment: { label: "Paiement",    color: "#6fcf97", bg: "rgba(111,207,151,0.12)" },
    chat:    { label: "Message",     color: "#67e8f9", bg: "rgba(103,232,249,0.12)" },
    review:  { label: "Avis",        color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
    dispute: { label: "Litige",      color: "#f87171", bg: "rgba(248,113,113,0.12)" },
    account: { label: "Compte",      color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
    promo:   { label: "Promo",       color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
    system:  { label: "Système",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

const channelConfig: Record<NotificationChannel, { label: string; color: string; bg: string }> = {
    push:  { label: "Push",  color: "#6495f0", bg: "rgba(100,160,255,0.12)" },
    email: { label: "Email", color: "#6fcf97", bg: "rgba(100,200,100,0.12)" },
    sms:   { label: "SMS",   color: "#f2c94c", bg: "rgba(255,180,50,0.12)"  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

type NavbarProps = {
    onToggleSidebar: () => void;
    onLogout:        () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar({ onToggleSidebar, onLogout }: NavbarProps) {
    const { messages, markAllRead: markAllMsgRead, openDropdown, setOpenDropdown } = useMessages();
    const { received, unreadCount: notifUnreadCount, markAllRead: markAllNotifRead, markOneRead } = useNotifications();

    const [profileAnchor,    setProfileAnchor]    = useState<null | HTMLElement>(null);
    const [notifOpen,        setNotifOpen]         = useState(false);
    const profileMenuOpen = Boolean(profileAnchor);
    const msgUnreadCount  = messages.filter((m) => m.unread).length;

    const msgBtnRef   = useRef<HTMLButtonElement>(null);
    const notifBtnRef = useRef<HTMLButtonElement>(null);

    const navigate = useNavigate();
    const { openChat } = useMessages();
    const currentAdmin = getCurrentAdminUser();


    const displayName = [currentAdmin?.firstName, currentAdmin?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || currentAdmin?.email || "Admin";

    const primaryRole = currentAdmin?.roles?.[0] || "ROLE_ADMIN";
    const showTwoFAProfileItem = primaryRole === "ROLE_SUPER_ADMIN";
    const roleLabel = primaryRole
        .replace(/^ROLE_/, "")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const avatarLetter = displayName.charAt(0).toUpperCase() || "A";

    const handleOpenProfileMenu  = (e: MouseEvent<HTMLElement>) => setProfileAnchor(e.currentTarget);
    const handleCloseProfileMenu = () => setProfileAnchor(null);
    const handleToggleMessages   = () => { setOpenDropdown(!openDropdown); setNotifOpen(false); };
    const handleCloseMessages    = () => setOpenDropdown(false);
    const handleToggleNotif      = () => { setNotifOpen(!notifOpen); setOpenDropdown(false); };
    const handleCloseNotif       = () => setNotifOpen(false);

    const handleClickMessage = (msg: typeof messages[0]) => {
        openChat({
            id:           msg.id,
            providerName: msg.senderName,
            avatar:       msg.senderAvatar,
            providerId:   msg.providerId ?? msg.id,
            receiverId:   msg.receiverId ?? msg.providerId ?? msg.id,
        });
        handleCloseMessages();
    };

    const handleClickNotif = (id: string) => {
        markOneRead(id);
        handleCloseNotif();
        navigate(`/notifications?tab=received&focus=${encodeURIComponent(id)}`);
    };

    // Close messages dropdown when clicking outside
    useEffect(() => {
        if (!openDropdown) return;
        const handler = (e: globalThis.MouseEvent) => {
            const dropdown = document.getElementById("msg-dropdown");
            if (
                dropdown && !dropdown.contains(e.target as Node) &&
                msgBtnRef.current && !msgBtnRef.current.contains(e.target as Node)
            ) setOpenDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [openDropdown, setOpenDropdown]);

    // Close notifications dropdown when clicking outside
    useEffect(() => {
        if (!notifOpen) return;
        const handler = (e: globalThis.MouseEvent) => {
            const dropdown = document.getElementById("notif-dropdown");
            if (
                dropdown && !dropdown.contains(e.target as Node) &&
                notifBtnRef.current && !notifBtnRef.current.contains(e.target as Node)
            ) setNotifOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [notifOpen]);

    const iconBtnSx = {
        borderRadius: 2, p: 1,
        bgcolor: "rgba(255,255,255,0.06)",
        color: "text.secondary",
        boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.2)",
        "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "text.primary" },
    };

    const dropdownSx = {
        position: "absolute" as const,
        top: "calc(100% + 10px)",
        right: 0,
        width: 380,
        zIndex: 1400,
        bgcolor: "rgba(8,18,40,0.98)",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 2.5,
        boxShadow: "0 16px 40px rgba(2,6,23,0.6)",
        overflow: "hidden",
        animation: "fadeDown 0.18s ease-out",
        "@keyframes fadeDown": {
            from: { opacity: 0, transform: "translateY(-8px)" },
            to:   { opacity: 1, transform: "translateY(0)" },
        },
    };

    return (
        <AppBar
            position="fixed"
            color="inherit"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundImage: `linear-gradient(rgba(6,26,58,0.26), rgba(6,26,58,0.26)), url(${BgWorkshop})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backdropFilter: "blur(12px)",
            }}
        >
            <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 }, display: "flex", justifyContent: "space-between" }}>

                {/* ── Left ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton
                        onClick={onToggleSidebar}
                        sx={{
                            borderRadius: 2, p: 1,
                            bgcolor: "rgba(37,99,235,0.2)", color: "primary.light",
                            boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.3)",
                            "&:hover": { bgcolor: "rgba(37,99,235,0.3)", transform: "translateY(-1px)" },
                        }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{
                        fontWeight: 800, letterSpacing: 0.2,
                        background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        <Box component="img" src={RilyLogo} alt="RilyBricoule" sx={{
                            width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
                            border: "1px solid rgba(255,255,255,0.45)", verticalAlign: "middle", mr: 1,
                        }} />
                        RilyBricoule Admin Dashboard
                    </Typography>
                </Box>

                {/* ── Right pill ── */}
                <Box sx={{
                    display: "flex", alignItems: "center", gap: 1.1,
                    px: 1.1, py: 0.75, borderRadius: 999,
                    bgcolor: "rgba(2,6,23,0.28)",
                    border: "1px solid rgba(148,163,184,0.28)",
                    boxShadow: "0 10px 24px rgba(2,6,23,0.24), inset 0 0 0 1px rgba(255,255,255,0.04)",
                    position: "relative",
                }}>
                    {/* Messages icon */}
                    <IconButton ref={msgBtnRef} onClick={handleToggleMessages} sx={{
                        ...iconBtnSx,
                        ...(openDropdown ? { bgcolor: "rgba(47,124,201,0.2)", color: "primary.light" } : {}),
                    }}>
                        <Badge badgeContent={msgUnreadCount} color="error">
                            <ChatBubbleOutlineRoundedIcon />
                        </Badge>
                    </IconButton>

                    {/* Notifications bell */}
                    <IconButton ref={notifBtnRef} onClick={handleToggleNotif} sx={{
                        ...iconBtnSx,
                        ...(notifOpen ? { bgcolor: "rgba(47,124,201,0.2)", color: "primary.light" } : {}),
                    }}>
                        <Badge badgeContent={notifUnreadCount} color="error">
                            {notifOpen ? <NotificationsIcon /> : <NotificationsNoneIcon />}
                        </Badge>
                    </IconButton>

                    {/* Profile */}
                    <Button
                        onClick={handleOpenProfileMenu}
                        sx={{
                            minWidth: 0, px: 1.1, py: 0.5, borderRadius: 999,
                            textTransform: "none", color: "text.primary",
                            display: "flex", alignItems: "center", gap: 1,
                            "&:hover": { bgcolor: "rgba(255,255,255,0.09)" },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: avatarColor(avatarLetter),
                                fontSize: 14,
                                fontWeight: 700,
                            }}
                        >
                            {avatarLetter}
                        </Avatar>
                        <Box sx={{ lineHeight: 1.15, display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.05 }}>
                                {displayName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {roleLabel}
                            </Typography>
                        </Box>
                        <KeyboardArrowDownRoundedIcon sx={{ color: "text.secondary", fontSize: 18, ml: { xs: 0, sm: 0.2 } }} />
                    </Button>

                    {/* Logout */}
                    <Button
                        onClick={onLogout}
                        variant="outlined"
                        startIcon={<LogoutRoundedIcon />}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                        Logout
                    </Button>

                    {/* ── Messages dropdown ── */}
                    {openDropdown && (
                        <Box id="msg-dropdown" sx={dropdownSx}>
                            {/* Header */}
                            <Box sx={{
                                px: 2, py: 1.5,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                borderBottom: "1px solid rgba(147,181,218,0.12)",
                            }}>
                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.85rem" }}>
                                    Messages
                                    {msgUnreadCount > 0 && (
                                        <Box component="span" sx={{
                                            ml: 1, px: 0.75, py: 0.15,
                                            bgcolor: "error.main", color: "white",
                                            borderRadius: "20px", fontSize: "0.65rem", fontWeight: 700,
                                        }}>
                                            {msgUnreadCount}
                                        </Box>
                                    )}
                                </Typography>
                                {msgUnreadCount > 0 && (
                                    <Box
                                        onClick={() => { markAllMsgRead(); handleCloseMessages(); }}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 0.5,
                                            cursor: "pointer", color: "primary.light",
                                            fontSize: "0.72rem", fontWeight: 600,
                                            "&:hover": { color: "primary.main" },
                                        }}
                                    >
                                        <DoneAllIcon sx={{ fontSize: 14 }} />
                                        Tout lire
                                    </Box>
                                )}
                            </Box>

                            {/* Message list */}
                            {messages.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: "center" }}>
                                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
                                    <Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>Aucun message</Typography>
                                </Box>
                            ) : messages.map((msg, i) => (
                                <Box key={msg.id}>
                                    <Box
                                        onClick={() => handleClickMessage(msg)}
                                        sx={{
                                            display: "flex", alignItems: "flex-start", gap: 1.5,
                                            px: 2, py: 1.5, cursor: "pointer",
                                            bgcolor: msg.unread ? "rgba(47,124,201,0.08)" : "transparent",
                                            "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                                            <Avatar sx={{
                                                width: 38, height: 38, fontSize: "0.85rem", fontWeight: 700,
                                                bgcolor: avatarColor(msg.senderAvatar),
                                            }}>
                                                {msg.senderAvatar}
                                            </Avatar>
                                            {msg.unread && (
                                                <Box sx={{
                                                    position: "absolute", bottom: 0, right: 0,
                                                    width: 10, height: 10, borderRadius: "50%",
                                                    bgcolor: "primary.main",
                                                    border: "2px solid rgba(8,18,40,0.98)",
                                                }} />
                                            )}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.3 }}>
                                                <Typography variant="body2" fontWeight={msg.unread ? 700 : 500} sx={{ fontSize: "0.82rem" }}>
                                                    {msg.senderName}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", flexShrink: 0, ml: 1 }}>
                                                    {msg.time}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{
                                                fontSize: "0.75rem",
                                                color: msg.unread ? "text.primary" : "text.secondary",
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}>
                                                {msg.preview}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {i < messages.length - 1 && (
                                        <Divider sx={{ borderColor: "rgba(147,181,218,0.06)", mx: 2 }} />
                                    )}
                                </Box>
                            ))}

                        </Box>
                    )}

                    {/* ── Notifications dropdown ── */}
                    {notifOpen && (
                        <Box id="notif-dropdown" sx={{ ...dropdownSx, right: 0 }}>
                            {/* Header */}
                            <Box sx={{
                                px: 2, py: 1.5,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                borderBottom: "1px solid rgba(147,181,218,0.12)",
                            }}>
                                <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.85rem" }}>
                                    Notifications
                                    {notifUnreadCount > 0 && (
                                        <Box component="span" sx={{
                                            ml: 1, px: 0.75, py: 0.15,
                                            bgcolor: "error.main", color: "white",
                                            borderRadius: "20px", fontSize: "0.65rem", fontWeight: 700,
                                        }}>
                                            {notifUnreadCount}
                                        </Box>
                                    )}
                                </Typography>
                                {notifUnreadCount > 0 && (
                                    <Box
                                        onClick={() => markAllNotifRead()}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 0.5,
                                            cursor: "pointer", color: "primary.light",
                                            fontSize: "0.72rem", fontWeight: 600,
                                            "&:hover": { color: "primary.main" },
                                        }}
                                    >
                                        <DoneAllIcon sx={{ fontSize: 14 }} />
                                        Tout lire
                                    </Box>
                                )}
                            </Box>

                            {/* Notification list */}
                            {received.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: "center" }}>
                                    <NotificationsNoneIcon sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
                                    <Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>Aucune notification</Typography>
                                </Box>
                            ) : received.slice(0, 5).map((notif, i) => {
                                const tc = typeConfig[notif.type];
                                const cc = channelConfig[notif.channel];
                                return (
                                    <Box key={notif.id}>
                                        <Box
                                            onClick={() => handleClickNotif(notif.id)}
                                            sx={{
                                                display: "flex", alignItems: "flex-start", gap: 1.5,
                                                px: 2, py: 1.4, cursor: "pointer",
                                                bgcolor: !notif.read ? "rgba(47,124,201,0.08)" : "transparent",
                                                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                                                transition: "background 0.15s",
                                            }}
                                        >
                                            {/* Unread dot */}
                                            <Box sx={{ pt: 0.6, flexShrink: 0 }}>
                                                <Box sx={{
                                                    width: 8, height: 8, borderRadius: "50%",
                                                    bgcolor: !notif.read ? "primary.main" : "transparent",
                                                    border: !notif.read ? "none" : "1.5px solid rgba(148,163,184,0.3)",
                                                }} />
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.3 }}>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={!notif.read ? 700 : 500}
                                                        sx={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}
                                                    >
                                                        {notif.title}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", flexShrink: 0, ml: 1 }}>
                                                        {notif.sentAt}
                                                    </Typography>
                                                </Box>

                                                <Typography sx={{
                                                    fontSize: "0.74rem",
                                                    color: !notif.read ? "text.primary" : "text.secondary",
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                    mb: 0.6,
                                                }}>
                                                    {notif.message}
                                                </Typography>

                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                                    <Box sx={{
                                                        px: 0.7, py: 0.1, borderRadius: 1,
                                                        bgcolor: tc.bg,
                                                        color: tc.color,
                                                        fontSize: "0.62rem", fontWeight: 700,
                                                        border: `1px solid ${tc.color}44`,
                                                    }}>
                                                        {tc.label}
                                                    </Box>
                                                    <Box sx={{
                                                        px: 0.7, py: 0.1, borderRadius: 1,
                                                        bgcolor: cc.bg,
                                                        color: cc.color,
                                                        fontSize: "0.62rem", fontWeight: 700,
                                                        border: `1px solid ${cc.color}44`,
                                                    }}>
                                                        {cc.label}
                                                    </Box>
                                                    <Typography sx={{ fontSize: "0.62rem", color: "text.secondary", ml: "auto" }}>
                                                        {notif.triggeredBy}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        {i < Math.min(received.length, 5) - 1 && (
                                            <Divider sx={{ borderColor: "rgba(147,181,218,0.06)", mx: 2 }} />
                                        )}
                                    </Box>
                                );
                            })}

                            {/* Footer */}
                            <Box sx={{ borderTop: "1px solid rgba(147,181,218,0.12)" }}>
                                <Box
                                    onClick={() => { navigate("/notifications?tab=received"); handleCloseNotif(); }}
                                    sx={{
                                        px: 2, py: 1.25, textAlign: "center", cursor: "pointer",
                                        color: "primary.light", fontSize: "0.78rem", fontWeight: 600,
                                        "&:hover": { bgcolor: "rgba(47,124,201,0.08)" },
                                        transition: "background 0.15s",
                                    }}
                                >
                                    Voir toutes les notifications →
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Toolbar>

            {/* ── Profile dropdown ── */}
            <Menu
                anchorEl={profileAnchor}
                open={profileMenuOpen}
                onClose={handleCloseProfileMenu}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1, minWidth: 210, borderRadius: 2.5,
                            bgcolor: "rgba(8,18,40,0.96)",
                            border: "1px solid rgba(148,163,184,0.28)",
                            boxShadow: "0 16px 35px rgba(2,6,23,0.5)",
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        handleCloseProfileMenu();
                        navigate("/profile");
                    }}
                >
                    <ListItemIcon><PersonOutlineRoundedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                </MenuItem>
                {showTwoFAProfileItem && (
                    <MenuItem
                        onClick={() => {
                            handleCloseProfileMenu();
                            navigate("/settings/2fa");
                        }}
                    >
                        <ListItemIcon><SettingsRoundedIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Sécurité 2FA</ListItemText>
                    </MenuItem>
                )}

                <MenuItem
                    onClick={() => {
                        handleCloseProfileMenu();
                        navigate("/change-password-required", {
                            state: { email: currentAdmin?.email ?? "" },
                        });
                    }}
                >
                    <ListItemIcon><SettingsRoundedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Changer mot de passe</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseProfileMenu(); onLogout(); }}>
                    <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </Menu>
        </AppBar>
    );
}
