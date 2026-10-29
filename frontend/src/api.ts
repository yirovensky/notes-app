import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  AuthResponse,
  ChangePasswordInput,
  LoginInput,
  Note,
  NoteInput,
  RegisterInput,
  UpdateProfileInput,
  User,
} from "./types";

const REFRESH_KEY = "refreshToken";

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export const session = {
  set(auth: AuthResponse) {
    accessToken = auth.accessToken;
    try {
      localStorage.setItem(REFRESH_KEY, auth.refreshToken);
    } catch {
      /* хранилище недоступно */
    }
  },
  clear() {
    accessToken = null;
    try {
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* хранилище недоступно */
    }
  },
  hasRefreshToken: () => getRefreshToken() !== null,
  
  onExpired(handler: () => void) {
    onSessionExpired = handler;
  },
};

const authHttp = axios.create({ baseURL: "/api" });
const http = axios.create({ baseURL: "/api" });

let refreshing: Promise<AuthResponse> | null = null;

export function refreshSession(): Promise<AuthResponse> {
  const token = getRefreshToken();
  if (!token) return Promise.reject(new Error("Нет refresh-токена"));

  if (!refreshing) {
    refreshing = authHttp
      .post<AuthResponse>("/auth/refresh", { refreshToken: token })
      .then((r) => {
        session.set(r.data);
        return r.data;
      })
      .catch((e) => {
        // 401 = токен недействителен, сессия закончилась. Сетевая ошибка сессию не сбрасывает.
        if (isAxiosError(e) && e.response?.status === 401) session.clear();
        throw e;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;

    if (isAxiosError(error) && error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        await refreshSession();
        return http(original);
      } catch {
        if (!session.hasRefreshToken()) onSessionExpired?.();
      }
    }
    return Promise.reject(error);
  }
);

// Достаём понятный текст ошибки из ответа ASP.NET
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return "Нет связи с сервером.";

    const data = error.response.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return String(first);
    }
    if (data?.title) return data.title;
    return `Ошибка ${error.response.status}`;
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}

export const api = {

  login: async (data: LoginInput): Promise<User> => {
    const res = (await authHttp.post<AuthResponse>("/auth/login", data)).data;
    session.set(res);
    return res.user;
  },

  register: async (data: RegisterInput): Promise<User> => {
    const res = (await authHttp.post<AuthResponse>("/auth/register", data)).data;
    session.set(res);
    return res.user;
  },

  logout: async () => {
    const token = getRefreshToken();
    session.clear();
    if (token) {
      try {
        await authHttp.post("/auth/logout", { refreshToken: token });
      } catch {
        /* локально мы уже вышли, ошибка сервера не важна */
      }
    }
  },
  updateProfile: async (data: UpdateProfileInput): Promise<User> =>
    (await http.put<User>("/auth/me", data)).data,

  changePassword: async (data: ChangePasswordInput): Promise<User> => {
    const res = (await http.post<AuthResponse>("/auth/change-password", data)).data;
    session.set(res);
    return res.user;
  },

  uploadAvatar: async (image: Blob): Promise<User> => {
    const form = new FormData();
    form.append("file", image, "avatar.jpg");
    return (await http.put<User>("/users/me/avatar", form)).data;
  },

  removeAvatar: async (): Promise<User> => 
    (await http.delete<User>("/users/me/avatar")).data,

  deleteAccount: async (password: string) => {
    await http.post("/users/me/delete", { password });
    session.clear();
  },

  getNotes: async (params?: { search?: string; sort?: string; order?: string }) =>
    (await http.get<Note[]>("/notes", { params })).data,

  createNote: async (data: NoteInput) => 
    (await http.post<Note>("/notes", data)).data,

  updateNote: async (id: number, data: NoteInput) => {
    await http.put(`/notes/${id}`, data);
  },

  pinNote: async (id: number, isPinned: boolean) => {
    await http.patch(`/notes/${id}/pin`, { isPinned });
  },

  deleteNote: async (id: number) => {
    await http.delete(`/notes/${id}`);
  },

  setNoteColor: async (id: number, color: string | null) => {
    await http.patch(`/notes/${id}/color`, { color });
  },
};