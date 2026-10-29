import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, refreshSession, session } from "../api";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  User,
} from "../types";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(session.hasRefreshToken());

  useEffect(() => {
    // если сессия умерла посреди работы, перекидываем на вход
    session.onExpired(() => setUser(null));

    if (!session.hasRefreshToken()) {
      setLoading(false);
      return;
    }

    // при запуске пробуем восстановить сессию по сохранённому refresh-токену
    let cancelled = false;
    refreshSession()
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {
        /* токен недействителен или сервер недоступен: остаёмся гостем */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    setUser(await api.login(data));
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    setUser(await api.register(data));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    setUser(await api.updateProfile(data));
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordInput) => {
    setUser(await api.changePassword(data));
  }, []);

  const uploadAvatar = useCallback(async (image: Blob) => {
    setUser(await api.uploadAvatar(image));
  }, []);

  const removeAvatar = useCallback(async () => {
    setUser(await api.removeAvatar());
  }, []);

  // после удаления пользователь становится null, и маршруты сами перекинут на /login
  const deleteAccount = useCallback(async (password: string) => {
    await api.deleteAccount(password);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      uploadAvatar,
      removeAvatar,
      deleteAccount,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      uploadAvatar,
      removeAvatar,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}