"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type NotifItem } from "@/lib/api";

const ICONS: Record<string, string> = {
  payment: "🎉",
  sub_ending: "⏳",
  sub_ended: "⛔",
  new_test: "📝",
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .notifications()
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setDataLoading(false));
    // отметить прочитанными при открытии
    api.markNotificationsRead().catch(() => {});
  }, [user]);

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Хабарламалар</h1>
      <p className="mt-2 text-slate-600">Оплата, жазылым және жаңа тесттер туралы</p>

      <div className="mt-6 space-y-3">
        {dataLoading ? (
          <div className="card text-slate-400">Жүктелуде...</div>
        ) : items.length === 0 ? (
          <div className="card text-center text-slate-500">Әзірге хабарлама жоқ 🔕</div>
        ) : (
          items.map((n) => (
            <div key={n.id} className="card flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                {ICONS[n.type] ?? "🔔"}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{n.title}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
              {!n.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
