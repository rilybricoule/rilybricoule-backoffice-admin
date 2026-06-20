import { useEffect, useState } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import OpenArtBg from "../assets/openart.png";
import { navigateTo } from "../utiles/Navigation"; // adjust path

type Props = {
    selected: string;
    children: React.ReactNode;
};

export default function AdminLayout({ selected: initialSelected, children }: Props) {
    const navigate   = useNavigate();
    const theme      = useTheme();
    const isMobile   = useMediaQuery(theme.breakpoints.down("md"));
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

    const [selected, setSelected] = useState(initialSelected);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        navigate("/");
    };

    const handleSelect = (id: string) => {
        setSelected(id);
        navigateTo(id, navigate);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar
                onToggleSidebar={() => setSidebarOpen((v) => !v)}
                onLogout={handleLogout}
            />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={handleSelect} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    minHeight: "100vh",
                    minWidth: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    overflowX: "auto",
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
