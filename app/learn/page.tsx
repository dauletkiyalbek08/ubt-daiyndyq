"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type LearnOverview } from "@/lib/api";
import { ALL_SUBJECTS, subjectIcon } from "@/lib/ent";
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Lock,
  PlayCircle,
} from "lucide-react";

export default function LearnPage() {
  const [subject, setSubject] = useState(ALL_SUBJECTS[0].id);
  const [data, setData] = useState<LearnOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .learnOverview(subject)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [subject]);

  const hasAccess = data?.hasAccess ?? false;
  const empty = !loading && (!data || data.tarautar.length === 0);

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-light text-white shadow-glow">
          <BookOpen className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Сабақтар</h1>
          <p className="text-slate-600">Тақырыпты оқып, тестті тапсыр — келесі тақырып ашылады</p>
        </div>
      </div>

      {/* Выбор предмета */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Пән:</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-field max-w-xs"
        >
          {ALL_SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {subjectIcon(s.id)} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Баннер про Premium */}
      {!loading && !hasAccess && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Crown className="h-6 w-6 text-amber-500" />
          <p className="flex-1 text-sm text-amber-800">
            Оқу бөлімі тек <b>Premium</b> және <b>Maximum</b> тарифтерінде толық қолжетімді.
          </p>
          <Link href="/pricing" className="btn-primary px-4 py-2 text-sm">
            Тарифті таңдау
          </Link>
        </div>
      )}

      {loading && <p className="mt-10 text-center text-slate-400">Жүктелуде...</p>}

      {empty && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          Бұл пән бойынша әзірге сабақтар жоқ.
        </div>
      )}

      {/* Список тарау и тем */}
      <div className="mt-8 space-y-8">
        {data?.tarautar.map((tar, ti) => (
          <div key={tar.id}>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                {ti + 1}
              </span>
              {tar.title}
            </h2>

            <div className="mt-4 space-y-3">
              {tar.topics.map((tp) => {
                const locked = tp.state === "locked" || !hasAccess;
                const completed = tp.state === "completed";

                const inner = (
                  <div
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                      locked
                        ? "border-slate-100 bg-slate-50 opacity-70"
                        : "border-slate-200 bg-white hover:border-brand hover:shadow-card"
                    }`}
                  >
                    {/* Иконка состояния */}
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? "bg-emerald-100 text-emerald-600"
                          : locked
                          ? "bg-slate-200 text-slate-400"
                          : "bg-brand/10 text-brand"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : locked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <PlayCircle className="h-5 w-5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">{tp.title}</p>
                      <p className="text-xs text-slate-400">
                        {tp.hasPresentation && "Презентация · "}
                        {tp.materialsCount > 0 && `${tp.materialsCount} кітап · `}
                        {tp.hasTest ? `Тест (өту ≥ ${tp.passPercent}%)` : "Тест жоқ"}
                      </p>
                    </div>

                    {/* Результат / статус */}
                    <div className="text-right text-sm">
                      {completed ? (
                        <span className="font-semibold text-emerald-600">
                          Аяқталды {tp.bestPercent != null && `· ${tp.bestPercent}%`}
                        </span>
                      ) : tp.bestPercent != null ? (
                        <span className="text-slate-500">Соңғы: {tp.bestPercent}%</span>
                      ) : locked ? (
                        <span className="text-slate-400">Жабық</span>
                      ) : (
                        <span className="font-medium text-brand">Бастау →</span>
                      )}
                    </div>
                  </div>
                );

                return locked ? (
                  <div key={tp.id}>{inner}</div>
                ) : (
                  <Link key={tp.id} href={`/learn/${tp.id}`} className="block">
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
