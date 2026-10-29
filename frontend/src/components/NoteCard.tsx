import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { colorOf } from "../noteColors";
import type { Note } from "../types";
import { formatDate, formatRelativeDate } from "../utils";
import ColorPicker from "./ColorPicker";

interface Props {
  note: Note;
  now: Date; // общее «текущее время», чтобы все карточки обновлялись вместе
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onChangeColor: (note: Note, color: string | null) => void;
}

export default function NoteCard({
  note,
  now,
  onEdit,
  onDelete,
  onTogglePin,
  onChangeColor,
}: Props) {
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const accent = colorOf(note.color);

  // показываем самую свежую дату: «изменено», а если не правили, то «создано»
  const label = note.updatedAt
    ? `Изменено ${formatRelativeDate(note.updatedAt, now)}`
    : `Создано ${formatRelativeDate(note.createdAt, now)}`;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color .15s, box-shadow .15s",
        ...(accent && {
          bgcolor: alpha(accent, 0.12),
          borderColor: alpha(accent, 0.5),
        }),
        "&:hover": { borderColor: "primary.main", boxShadow: 3 },
      }}
    >
      {/* Шапка карточки: маркер цвета, дата и действия */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", pl: 1, pr: 1, py: 1.25, flexShrink: 0 }}
      >
        {/* маркер: клик открывает палитру */}
        <Tooltip title="Цвет заметки">
          <IconButton
            size="small"
            aria-label="Цвет заметки"
            onClick={(e) => setColorAnchor(e.currentTarget)}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: accent ?? "transparent",
                border: 2,
                borderColor: accent ?? "text.disabled",
              }}
            />
          </IconButton>
        </Tooltip>

        <Popover
          open={Boolean(colorAnchor)}
          anchorEl={colorAnchor}
          onClose={() => setColorAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: { p: 1.5, maxWidth: 220 } } }}
        >
          <ColorPicker
            value={note.color}
            onChange={(color) => {
              onChangeColor(note, color);
              setColorAnchor(null);
            }}
          />
        </Popover>

        <Tooltip
          title={
            <>
              Создано: {formatDate(note.createdAt)}
              {note.updatedAt && (
                <>
                  <br />
                  Изменено: {formatDate(note.updatedAt)}
                </>
              )}
            </>
          }
          placement="bottom-start"
        >
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flexGrow: 1 }}>
            {label}
          </Typography>
        </Tooltip>

        <Tooltip title={note.isPinned ? "Открепить" : "Закрепить"}>
          <IconButton
            size="small"
            aria-label={note.isPinned ? "Открепить" : "Закрепить"}
            color={note.isPinned ? "primary" : "default"}
            onClick={() => onTogglePin(note)}
          >
            {note.isPinned ? (
              <PushPinIcon fontSize="small" />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <IconButton size="small" aria-label="Изменить" onClick={() => onEdit(note)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" aria-label="Удалить" onClick={() => onDelete(note)}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider />

      {/* Кликабельная часть: название + обрезанный текст */}
      <CardActionArea
        onClick={() => onEdit(note)}
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          minHeight: 0,
        }}
      >
        <Typography variant="h6" component="h2" noWrap gutterBottom>
          {note.title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {note.content}
        </Typography>
      </CardActionArea>
    </Card>
  );
}