import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Stack spacing={0.5} sx={{ alignItems: "center", mb: 3 }}>
          <StickyNote2OutlinedIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>

        {children}

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          {footer}
        </Typography>
      </Paper>
    </Box>
  );
}