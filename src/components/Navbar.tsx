import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    IconButton,
    Toolbar,
    Typography
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import BgWorkshop from "../assets/openart.png";
import RilyLogo from "../assets/rily-logo.png";
import { useState } from "react";
import type { MouseEvent } from "react";

type NavbarProps = {
    onToggleSidebar: () => void;
    onLogout: () => void;
};

export default function Navbar({ onToggleSidebar, onLogout }: NavbarProps) {
    const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
    const profileMenuOpen = Boolean(profileAnchor);

    const handleOpenProfileMenu = (event: MouseEvent<HTMLElement>) => {
        setProfileAnchor(event.currentTarget);
    };

    const handleCloseProfileMenu = () => {
        setProfileAnchor(null);
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
                backdropFilter: "blur(12px)"
            }}
        >
            <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 }, display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton
                        onClick={onToggleSidebar}
                        sx={{
                            borderRadius: 2,
                            p: 1,
                            bgcolor: "rgba(37, 99, 235, 0.2)",
                            color: "primary.light",
                            boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.3)",
                            "&:hover": { bgcolor: "rgba(37, 99, 235, 0.3)", transform: "translateY(-1px)" }
                        }}
                    >
                        <MenuRoundedIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            letterSpacing: 0.2,
                            background: "linear-gradient(90deg, #f8fafc 0%, #93c5fd 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}
                    >
                        <Box
                            component="img"
                            src={RilyLogo}
                            alt="RilyBricoule"
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid rgba(255,255,255,0.45)",
                                verticalAlign: "middle",
                                mr: 1
                            }}
                        />
                        RilyBricoule Admin Dashboard
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.1,
                        px: 1.1,
                        py: 0.75,
                        borderRadius: 999,
                        bgcolor: "rgba(2,6,23,0.28)",
                        border: "1px solid rgba(148,163,184,0.28)",
                        boxShadow: "0 10px 24px rgba(2,6,23,0.24), inset 0 0 0 1px rgba(255,255,255,0.04)"
                    }}
                >
                    <IconButton
                        sx={{
                            borderRadius: 2,
                            p: 1,
                            bgcolor: "rgba(255,255,255,0.06)",
                            color: "text.secondary",
                            boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.2)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)", color: "text.primary" }
                        }}
                    >
                        <Badge badgeContent={3} color="error">
                            <NotificationsNoneRoundedIcon />
                        </Badge>
                    </IconButton>

                    <Button
                        onClick={handleOpenProfileMenu}
                        sx={{
                            minWidth: 0,
                            px: 1.1,
                            py: 0.5,
                            borderRadius: 999,
                            textTransform: "none",
                            color: "text.primary",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.09)"
                            }
                        }}
                    >
                        <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>A</Avatar>
                        <Box sx={{ lineHeight: 1.15, display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.05 }}>
                                Admin
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Super Admin
                            </Typography>
                        </Box>
                        <KeyboardArrowDownRoundedIcon sx={{ color: "text.secondary", fontSize: 18, ml: { xs: 0, sm: 0.2 } }} />
                    </Button>

                    <Button
                        onClick={onLogout}
                        variant="outlined"
                        startIcon={<LogoutRoundedIcon />}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                        Logout
                    </Button>
                </Box>

                <Menu
                    anchorEl={profileAnchor}
                    open={profileMenuOpen}
                    onClose={handleCloseProfileMenu}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                minWidth: 210,
                                borderRadius: 2.5,
                                bgcolor: "rgba(8,18,40,0.96)",
                                border: "1px solid rgba(148,163,184,0.28)",
                                boxShadow: "0 16px 35px rgba(2,6,23,0.5)"
                            }
                        }
                    }}
                >
                    <MenuItem onClick={handleCloseProfileMenu}>
                        <ListItemIcon>
                            <PersonOutlineRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>My Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleCloseProfileMenu}>
                        <ListItemIcon>
                            <SettingsRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            handleCloseProfileMenu();
                            onLogout();
                        }}
                    >
                        <ListItemIcon>
                            <LogoutRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}