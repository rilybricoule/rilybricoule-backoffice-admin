import {
    Box,
    Collapse,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import {
    CategoryIllustratedIcon,
    OffersIllustratedIcon,
} from "./icons/IllustratedIcons";
import { useState } from "react";
import BgWorkshop from "../assets/openart.png";
import DashboardIconImg from "../assets/sidebar-icons/dashboard.svg";
import UsersIconImg from "../assets/sidebar-icons/users.svg";
import ServicesIconImg from "../assets/sidebar-icons/services.svg";
import ReservationsIconImg from "../assets/sidebar-icons/reservations.svg";
import PaymentsIconImg from "../assets/sidebar-icons/payments.svg";
import MarketingIconImg from "../assets/sidebar-icons/marketing.svg";
import ContentIconImg from "../assets/sidebar-icons/content.svg";
import SupportIconImg from "../assets/sidebar-icons/support.svg";
import SettingsIconImg from "../assets/sidebar-icons/settings.svg";

const drawerWidth = 240;
const miniDrawerWidth = 76;

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

type SidebarProps = {
    open: boolean;
    selected: string;
    onSelect: (id: string) => void;
};

export default function Sidebar({ open, selected, onSelect }: SidebarProps) {
    const [openUsers, setOpenUsers] = useState(true);
    const [openProviders, setOpenProviders] = useState(true);
    const [openServices, setOpenServices] = useState(false);

    const iconColors: Record<string, string> = {
        dashboard: "#2F7CC9",
        users: "#53A1E8",
        services: "#F08A2F",
        reservations: "#2A6FB6",
        payments: "#4E87C0",
        marketing: "#FFAA58",
        content: "#3E79B8",
        support: "#5CA8D1",
        settings: "#87A8C8",
        clients: "#53A1E8",
        providers: "#F08A2F",
        categories: "#F08A2F",
        offers: "#FFAA58",
    };

    const tooltipSlotProps = {
        tooltip: {
            sx: {
                bgcolor: "rgba(8, 18, 40, 0.95)",
                color: "#e2e8f0",
                border: "1px solid rgba(96,165,250,0.35)",
                boxShadow: "0 10px 30px rgba(2,6,23,0.45)",
                backdropFilter: "blur(8px)",
                fontWeight: 600,
                fontSize: "0.78rem",
                px: 1.2,
                py: 0.7,
                borderRadius: 2
            }
        }
    } as const;

    const rootRowSx = (active: boolean, colorKey: string) => {
        const c = iconColors[colorKey] ?? "#60a5fa";
        const rgba = hexToRgba(c, 0.2);
        return {
            borderRadius: 2.5,
            mb: 0.6,
            py: 0.95,
            px: open ? 1.2 : 0.8,
            justifyContent: open ? "flex-start" : "center",
            transition: "all 0.2s ease",
            position: "relative",
            "& .MuiListItemIcon-root": {
                minWidth: 34,
                transition: "all 0.2s ease"
            },
            "& .menu-icon-chip": {
                transition: "transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease",
                boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.18)"
            },
            "&.Mui-selected": {
                bgcolor: rgba,
                color: c,
                "& .MuiListItemIcon-root": { color: c },
                "&:hover": { bgcolor: rgba },
                boxShadow: `inset 0 0 0 1px ${hexToRgba(c, 0.35)}`,
                "& .menu-icon-chip": {
                    backgroundColor: hexToRgba(c, 0.14),
                    boxShadow: `0 0 0 1px ${hexToRgba(c, 0.35)}, 0 8px 18px ${hexToRgba(c, 0.25)}`
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: open ? 18 : 10,
                    height: 6,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${hexToRgba(c, 0.95)} 0%, ${hexToRgba(c, 0.55)} 100%)`,
                    boxShadow: `0 0 14px ${hexToRgba(c, 0.55)}`
                }
            },
            "&:hover": {
                bgcolor: active ? rgba : "rgba(255,255,255,0.08)",
                transform: "translateX(2px)",
                "& .menu-icon-chip": {
                    transform: "translateY(-1px) scale(1.06)",
                    boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.25), 0 6px 16px rgba(2,6,23,0.35)"
                }
            }
        };
    };

    const childRowSx = (active: boolean, level: 1 | 2, colorKey: string) => {
        const c = iconColors[colorKey] ?? "#60a5fa";
        const rgba = hexToRgba(c, 0.18);
        return {
            borderRadius: 2.2,
            mb: 0.25,
            py: 0.75,
            px: 1.2,
            ml: level === 1 ? 1.8 : 3.8,
            transition: "all 0.2s ease",
            "& .MuiListItemIcon-root": { minWidth: level === 1 ? 26 : 20, transition: "all 0.2s ease" },
            "&.Mui-selected": {
                bgcolor: rgba,
                color: c,
                "& .MuiListItemIcon-root": { color: c },
                "&:hover": { bgcolor: rgba },
                boxShadow: `inset 0 0 0 1px ${hexToRgba(c, 0.25)}`
            },
            "&:hover": { bgcolor: active ? rgba : "rgba(255,255,255,0.06)", transform: "translateX(2px)" }
        };
    };

    const iconChipSx = (colorKey: string) => {
        const c = iconColors[colorKey] ?? "#60a5fa";
        return {
            color: "inherit",
            width: 30,
            height: 30,
            borderRadius: 2,
            bgcolor: hexToRgba(c, 0.12),
            display: "grid",
            placeItems: "center"
        };
    };

    const iconImage = (src: string, alt: string, size = 20) => (
        <Box component="img" src={src} alt={alt} sx={{ width: size, height: size, objectFit: "contain" }} />
    );

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: open ? drawerWidth : miniDrawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: open ? drawerWidth : miniDrawerWidth,
                    boxSizing: "border-box",
                    borderRight: "1px solid",
                    borderColor: "rgba(255,255,255,0.12)",
                    backgroundImage: `linear-gradient(rgba(6,26,58,0.30), rgba(6,26,58,0.36)), url(${BgWorkshop})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    px: open ? 1.6 : 0.8,
                    mt: "70px",
                    height: "calc(100% - 70px)",
                    overflowX: "hidden",
                    transition: "width 0.22s ease, padding 0.22s ease",
                    boxShadow: "8px 0 30px rgba(2, 6, 23, 0.35)",
                    "&::-webkit-scrollbar": {
                        width: 8
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(148,163,184,0.35)",
                        borderRadius: 10
                    }
                }
            }}
        >
            {open && (
                <Typography
                    variant="caption"
                    sx={{ display: "block", px: 0.75, mt: 1.2, mb: 0.8, color: "text.primary", fontWeight: 600, fontSize: "0.95rem" }}
                >
                    Dashboard
                </Typography>
            )}

            <List disablePadding>
                <Tooltip title="Dashboard" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton
                        selected={selected === "dashboard"}
                        onClick={() => onSelect("dashboard")}
                        sx={rootRowSx(selected === "dashboard", "dashboard")}
                    >
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("dashboard")}>
                            {iconImage(DashboardIconImg, "Dashboard")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 500 }} />}
                    </ListItemButton>
                </Tooltip>

                {open && <Divider sx={{ my: 1 }} />}

                <Tooltip title="Utilisateurs" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "users"} onClick={() => setOpenUsers((v) => !v)} sx={rootRowSx(selected === "users", "users")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("users")}>
                            {iconImage(UsersIconImg, "Utilisateurs")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Utilisateurs" primaryTypographyProps={{ fontWeight: 600 }} />}
                        {open &&
                            (openUsers ? <ExpandMoreIcon fontSize="small" sx={{ color: iconColors.users }} /> : <ChevronRightIcon fontSize="small" sx={{ color: iconColors.users }} />)}
                    </ListItemButton>
                </Tooltip>
                <Collapse in={open && openUsers} timeout="auto" unmountOnExit>
                    <List disablePadding>
                        <ListItemButton
                            selected={selected === "clients"}
                            onClick={() => onSelect("clients")}
                            sx={childRowSx(selected === "clients", 1, "clients")}
                        >
                            <ListItemIcon>
                                <ChevronRightIcon fontSize="small" sx={{ color: iconColors.clients }} />
                            </ListItemIcon>
                            <ListItemText primary="Clients" primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>

                        <ListItemButton selected={selected === "providers"} onClick={() => setOpenProviders((v) => !v)} sx={childRowSx(selected === "providers", 1, "providers")}>
                            <ListItemIcon>
                                <EngineeringOutlinedIcon sx={{ fontSize: 18, color: iconColors.providers }} />
                            </ListItemIcon>
                            <ListItemText primary="Prestataires" primaryTypographyProps={{ fontWeight: 500 }} />
                            {openProviders ? <ExpandMoreIcon fontSize="small" sx={{ color: iconColors.providers }} /> : <ChevronRightIcon fontSize="small" sx={{ color: iconColors.providers }} />}
                        </ListItemButton>

                        <Collapse in={openProviders} timeout="auto" unmountOnExit>
                            <List disablePadding>
                                <ListItemButton
                                    selected={selected === "providers_pending"}
                                    onClick={() => onSelect("providers_pending")}
                                    sx={childRowSx(selected === "providers_pending", 2, "providers")}
                                >
                                    <ListItemIcon>
                                        <FiberManualRecordIcon sx={{ fontSize: 8, color: iconColors.providers }} />
                                    </ListItemIcon>
                                    <ListItemText primary="En attente (3)" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                                <ListItemButton
                                    selected={selected === "providers_approved"}
                                    onClick={() => onSelect("providers_approved")}
                                    sx={childRowSx(selected === "providers_approved", 2, "providers")}
                                >
                                    <ListItemIcon>
                                        <FiberManualRecordIcon sx={{ fontSize: 8, color: iconColors.providers }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Approuvés" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                                <ListItemButton
                                    selected={selected === "providers_suspended"}
                                    onClick={() => onSelect("providers_suspended")}
                                    sx={childRowSx(selected === "providers_suspended", 2, "providers")}
                                >
                                    <ListItemIcon>
                                        <FiberManualRecordIcon sx={{ fontSize: 8, color: iconColors.providers }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Suspendus" primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                            </List>
                        </Collapse>
                    </List>
                </Collapse>

                <Tooltip title="Services" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "services"} onClick={() => setOpenServices((v) => !v)} sx={rootRowSx(selected === "services", "services")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("services")}>
                            {iconImage(ServicesIconImg, "Services")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Services" primaryTypographyProps={{ fontWeight: 600 }} />}
                        {open &&
                            (openServices ? <ExpandMoreIcon fontSize="small" sx={{ color: iconColors.services }} /> : <ChevronRightIcon fontSize="small" sx={{ color: iconColors.services }} />)}
                    </ListItemButton>
                </Tooltip>
                <Collapse in={open && openServices} timeout="auto" unmountOnExit>
                    <List disablePadding>
                        <ListItemButton
                            selected={selected === "categories"}
                            onClick={() => onSelect("categories")}
                            sx={childRowSx(selected === "categories", 1, "categories")}
                        >
                            <ListItemIcon sx={{ color: "inherit" }}>
                                <CategoryIllustratedIcon size={18} />
                            </ListItemIcon>
                            <ListItemText primary="Catégories" primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                        <ListItemButton
                            selected={selected === "offers"}
                            onClick={() => onSelect("offers")}
                            sx={childRowSx(selected === "offers", 1, "offers")}
                        >
                            <ListItemIcon sx={{ color: "inherit" }}>
                                <OffersIllustratedIcon size={18} />
                            </ListItemIcon>
                            <ListItemText primary="Offres" primaryTypographyProps={{ fontWeight: 500 }} />
                        </ListItemButton>
                    </List>
                </Collapse>

                <Tooltip title="Réservations" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "reservations"} onClick={() => onSelect("reservations")} sx={rootRowSx(selected === "reservations", "reservations")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("reservations")}>
                            {iconImage(ReservationsIconImg, "Reservations")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Réservations" primaryTypographyProps={{ fontWeight: 600 }} />}
                    </ListItemButton>
                </Tooltip>

                <Tooltip title="Paiements" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "payments"} onClick={() => onSelect("payments")} sx={rootRowSx(selected === "payments", "payments")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("payments")}>
                            {iconImage(PaymentsIconImg, "Paiements")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Paiements" primaryTypographyProps={{ fontWeight: 600 }} />}
                    </ListItemButton>
                </Tooltip>

                <Tooltip title="Marketing" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "marketing"} onClick={() => onSelect("marketing")} sx={rootRowSx(selected === "marketing", "marketing")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("marketing")}>
                            {iconImage(MarketingIconImg, "Marketing")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Marketing" primaryTypographyProps={{ fontWeight: 600 }} />}
                    </ListItemButton>
                </Tooltip>

                <Tooltip title="Contenu" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "content"} onClick={() => onSelect("content")} sx={rootRowSx(selected === "content", "content")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("content")}>
                            {iconImage(ContentIconImg, "Contenu")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Contenu" primaryTypographyProps={{ fontWeight: 600 }} />}
                    </ListItemButton>
                </Tooltip>

                <Tooltip title="Support" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "support"} onClick={() => onSelect("support")} sx={rootRowSx(selected === "support", "support")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("support")}>
                            {iconImage(SupportIconImg, "Support")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Support" primaryTypographyProps={{ fontWeight: 600 }} />}
                    </ListItemButton>
                </Tooltip>

                <Tooltip title="Paramètres" placement="right" disableHoverListener={open} slotProps={tooltipSlotProps}>
                    <ListItemButton selected={selected === "settings"} onClick={() => onSelect("settings")} sx={rootRowSx(selected === "settings", "settings")}>
                        <ListItemIcon className="menu-icon-chip" sx={iconChipSx("settings")}>
                            {iconImage(SettingsIconImg, "Settings")}
                        </ListItemIcon>
                        {open && <ListItemText primary="Paramètres" primaryTypographyProps={{ fontWeight: 600 }} />}
                    </ListItemButton>
                </Tooltip>
            </List>
        </Drawer>
    );
}