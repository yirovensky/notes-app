import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { getErrorMessage } from "../../api";
import { useAuth } from "../../auth/authContext";
import { squareAvatarBlob } from "../../imageUtils";
import UserAvatar from "../UserAvatar";

const AVATAR_SIZE = 112;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

export default function ProfileForm({ onClose }: { onClose: () => void }) {
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const unchanged =
    displayName.trim() === user?.displayName && email.trim() === user?.email;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await updateProfile({ displayName: displayName.trim(), email: email.trim() });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const runAvatar = async (action: () => Promise<void>) => {
    setError(null);
    setSaved(false);
    setAvatarBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : getErrorMessage(e));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения.");
      return;
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError("Файл слишком большой (максимум 15 МБ).");
      return;
    }

    runAvatar(async () => {
      const blob = await squareAvatarBlob(file);
      await uploadAvatar(blob);
    });
  };

  const pickFile = () => fileRef.current?.click();

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {/* аватар */}
      {user && (
        <Stack spacing={1} sx={{ alignItems: "center", pb: 1 }}>
          <ButtonBase
            disabled={avatarBusy}
            onClick={pickFile}
            aria-label="Изменить фото"
            sx={{
              position: "relative",
              borderRadius: "50%",
              "&:hover .overlay, &:focus-visible .overlay": { opacity: 1 },
            }}
          >
            <UserAvatar user={user} size={AVATAR_SIZE} />
            <Box
              className="overlay"
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                bgcolor: "rgba(0,0,0,0.45)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: avatarBusy ? 1 : 0,
                transition: "opacity .15s",
              }}
            >
              {avatarBusy ? (
                <CircularProgress size={28} color="inherit" />
              ) : (
                <PhotoCameraOutlinedIcon fontSize="large" />
              )}
            </Box>
          </ButtonBase>

          {user.avatarImage && (
            <Button
              size="small"
              color="error"
              disabled={avatarBusy}
              onClick={() => runAvatar(removeAvatar)}
            >
              Удалить фото
            </Button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleFile}
          />
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      {saved && <Alert severity="success">Данные сохранены</Alert>}

      <TextField
        label="Имя"
        value={displayName}
        onChange={(e) => {
          setDisplayName(e.target.value);
          setSaved(false);
        }}
        required
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSaved(false);
        }}
        required
        helperText="Этот адрес используется для входа"
        slotProps={{ htmlInput: { maxLength: 200 } }}
      />

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose}>Закрыть</Button>
        <Button type="submit" variant="contained" disabled={submitting || unchanged}>
          Сохранить
        </Button>
      </Stack>
    </Stack>
  );
}