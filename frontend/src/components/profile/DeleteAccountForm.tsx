import { useState, type FormEvent } from "react";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { getErrorMessage } from "../../api";
import { useAuth } from "../../auth/authContext";

const CONFIRM_WORD = "УДАЛИТЬ";

export default function DeleteAccountForm({ onClose }: { onClose: () => void }) {
  const { deleteAccount } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canDelete = password !== "" && confirm.trim().toUpperCase() === CONFIRM_WORD;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;

    setError(null);
    setSubmitting(true);
    try {
      await deleteAccount(password);
      // дальше маршруты сами перекинут на страницу входа
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>

      <Alert severity="warning">
        Аккаунт и все ваши заметки будут удалены <b>без возможности восстановления</b>.
      </Alert>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <TextField
        label={`Для подтверждения введите «${CONFIRM_WORD}»`}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="off"
      />

      <Typography variant="caption" color="text.secondary">
        После удаления вы сразу выйдете из системы, а этот email можно будет использовать для
        новой регистрации.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose}>
          Закрыть
        </Button>
        <Button
          type="submit"
          color="error"
          variant="contained"
          disabled={!canDelete || submitting}
        >
          Удалить аккаунт
        </Button>
      </Stack>
    </Stack>
  );
}