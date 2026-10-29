import { useCallback, useEffect, useRef, useState } from "react";
import { api, getErrorMessage } from "../api";
import { DEFAULT_SORT, SORT_OPTIONS, type SortValue } from "../sortOptions";
import type { Note, NoteInput } from "../types";

const SORT_KEY = "notesSort";

// выбранная сортировка запоминается в браузере
function loadSort(): SortValue {
  try {
    const v = localStorage.getItem(SORT_KEY);
    return SORT_OPTIONS.some((o) => o.value === v) ? (v as SortValue) : DEFAULT_SORT;
  } catch {
    return DEFAULT_SORT;
  }
}

export function useNotesData() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>(loadSort);

  // номер последнего запроса: ответ на более старый запрос игнорируем
  const requestId = useRef(0);

  // поиск отправляем на сервер через 300 мс после последнего символа
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const changeSort = (value: SortValue) => {
    setSortValue(value);
    try {
      localStorage.setItem(SORT_KEY, value);
    } catch {
      /* хранилище недоступно */
    }
  };

  const loadNotes = useCallback(async () => {
    const id = ++requestId.current;
    const opt = SORT_OPTIONS.find((o) => o.value === sortValue) ?? SORT_OPTIONS[0];
    try {
      const result = await api.getNotes({
        search: debouncedSearch || undefined,
        sort: opt.sort,
        order: opt.order,
      });
      if (id === requestId.current) setNotes(result);
    } catch (e) {
      if (id === requestId.current) setError(getErrorMessage(e));
    }
  }, [debouncedSearch, sortValue]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Выполняет действие; true — успех, false — ошибка (она попадает в error)
  const run = async (action: () => Promise<void>): Promise<boolean> => {
    try {
      await action();
      return true;
    } catch (e) {
      setError(getErrorMessage(e));
      return false;
    }
  };

  const saveNote = (data: NoteInput, id?: number) =>
    run(async () => {
      if (id === undefined) await api.createNote(data);
      else await api.updateNote(id, data);
      await loadNotes();
    });

  const togglePin = (n: Note) =>
    run(async () => {
      await api.pinNote(n.id, !n.isPinned);
      await loadNotes();
    });

  const deleteNote = async (n: Note): Promise<boolean> => {
    if (!window.confirm(`Удалить заметку «${n.title}»?`)) return false;
    return run(async () => {
      await api.deleteNote(n.id);
      await loadNotes();
    });
  };

  // Цвет меняется сразу в списке, не дожидаясь ответа сервера; при ошибке список перезагружается
  const setColor = async (n: Note, color: string | null) => {
    setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, color } : x)));
    const ok = await run(() => api.setNoteColor(n.id, color));
    if (!ok) await loadNotes();
    return ok;
  };

  return {
    notes,
    error,
    clearError: () => setError(null),
    search,
    setSearch,
    sortValue,
    changeSort,
    hasFilter: debouncedSearch !== "",
    saveNote,
    togglePin,
    deleteNote,
    setColor,
  };
}