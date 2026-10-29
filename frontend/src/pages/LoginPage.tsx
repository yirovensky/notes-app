import { useState, type FormEvent } from "react";
import { Alert, Button, Link, Stack, TextField } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getErrorMessage } from "../api";
import { useAuth } from "../auth/authContext";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      // дальше GuestRoute сам перекинет на главную
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Вход"
      subtitle="Войдите, чтобы увидеть свои заметки"
      footer={
        <>
          Нет аккаунта?{" "}
          <Link component={RouterLink} to="/register">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Входим…" : "Войти"}
        </Button>
      </Stack>
    </AuthLayout>
  );
}