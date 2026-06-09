"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type NotifItem } from "@/lib/api";
import { Bell, BellOff, PartyPopper, Hourglass, Ban, FileText, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  payment: PartyPopper,
  sub_ending: Hourglass,
  sub_ended: Ban,
  new_test: FileText,
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
          <div className="card flex flex-col items-center text-center text-slate-500">
            <BellOff className="mb-2 h-8 w-8 text-slate-300" />
            Әзірге хабарлама жоқ
          </div>
        ) : (
          items.map((n) => {
            const NIcon = ICONS[n.type] ?? Bell;
            return (
            <div key={n.id} className="card flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <NIcon className="h-5 w-5" />
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
            );
          })
        )}
      </div>
    </div>
  );
}
