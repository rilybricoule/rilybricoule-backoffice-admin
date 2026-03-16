import { createTheme } from "@mui/material/styles";

// Polygon blue/orange image-inspired tokens:
// - Deep navy / cobalt blues
// - Slate blue mid-tones
// - Warm orange accent
// - Cool light text for contrast

export const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#1D63B8",
            light: "#53A1E8",
            dark: "#0B3F8A",
            contrastText: "#f8fafc",
        },
        secondary: {
            main: "#F08A2F",
            light: "#FFAA58",
            dark: "#D36A10",
            contrastText: "#f8fafc",
        },
        background: {
            default: "#061A3A",
            paper: "rgba(10, 37, 77, 0.92)",
        },
        text: {
            primary: "#f8fafc",
            secondary: "rgba(214, 228, 245, 0.86)",
            disabled: "rgba(214, 228, 245, 0.52)",
        },
        divider: "rgba(147, 181, 218, 0.22)",
    },
    typography: {
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        h4: { fontWeight: 800 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                },
                contained: {
                    background: "linear-gradient(90deg, #0B4EA2 0%, #2F7CC9 55%, #F08A2F 100%)",
                    "&:hover": {
                        background: "linear-gradient(90deg, #0A468F 0%, #2A6FB6 55%, #DE7A1F 100%)",
                        boxShadow: "0 10px 30px rgba(17,98,187,0.38), 0 0 18px rgba(240,138,47,0.36)",
                    },
                },
                outlined: {
                    borderColor: "rgba(147,181,218,0.45)",
                    "&:hover": {
                        borderColor: "rgba(183,212,240,0.75)",
                        backgroundColor: "rgba(83,161,232,0.08)",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: "rgba(9, 33, 69, 0.86)",
                    borderColor: "rgba(147,181,218,0.2)",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: "rgba(9, 30, 63, 0.96)",
                    borderRight: "1px solid rgba(147,181,218,0.2)",
                },
            },
        },
    },
});
