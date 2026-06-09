"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AchievementIcon } from "@/components/AchievementIcon";
import { api, type AchievementRow } from "@/lib/api";

export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<AchievementRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .achievements()
      .then(setItems)
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Жетістіктер</h1>
        <p className="mt-2 text-slate-600">
          {dataLoading ? "…" : `${unlockedCount} / ${items.length} жетістік ашылды`}
        </p>
        {!dataLoading && items.length > 0 && (
          <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500"
              style={{ width: `${(unlockedCount / items.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {dataLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className={`card flex items-center gap-4 ${a.unlocked ? "" : "opacity-50"}`}>
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  a.unlocked ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-400"
                }`}
              >
                <AchievementIcon id={a.id} className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                <p className="text-sm text-slate-500">{a.description}</p>
                {a.unlocked ? (
                  <span className="badge mt-1 bg-emerald-50 text-emerald-600">✓ Ашылды</span>
                ) : (
                  <span className="badge mt-1 bg-slate-100 text-slate-500">🔒 Жабық</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/tests" className="btn-primary">
          Тест тапсырып, жаңа жетістік ашу →
        </Link>
      </div>
    </div>
  );
}
