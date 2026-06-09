"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError, type ApiTest } from "@/lib/api";
import { ALL_SUBJECTS, subjectName } from "@/lib/ent";
import { PageTitle } from "@/components/PageTitle";
import { FileText, Clock, ChevronDown } from "lucide-react";

type Mode = "full" | "subject";

export default function TestsPage() {
  const [mode, setMode] = useState<Mode>("full");
  const [subject, setSubject] = useState("all");
  const [items, setItems] = useState<ApiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const load =
      mode === "full"
        ? api.listTrials().then((r) => r.trials)
        : api.listTests({ subject: subject === "all" ? undefined : subject });
    load
      .then(setItems)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Жүктеу қатесі"))
      .finally(() => setLoading(false));
  }, [mode, subject]);

  return (
    <div className="container-page py-10">
      <PageTitle title="Тесттер" />

      {/* Шапка с фильтрами */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Тест</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Переключатель режима */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setMode("full")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "full" ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ҰБТ — 5 пән бойынша
            </button>
            <button
              onClick={() => setMode("subject")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "subject" ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ҰБТ — Пән бойынша
            </button>
          </div>

          {/* Предмет (только для «по предмету») */}
          {mode === "subject" && (
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field appearance-none pr-10"
              >
                <option value="all">Барлық пәндер</option>
                {ALL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          )}

          {/* Язык (пока только казахский) */}
          <div className="relative">
            <select className="input-field appearance-none pr-10" defaultValue="kk">
              <option value="kk">Қазақша</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {error && <div className="card mb-6 bg-rose-50 text-rose-700">{error}</div>}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-48 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center text-slate-500">
          {mode === "full" ? "Әзірге пробное ҰБТ жоқ." : "Бұл пән бойынша тест табылмады."}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TestCard key={t.id} t={t} mode={mode} />
          ))}
        </div>
      )}
    </div>
  );
}

function TestCard({ t, mode }: { t: ApiTest; mode: Mode }) {
  const isFull = mode === "full";
  const href = isFull ? `/trial/${t.id}` : `/tests/${t.id}`;
  const tag = isFull ? "ҰБТ — 5 пән бойынша" : subjectName(t.subjectId) || t.topic;

  return (
    <div className="card-interactive flex flex-col">
      <h3 className="text-lg font-bold leading-snug text-slate-900">{t.title}</h3>

      {/* Пиллы: язык · вопросы · время */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="badge bg-slate-100 text-slate-600">Қазақша</span>
        <span className="badge inline-flex items-center gap-1 bg-slate-100 text-slate-600">
          <FileText className="h-3.5 w-3.5" /> {t.questionsCount ?? 120}
        </span>
        <span className="badge inline-flex items-center gap-1 bg-slate-100 text-slate-600">
          <Clock className="h-3.5 w-3.5" /> {t.durationMin} мин
        </span>
      </div>

      {/* Низ: тег + кнопка */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="badge bg-emerald-50 text-emerald-600">{tag}</span>
        <Link href={href} className="btn-primary px-5 py-2 text-sm">
          Толығырақ
        </Link>
      </div>
    </div>
  );
}
