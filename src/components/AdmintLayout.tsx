import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
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
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
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
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${OpenArtBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
