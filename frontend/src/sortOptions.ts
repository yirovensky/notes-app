export const SORT_OPTIONS = [
  { value: "created-desc", label: "Сначала новые", sort: "created", order: "desc" },
  { value: "created-asc", label: "Сначала старые", sort: "created", order: "asc" },
  { value: "updated-desc", label: "Недавно изменённые", sort: "updated", order: "desc" },
  { value: "title-asc", label: "По названию А–Я", sort: "title", order: "asc" },
  { value: "title-desc", label: "По названию Я–А", sort: "title", order: "desc" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "created-desc";