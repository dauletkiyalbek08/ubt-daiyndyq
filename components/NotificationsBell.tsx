"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type NotifItem } from "@/lib/api";
import { Bell, PartyPopper, Hourglass, Ban, FileText, Video, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  payment: PartyPopper,
  sub_ending: Hourglass,
  sub_ended: Ban,
  new_test: FileText,
  webinar: Video,
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const res = await api.notifications();
      setItems(res.items);
      setUnread(res.unread);
    } catch {
      /* not logged in / error — ignore */
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // обновление раз в минуту
    return () => clearInterval(id);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await api.markNotificationsRead().catch(() => {});
      setUnread(0);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
        aria-label="Хабарламалар"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">
              Хабарламалар
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Хабарлама жоқ
                </p>
              ) : (
                items.map((n) => {
                  const NIcon = ICONS[n.type] ?? Bell;
                  const cls = `flex gap-3 border-b border-slate-50 px-4 py-3 ${
                    n.read ? "" : "bg-brand/5"
                  }`;
                  const inner = (
                    <>
                      <NIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500">{n.message}</p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </>
                  );
                  // Если есть ссылка — уведомление кликабельно (переход)
                  return n.link ? (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className={`${cls} hover:bg-slate-50`}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} className={cls}>
                      {inner}
                    </div>
                  );
                })
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-brand hover:bg-slate-50"
            >
              Барлығын көру
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
