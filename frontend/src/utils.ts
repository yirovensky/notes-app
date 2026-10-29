// сервер отдаёт UTC без суффикса "Z", поэтому добавляем его сами
const parseServerDate = (iso: string) =>
  new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : iso + "Z");

export const formatDate = (iso: string) =>
  parseServerDate(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

// стабильный цвет аватара по имени
export const avatarColor = (name: string) => {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 55% 45%)`;
};

// «только что», «5 мин. назад», «сегодня, 09:12», «вчера, 14:30», «23 октября», «12 марта 2025»
export const formatRelativeDate = (iso: string, now: Date = new Date()) => {
  const d = parseServerDate(iso);

  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "только что"; // в том числе при небольшом расхождении часов
  if (diffMin < 60) return `${diffMin} мин. назад`;

  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (dayDiff === 0) return `сегодня, ${time}`;
  if (dayDiff === 1) return `вчера, ${time}`;

  // month: "long" даёт полное название в нужном падеже: «23 октября», «12 марта»
  const dayMonth = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  return d.getFullYear() === now.getFullYear() ? dayMonth : `${dayMonth} ${d.getFullYear()}`;
};