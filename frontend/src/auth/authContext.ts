import { createContext, useContext } from "react";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  User,
} from "../types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  changePassword: (data: ChangePasswordInput) => Promise<void>;
  uploadAvatar: (image: Blob) => Promise<void>;
  removeAvatar: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth нужно вызывать внутри <AuthProvider>");
  return ctx;
}