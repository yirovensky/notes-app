import { useState } from "react";
import { Box, Container } from "@mui/material";
import type { Note } from "../types";
import { useNotesData } from "../hooks/useNotesData";
import AppHeader from "../components/AppHeader";
import ErrorSnackbar from "../components/ErrorSnackbar";
import NoteDialog from "../components/NoteDialog";
import NotesGrid from "../components/NotesGrid";
import NotesToolbar from "../components/NotesToolbar";

export default function NotesPage() {
  const {
    notes,
    error,
    clearError,
    search,
    setSearch,
    sortValue,
    changeSort,
    hasFilter,
    saveNote,
    togglePin,
    deleteNote,
    setColor,
  } = useNotesData();

  // диалог создания / редактирования
  const [editOpen, setEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const openCreate = () => {
    setEditingNote(null);
    setEditOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setEditOpen(true);
  };

  return (
    <Box
      sx={{
        height: { md: "100vh" },
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: { md: "hidden" },
      }}
    >
      <AppHeader />

      <Container
        maxWidth="lg"
        disableGutters
        sx={{
          my: 2,
          px: { xs: 2, lg: 0 },
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <NotesToolbar
          search={search}
          onSearchChange={setSearch}
          sortValue={sortValue}
          onSortChange={changeSort}
          onCreate={openCreate}
        />
        <NotesGrid
          notes={notes}
          hasFilter={hasFilter}
          onEdit={openEdit}
          onDelete={deleteNote}
          onTogglePin={togglePin}
          onChangeColor={setColor}
        />
      </Container>

      <NoteDialog
        open={editOpen}
        note={editingNote}
        onClose={() => setEditOpen(false)}
        onSave={saveNote}
      />

      <ErrorSnackbar message={error} onClose={clearError} />
    </Box>
  );
}