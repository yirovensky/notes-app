export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarImage: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  isPinned: boolean;
  color: string | null;
}

export interface NoteInput {
  title: string;
  content: string;
}

export interface UpdateProfileInput {
  displayName: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}