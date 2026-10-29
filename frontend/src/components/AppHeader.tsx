import { useState } from "react";
import {
  AppBar,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { useAuth } from "../auth/authContext";
import ProfileDialog from "./profile/ProfileDialog";
import UserAvatar from "./UserAvatar";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";

  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, lg: 0 } }}>
        <Toolbar disableGutters>
          <StickyNote2OutlinedIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Заметки
          </Typography>

          {user && (
            <Tooltip title={`${user.displayName} · ${user.email}`}>
              <IconButton aria-label="Профиль" onClick={() => setProfileOpen(true)} sx={{ mr: 0.5 }}>
                <UserAvatar user={user} size={32} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={isDark ? "Светлая тема" : "Тёмная тема"}>
            <IconButton
              aria-label="Переключить тему"
              onClick={() => setMode(isDark ? "light" : "dark")}
            >
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Настройки">
            <IconButton aria-label="Настройки" onClick={() => setProfileOpen(true)}>
              <SettingsOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Выйти">
            <IconButton aria-label="Выйти" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

    </AppBar>
  );
}