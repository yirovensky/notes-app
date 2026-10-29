import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";
import DeleteAccountForm from "./DeleteAccountForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ open, onClose }: Props) {
  const [tab, setTab] = useState(0);

  // при каждом открытии начинаем с первой вкладки
  useEffect(() => {
    if (open) setTab(0);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Профиль</DialogTitle>
      <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="Данные" />
        <Tab label="Пароль" />
        <Tab label="Аккаунт" />
      </Tabs>
      <DialogContent sx={{ pt: 3 }}>
        {tab === 0 && <ProfileForm onClose={onClose} />}
        {tab === 1 && <PasswordForm onClose={onClose} />}
        {tab === 2 && <DeleteAccountForm onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}