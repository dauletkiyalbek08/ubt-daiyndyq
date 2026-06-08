"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { NotificationsBell } from "@/components/NotificationsBell";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { href: "/tests", label: "Тесттер" },
  { href: "/trial", label: "Пробное ҰБТ" },
  { href: "/rating", label: "Рейтинг" },
  { href: "/pricing", label: "Тарифтер" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Тень и плотный фон появляются при прокрутке вниз
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-lg"
          : "border-b border-transparent bg-white/40 backdrop-blur"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-light text-white shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
            Ұ
          </span>
          <span className="text-lg">ҰБТ Дайындық</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "text-brand" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand transition-all duration-300 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationsBell />
              {user.role === "admin" && (
                <Link href="/admin" className="text-sm font-semibold text-slate-700 hover:text-brand">
                  Админ
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-brand">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs text-white">
                  {user.firstName[0]}
                </span>
                {user.firstName}
              </Link>
              <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-rose-600">
                Шығу
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-brand">
                Кіру
              </Link>
              <Link href="/register" className="btn-primary px-5 py-2 text-sm">
                Тіркелу
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200"
            aria-label="Меню"
          >
            <span className="text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-secondary py-2.5 text-sm">
                    Жеке кабинет ({user.firstName})
                  </Link>
                  <Link href="/profile" onClick={() => setOpen(false)} className="btn-secondary py-2.5 text-sm">
                    Профиль
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="btn-secondary py-2.5 text-sm">
                      Админ-панель
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn-secondary py-2.5 text-sm">
                    Шығу
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary py-2.5 text-sm">
                    Кіру
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary py-2.5 text-sm">
                    Тіркелу
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
