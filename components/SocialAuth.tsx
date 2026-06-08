"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleAuthUrl } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT;

export function SocialAuth({ action }: { action: "login" | "register" }) {
  const [notice, setNotice] = useState("");
  const verb = action === "register" ? "жалғастыру" : "кіру";

  return (
    <div>
      <div className="space-y-3">
        {/* Google — серверный OAuth-редирект */}
        <button
          type="button"
          onClick={() => {
            window.location.href = googleAuthUrl();
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card active:translate-y-0"
        >
          <GoogleIcon />
          Google арқылы {verb}
        </button>

        {/* Telegram — официальный виджет, если бот настроен */}
        {TELEGRAM_BOT ? (
          <TelegramButton onNotice={setNotice} />
        ) : (
          <button
            type="button"
            onClick={() => setNotice(`Telegram арқылы ${verb} жақында қосылады`)}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-card active:translate-y-0"
          >
            <TelegramIcon />
            Telegram арқылы {verb}
          </button>
        )}
      </div>

      {notice && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          ⏳ {notice}
        </p>
      )}

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          немесе email арқылы
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}

// Telegram Login Widget: вставляет официальный скрипт, который рисует кнопку.
// Работает только на публичном домене, указанном боту через @BotFather (/setdomain).
function TelegramButton({ onNotice }: { onNotice: (m: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { loginWithTelegram } = useAuth();

  useEffect(() => {
    // Глобальный колбэк, который вызывает виджет Telegram после входа
    (window as any).onTelegramAuth = (user: Record<string, unknown>) => {
      loginWithTelegram(user)
        .then(() => router.push("/dashboard"))
        .catch((e) => onNotice(e instanceof Error ? e.message : "Telegram кіру қатесі"));
    };

    const container = ref.current;
    if (!container || container.childElementCount > 0) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", TELEGRAM_BOT as string);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    container.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="flex justify-center" />;
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.06-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}
