"use client";

import { useEffect, useState } from "react";
import { api, type LeaderboardRow } from "@/lib/api";
import { PageTitle } from "@/components/PageTitle";

const periods: { id: "week" | "month" | "all"; label: string }[] = [
  { id: "week", label: "Апта" },
  { id: "month", label: "Ай" },
  { id: "all", label: "Барлық уақыт" },
];

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("ru-RU");

export default function RatingPage() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("all");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .rating(period)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="container-page max-w-3xl py-10">
      <PageTitle title="Рейтинг" />
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Оқушылар рейтингі</h1>
        <p className="mt-2 text-slate-600">
          Пробное ҰБТ нәтижелері бойынша · Премиум қатысушылары
        </p>
      </div>

      {/* Период */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                period === p.id ? "bg-brand text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      {loading ? (
        <div className="card text-center text-slate-400">Жүктелуде...</div>
      ) : rows.length === 0 ? (
        <div className="card text-center text-slate-500">
          Бұл кезеңде нәтиже жоқ. Пробное ҰБТ тапсырып, рейтингке бірінші болып кіріңіз! 🚀
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 p-0">
          {/* Заголовок таблицы */}
          <div className="flex items-center gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span className="w-8 text-center">#</span>
            <span className="flex-1">Оқушы</span>
            <span className="w-24 text-right">Күні</span>
            <span className="w-16 text-right">Нәтиже</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.userId}
              className={`flex items-center gap-4 px-5 py-3 transition hover:bg-surface ${
                row.rank <= 3 ? "bg-brand/[0.03]" : ""
              }`}
            >
              <span className="w-8 text-center font-bold text-slate-500">
                {medal(row.rank) ?? row.rank}
              </span>
              <span className="flex-1 truncate font-medium text-slate-800">{row.name}</span>
              <span className="w-24 text-right text-sm text-slate-400">{fmtDate(row.date)}</span>
              <span className="w-16 text-right font-bold text-brand">{row.score}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Мотивация */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "🔥", title: "Топ-10 апта", text: "Апта сайын үздік оннан орын алыңыз" },
          { icon: "⭐", title: "Топ-10 ай", text: "Ай бойынша көшбасшылар" },
          { icon: "👑", title: "Топ-100 платформа", text: "Барлық уақыттағы үздіктер" },
        ].map((c) => (
          <div key={c.title} className="card text-center">
            <div className="text-3xl">{c.icon}</div>
            <h3 className="mt-2 font-semibold text-slate-900">{c.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
