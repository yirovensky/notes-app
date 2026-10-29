import { Button, MenuItem, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { SORT_OPTIONS, type SortValue } from "../sortOptions";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  sortValue: SortValue;
  onSortChange: (value: SortValue) => void;
  onCreate: () => void;
}

export default function NotesToolbar({
  search,
  onSearchChange,
  sortValue,
  onSortChange,
  onCreate,
}: Props) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
      <TextField
        placeholder="Поиск по названию и тексту"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ bgcolor: "background.paper", borderRadius: 1 }}
      />
      <TextField
        select
        size="small"
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value as SortValue)}
        sx={{ minWidth: 220, bgcolor: "background.paper", borderRadius: 1 }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreate}
        sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
      >
        Новая заметка
      </Button>
    </Stack>
  );
}