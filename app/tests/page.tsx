"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError, type ApiTest } from "@/lib/api";
import { subjects } from "@/lib/mock-data";
import { PageTitle } from "@/components/PageTitle";

const difficulties = ["Жеңіл", "Орташа", "Қиын"];
const years = ["2024", "2023"];

const difficultyColor: Record<string, string> = {
  Жеңіл: "bg-emerald-50 text-emerald-600",
  Орташа: "bg-amber-50 text-amber-600",
  Қиын: "bg-rose-50 text-rose-600",
};

export default function TestsPage() {
  const [subject, setSubject] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Загружаем тесты с сервера при изменении фильтров (с небольшой задержкой для поиска)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      api
        .listTests({
          subject: subject === "all" ? undefined : subject,
          difficulty: difficulty === "all" ? undefined : difficulty,
          year: year === "all" ? undefined : year,
          q: query || undefined,
        })
        .then(setTests)
        .catch((e) => setError(e instanceof ApiError ? e.message : "Жүктеу қатесі"))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [subject, difficulty, year, query]);

  const subjectInfo = (id: string) => subjects.find((s) => s.id === id);

  return (
    <div className="container-page py-10">
      <PageTitle title="Тесттер" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Тесттер</h1>
        <p className="mt-2 text-slate-600">Пән, күрделілік және жыл бойынша сүзіп, тест таңдаңыз</p>
      </div>

      <div className="card mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Пән</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
              <option value="all">Барлық пәндер</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Күрделілік</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
              <option value="all">Барлығы</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Жыл</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="input-field">
              <option value="all">Барлық жылдар</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Іздеу</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Тақырып немесе атау..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-6 bg-rose-50 text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="card text-center text-slate-500">Сүзгіге сәйкес тест табылмады.</div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">{tests.length} тест табылды</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((t) => {
              const subj = subjectInfo(t.subjectId);
              return (
                <div key={t.id} className="card flex flex-col transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${subj?.color ?? "bg-slate-100"}`}>
                      {subj?.icon ?? "📘"}
                    </span>
                    <span className={`badge ${difficultyColor[t.difficulty] ?? "bg-slate-100 text-slate-600"}`}>
                      {t.difficulty}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {subj?.name ?? t.subjectId} · {t.topic} · {t.year}
                  </p>
                  <div className="mt-4 flex gap-4 text-sm text-slate-500">
                    <span>📝 {t.questionsCount ?? 0} сұрақ</span>
                    <span>⏱ {t.durationMin} мин</span>
                  </div>
                  <Link href={`/tests/${t.id}`} className="btn-primary mt-5 w-full">
                    Бастау
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
