"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type ApiTest } from "@/lib/api";
import { PageTitle } from "@/components/PageTitle";

export default function TrialPage() {
  const { user, loading } = useAuth();
  const [trials, setTrials] = useState<ApiTest[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Пробное видно всем (и гостям). Список грузим всегда.
  useEffect(() => {
    api
      .listTrials()
      .then((res) => {
        setTrials(res.trials);
        setHasAccess(res.hasAccess);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading) {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  return (
    <div className="container-page py-10">
      <PageTitle title="Пробное ҰБТ" />
      <div className="mx-auto max-w-4xl">
        <span className="badge bg-brand/10 text-brand">🎯 Апта сайынғы нақты емтихан симуляциясы</span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Пробное ҰБТ</h1>
        <p className="mt-3 text-slate-600">
          Әр аптада жаңа нұсқа — нақты ҰБТ форматында (120 сұрақ / 140 балл). Нәтиже рейтингке кіреді.
        </p>

        {/* Блок без доступа (нет Премиум) */}
        {!hasAccess && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-glow">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⭐</span>
              <div>
                <h2 className="text-lg font-bold">Пробное ҰБТ — тек Премиум тарифінде</h2>
                <p className="mt-1 text-sm text-white/90">
                  Апта сайынғы пробное ҰБТ, рейтинг және жетістіктер{" "}
                  <b>Премиум (9 990₸ / 3 ай)</b> тарифінде ашылады.
                </p>
                <Link
                  href="/pricing"
                  style={{ backgroundColor: "#ffffff", color: "#0D9488" }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow transition hover:-translate-y-0.5"
                >
                  Тариф таңдау →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Список пробных ҰБТ */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Қолжетімді нұсқалар</h2>
          {dataLoading ? (
            <div className="card text-slate-400">Жүктелуде...</div>
          ) : trials.length === 0 ? (
            <div className="card text-center text-slate-500">
              Әзірге пробное ҰБТ жоқ. Жақын арада әкімші жаңа нұсқа қосады.
            </div>
          ) : (
            <div className="space-y-4">
              {trials.map((t, i) => (
                <div
                  key={t.id}
                  className="card flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                      {i === 0 ? "🆕" : "📋"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{t.title}</h3>
                        {i === 0 && (
                          <span className="badge bg-emerald-50 text-emerald-600">Осы апта</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {t.weekLabel ? `${t.weekLabel} · ` : ""}
                        ҰБТ форматы · 120 сұрақ · 140 балл · {t.durationMin} мин
                      </p>
                    </div>
                  </div>
                  {hasAccess ? (
                    <Link href={`/trial/${t.id}`} className="btn-primary shrink-0">
                      Бастау →
                    </Link>
                  ) : !user ? (
                    <Link href="/login" className="btn-primary shrink-0">
                      Кіру → бастау
                    </Link>
                  ) : (
                    <Link href="/pricing" className="btn-secondary shrink-0">
                      Тариф алу
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Формат */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { v: "120", l: "сұрақ" },
            { v: "140", l: "балл" },
            { v: "240 мин", l: "уақыт" },
            { v: "Апта сайын", l: "жаңа нұсқа" },
          ].map((c) => (
            <div key={c.l} className="card text-center">
              <p className="text-2xl font-extrabold text-gradient">{c.v}</p>
              <p className="text-sm text-slate-500">{c.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
