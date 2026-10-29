import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4f46e5" },
        background: { default: "#f4f5fa", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#818cf8" },
        background: { default: "#0f1117", paper: "#171a23" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: "outlined" } },
  },
});