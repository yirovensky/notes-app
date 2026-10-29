import { useState, type FormEvent } from "react";
import { Alert, Button, Link, Stack, TextField } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getErrorMessage } from "../api";
import { useAuth } from "../auth/authContext";
import AuthLayout from "../components/AuthLayout";

export default function RegisterPage() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mismatch = confirm !== "" && password !== confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;

    setError(null);
    setSubmitting(true);
    try {
      await register({ displayName: displayName.trim(), email: email.trim(), password });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы вести заметки"
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link component={RouterLink} to="/login">
            Войти
          </Link>
        </>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Имя"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoFocus
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          helperText="Не короче 6 символов"
          autoComplete="new-password"
          slotProps={{ htmlInput: { minLength: 6, maxLength: 100 } }}
        />
        <TextField
          label="Повторите пароль"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          error={mismatch}
          helperText={mismatch ? "Пароли не совпадают" : " "}
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting || mismatch}>
          {submitting ? "Создаём…" : "Создать аккаунт"}
        </Button>
      </Stack>
    </AuthLayout>
  );
}