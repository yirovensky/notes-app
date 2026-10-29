import { useState, type FormEvent } from "react";
import { Alert, Button, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { getErrorMessage } from "../../api";
import { useAuth } from "../../auth/authContext";

export default function PasswordForm({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mismatch = confirm !== "" && confirm !== newPassword;
  const canSave =
    currentPassword !== "" && newPassword.length >= 6 && confirm === newPassword && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
      {saved && (
        <Alert severity="success">
          Пароль изменён. На остальных устройствах потребуется войти заново.
        </Alert>
      )}

      <TextField
        label="Текущий пароль"
        type={type}
        value={currentPassword}
        onChange={(e) => {
          setCurrentPassword(e.target.value);
          setSaved(false);
        }}
        required
        fullWidth
        autoComplete="current-password"
      />
      <TextField
        label="Новый пароль"
        type={type}
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setSaved(false);
        }}
        required
        fullWidth
        autoComplete="new-password"
        helperText="Минимум 6 символов"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label={show ? "Скрыть пароли" : "Показать пароли"}
                  onClick={() => setShow((v) => !v)}
                  edge="end"
                >
                  {show ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        label="Повторите новый пароль"
        type={type}
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value);
          setSaved(false);
        }}
        required
        fullWidth
        autoComplete="new-password"
        error={mismatch}
        helperText={mismatch ? "Пароли не совпадают" : " "}
      />

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose}>
          Закрыть
        </Button>
        <Button type="submit" variant="contained" disabled={!canSave}>
          {submitting ? "Сохраняю…" : "Сменить пароль"}
        </Button>
      </Stack>
    </Stack>
  );
}