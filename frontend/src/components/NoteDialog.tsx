import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import type { Note, NoteInput } from "../types";

interface Props {
  open: boolean;
  note: Note | null; // null = создание новой заметки
  onClose: () => void;
  onSave: (data: NoteInput, id?: number) => Promise<boolean>;
}

export default function NoteDialog({ open, note, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // при каждом открытии заполняем форму заново
  useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
  }, [open, note]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSave({ title: title.trim(), content }, note?.id);
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{note ? "Редактирование заметки" : "Новая заметка"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus={!note}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <TextField
              label="Содержание"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              multiline
              minRows={5}
            />
          </Stack>
        </DialogContent>
        <DialogActions disableSpacing sx={{ p: 2, gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="contained">
            {note ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}