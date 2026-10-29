import { useEffect, useState } from "react";

// Возвращает текущее время и обновляет его раз в минуту,
// чтобы подписи «5 мин. назад» не устаревали.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return now;
}