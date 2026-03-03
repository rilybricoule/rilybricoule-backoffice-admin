import { useState } from "react";
import { Box, Toolbar, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import OpenArtBg from "../assets/openart.png";

export default function DashboardPage() {
    const token = localStorage.getItem("accessToken");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selected, setSelected] = useState("dashboard");

    const handleLogout = () => {
        // Clear every auth-related key used in this app.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("role");
        window.location.href = "/";
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onLogout={handleLogout} />
            <Sidebar open={sidebarOpen} selected={selected} onSelect={setSelected} />

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
                    transition: "all 0.2s ease"
                }}
            >
                <Toolbar />
                <Typography variant="h4" gutterBottom>
                    Dashboard Admin
                </Typography>
                <Typography gutterBottom>Vous êtes connecté ✅</Typography>
                <Typography gutterBottom>
                    Token présent: <strong>{token ? "Oui" : "Non"}</strong>
                </Typography>
                <Typography gutterBottom>Selected menu: {selected}</Typography>
            </Box>
        </Box>
    );
}