"use client";

import { useEffect, useState } from "react";
import { api, type LeaderboardRow } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { PageTitle } from "@/components/PageTitle";

const periods: { id: "week" | "month" | "all"; label: string }[] = [
  { id: "week", label: "Апта" },
  { id: "month", label: "Ай" },
  { id: "all", label: "Барлық уақыт" },
];

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("ru-RU");
const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

// Оформление подиума для 1/2/3 места
const podiumStyle: Record<number, { ring: string; grad: string; pedestal: string; h: string }> = {
  1: { ring: "ring-amber-400", grad: "from-amber-400 to-yellow-500", pedestal: "from-amber-400/20 to-amber-400/5", h: "h-28" },
  2: { ring: "ring-slate-300", grad: "from-slate-300 to-slate-400", pedestal: "from-slate-300/20 to-slate-300/5", h: "h-20" },
  3: { ring: "ring-orange-400", grad: "from-orange-400 to-amber-600", pedestal: "from-orange-400/20 to-orange-400/5", h: "h-16" },
};

export default function RatingPage() {
  const { user } = useAuth();
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

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  // Порядок на подиуме: 2-е место слева, 1-е по центру, 3-е справа
  const podiumOrder = [1, 0, 2].map((i) => top3[i]).filter(Boolean) as LeaderboardRow[];

  return (
    <div className="container-page max-w-3xl py-10">
      <PageTitle title="Рейтинг" />
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Оқушылар рейтингі</h1>
        <p className="mt-2 text-slate-600">
          Пробное ҰБТ балдары бойынша · Премиум қатысушылары
        </p>
      </div>

      {/* Период */}
      <div className="mb-8 flex justify-center">
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

      {loading ? (
        <div className="card text-center text-slate-400">Жүктелуде...</div>
      ) : rows.length === 0 ? (
        <div className="card text-center text-slate-500">
          Бұл кезеңде нәтиже жоқ. Пробное ҰБТ тапсырып, рейтингке бірінші болып кіріңіз! 🚀
        </div>
      ) : (
        <>
          {/* Подиум топ-3 */}
          <div className="mb-8 flex items-end justify-center gap-3 sm:gap-6">
            {podiumOrder.map((row) => {
              const st = podiumStyle[row.rank];
              const isMe = user?.id === row.userId;
              return (
                <div key={row.userId} className="flex flex-1 flex-col items-center">
                  <div className="text-3xl sm:text-4xl">{medal(row.rank)}</div>
                  <div
                    className={`mt-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${st.grad} text-lg font-bold text-white ring-4 ${st.ring} sm:h-16 sm:w-16`}
                  >
                    {initials(row.name)}
                  </div>
                  <p className="mt-2 max-w-[7rem] truncate text-center text-sm font-semibold text-slate-800">
                    {row.name}
                    {isMe && <span className="ml-1 text-brand">(Сіз)</span>}
                  </p>
                  <p className="text-lg font-extrabold text-brand">{row.score}</p>
                  <p className="-mt-1 text-[11px] text-slate-400">балл · {row.percent}%</p>
                  <div
                    className={`mt-2 flex ${st.h} w-full items-start justify-center rounded-t-xl bg-gradient-to-b ${st.pedestal} pt-2 text-xl font-extrabold text-slate-400`}
                  >
                    {row.rank}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Остальные места (4+) */}
          {rest.length > 0 && (
            <div className="card divide-y divide-slate-100 p-0">
              <div className="flex items-center gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="w-8 text-center">#</span>
                <span className="flex-1">Оқушы</span>
                <span className="w-24 text-right">Күні</span>
                <span className="w-20 text-right">Балл</span>
              </div>
              {rest.map((row) => {
                const isMe = user?.id === row.userId;
                return (
                  <div
                    key={row.userId}
                    className={`flex items-center gap-4 px-5 py-3 transition ${
                      isMe ? "bg-brand/[0.06]" : "hover:bg-surface"
                    }`}
                  >
                    <span className="w-8 text-center font-bold text-slate-500">{row.rank}</span>
                    <span className="flex-1 truncate font-medium text-slate-800">
                      {row.name}
                      {isMe && <span className="ml-1 text-sm text-brand">(Сіз)</span>}
                    </span>
                    <span className="w-24 text-right text-sm text-slate-400">{fmtDate(row.date)}</span>
                    <span className="w-20 text-right font-bold text-brand">
                      {row.score}
                      <span className="text-xs font-normal text-slate-400"> / {row.total}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
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
