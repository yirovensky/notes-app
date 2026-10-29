import { Box, Stack, Typography } from "@mui/material";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import type { Note } from "../types";
import { useNow } from "../hooks/useNow";
import NoteCard from "./NoteCard";

interface Props {
  notes: Note[];
  hasFilter: boolean; // активен ли поиск (для текста пустого состояния)
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onChangeColor: (note: Note, color: string | null) => void;
}

// Прокручиваемая область со списком заметок
export default function NotesGrid({ notes, hasFilter, onEdit, onDelete, onTogglePin, onChangeColor }: Props) {
  const now = useNow();

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: { md: "auto" } }}>
      {notes.length === 0 && (
        <Stack spacing={1} sx={{ alignItems: "center", py: 8, color: "text.secondary" }}>
          <StickyNote2OutlinedIcon sx={{ fontSize: 56, opacity: 0.4 }} />
          <Typography>
            {hasFilter ? "Ничего не найдено" : "Заметок пока нет. Создайте первую!"}
          </Typography>
        </Stack>
      )}

      {/* Сетка: все карточки одной высоты */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gridAutoRows: 220,
          gap: 2,
        }}
      >
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            now={now}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onChangeColor={onChangeColor}
          />
        ))}
      </Box>
    </Box>
  );
}