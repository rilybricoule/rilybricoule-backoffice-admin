import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
// change this import to your real layout component
import AdminLayout from "../components/AdminLayout";

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <AdminLayout>
            <Box
                sx={{
                    minHeight: "calc(100vh - 120px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: "100%",
                        maxWidth: 700,
                        borderRadius: 4,
                        p: { xs: 3, sm: 5 },
                        textAlign: "center",
                        background: "rgba(8, 18, 40, 0.62)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        boxShadow:
                            "0 0 28px rgba(37,99,235,0.35), 0 0 18px rgba(249,115,22,0.28), inset 0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                >
                    <Stack spacing={2.5} alignItems="center">
                        <Typography
                            variant="h2"
                            fontWeight={900}
                            sx={{ color: "#f8fafc", letterSpacing: 1 }}
                        >
                            403
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ color: "#f8fafc" }}
                        >
                            Accès non autorisé
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{ color: "rgba(226,232,240,0.85)", maxWidth: 500 }}
                        >
                            Vous êtes connecté, mais vous n’avez pas la permission
                            d’accéder à cette page.
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/dashboard")}
                            sx={{
                                mt: 1,
                                px: 4,
                                py: 1.3,
                                fontWeight: 800,
                                letterSpacing: 0.6,
                                color: "#f8fafc",
                                background: "linear-gradient(90deg, #2563eb 0%, #f97316 100%)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                boxShadow:
                                    "0 10px 30px rgba(37,99,235,0.4), 0 0 18px rgba(249,115,22,0.45)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(90deg, #1d4ed8 0%, #ea580c 100%)",
                                    boxShadow:
                                        "0 12px 35px rgba(37,99,235,0.55), 0 0 22px rgba(249,115,22,0.55)",
                                },
                            }}
                        >
                            Retour au tableau de bord
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </AdminLayout>
    );
}