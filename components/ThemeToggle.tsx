"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Переключатель светлой/тёмной темы. Сохраняет выбор в localStorage.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Тақырыпты ауыстыру"
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 ${className}`}
      title={dark ? "Күндізгі режим" : "Түнгі режим"}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
