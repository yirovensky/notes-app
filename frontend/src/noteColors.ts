// Ключи совпадают с допустимыми значениями на бэкенде (SetColorDto.Color)
export const NOTE_COLORS = [
  { key: "red", label: "Красный", color: "#ef5350" },
  { key: "orange", label: "Оранжевый", color: "#ff9800" },
  { key: "yellow", label: "Жёлтый", color: "#fbc02d" },
  { key: "green", label: "Зелёный", color: "#66bb6a" },
  { key: "teal", label: "Бирюзовый", color: "#26a69a" },
  { key: "blue", label: "Синий", color: "#42a5f5" },
  { key: "purple", label: "Фиолетовый", color: "#ab47bc" },
  { key: "pink", label: "Розовый", color: "#ec407a" },
] as const;

export const colorOf = (key: string | null): string | null =>
  NOTE_COLORS.find((c) => c.key === key)?.color ?? null;