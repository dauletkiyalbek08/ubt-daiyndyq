"use client";

import { useEffect } from "react";

// Устанавливает заголовок вкладки браузера для клиентских страниц
export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} — ҰБТ Дайындық`;
  }, [title]);
  return null;
}
