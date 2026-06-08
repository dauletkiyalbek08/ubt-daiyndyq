"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TestRunner } from "@/components/TestRunner";
import { useAuth } from "@/components/AuthProvider";
import { api, ApiError, type ApiTestFull } from "@/lib/api";
import {
  ENT_MANDATORY,
  ENT_MANDATORY_IDS,
  SPECIALTIES,
  subjectIcon,
  subjectName,
  type Specialty,
} from "@/lib/ent";

export default function TrialTakePage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [trial, setTrial] = useState<ApiTestFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Specialty | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .getTrial(params.id)
      .then(setTrial)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 403) setForbidden(true);
        else if (e instanceof ApiError && e.status === 404) setError("Пробное ҰБТ табылмады");
        else setError(e instanceof ApiError ? e.message : "Жүктелмеді");
      })
      .finally(() => setLoading(false));
  }, [params.id, user]);

  // Поиск специальности по коду или названию
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SPECIALTIES.slice(0, 12);
    return SPECIALTIES.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query]);

  const isCreative = selected?.subjects.includes("creative");
  const chosenSubjects = selected ? Array.from(new Set(selected.subjects)) : [];

  // Вопросы: обязательные + профильные выбранной специальности
  const runnerQuestions = useMemo(() => {
    if (!trial || !selected) return [];
    const allow = new Set([...ENT_MANDATORY_IDS, ...chosenSubjects]);
    const order = [...ENT_MANDATORY_IDS, ...chosenSubjects];
    return trial.questions
      .filter((qq) => !qq.subject || allow.has(qq.subject))
      .sort((a, b) => order.indexOf(a.subject ?? "") - order.indexOf(b.subject ?? ""))
      .map((qq) => ({ ...qq, subject: subjectName(qq.subject) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial, selected]);

  if (authLoading || (user && loading)) {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  if (!user) {
    return (
      <div className="container-page max-w-md py-20 text-center">
        <div className="card">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Кіру қажет</h1>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="btn-primary">Кіру</Link>
            <Link href="/register" className="btn-secondary">Тіркелу</Link>
          </div>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="container-page max-w-md py-20 text-center">
        <div className="card">
          <div className="text-4xl">⭐</div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Premium қажет</h1>
          <p className="mt-2 text-sm text-slate-500">
            Пробное ҰБТ тек Премиум тарифінде қолжетімді.
          </p>
          <Link href="/pricing" className="btn-primary mt-6">Тариф таңдау →</Link>
        </div>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="container-page max-w-md py-20 text-center">
        <div className="card text-rose-600">{error || "Пробное ҰБТ табылмады"}</div>
        <Link href="/trial" className="btn-secondary mt-6">Артқа</Link>
      </div>
    );
  }

  // Прохождение
  if (started && selected) {
    return (
      <TestRunner
        title={trial.title}
        questions={runnerQuestions}
        durationMin={trial.durationMin}
        backHref="/trial"
        studentName={`${user.firstName} ${user.lastName ?? ""}`.trim()}
        onFinish={(answers) => api.submitResult(trial.id, answers, chosenSubjects)}
      />
    );
  }

  // Экран выбора специальности
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-2xl font-bold text-slate-900">{trial.title}</h1>
      <p className="mt-2 text-slate-600">
        ҰБТ форматы: 3 міндетті пән + мамандығыңыз бойынша 2 профильдік пән.
      </p>

      {/* Обязательные */}
      <div className="card mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">МІНДЕТТІ ПӘНДЕР</h2>
        <div className="flex flex-wrap gap-2">
          {ENT_MANDATORY.map((s) => (
            <span key={s.id} className="badge bg-emerald-50 text-emerald-600">✓ {s.name}</span>
          ))}
        </div>
      </div>

      {/* Выбор специальности */}
      <div className="card mt-4">
        <h2 className="mb-1 text-sm font-semibold text-slate-500">МАМАНДЫҚ (БІЛІМ БЕРУ БАҒДАРЛАМАСЫ)</h2>
        <p className="mb-3 text-sm text-slate-500">Код немесе атауы бойынша іздеп таңдаңыз</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Мысалы: B009 немесе «математика»"
          className="input-field"
        />
        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {filtered.map((s) => {
            const active = selected?.code === s.code;
            return (
              <button
                key={s.code}
                onClick={() => setSelected(s)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active ? "border-brand bg-brand/5" : "border-slate-100 hover:border-brand/40 hover:bg-slate-50"
                }`}
              >
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                  {s.code}
                </span>
                <span className="flex-1 text-slate-800">{s.name}</span>
                {s.subjects.includes("creative") ? (
                  <span className="text-xs text-amber-600">🎨</span>
                ) : (
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    {subjectName(s.subjects[0])} · {subjectName(s.subjects[1])}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-slate-400">Мамандық табылмады</p>
          )}
        </div>
      </div>

      {/* Авто-подставленные профильные */}
      {selected && (
        <div className="card mt-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-500">
            ПРОФИЛЬДІК ПӘНДЕР — {selected.code}
          </h2>
          {isCreative ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              ⚠️ «{selected.name}» — бұл мамандық <b>шығармашылық емтихан</b> тапсырады.
              Пробное ҰБТ бұл мамандыққа қолжетімді емес. Басқа мамандық таңдаңыз.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {chosenSubjects.map((id) => (
                <span key={id} className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2 font-medium text-slate-800">
                  <span className="text-xl">{subjectIcon(id)}</span>
                  {subjectName(id)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        ⏱ Тест басталғаннан кейін уақыт санағы жүреді ({trial.durationMin} мин).
      </div>

      <button
        onClick={() => setStarted(true)}
        disabled={!selected || !!isCreative}
        className="btn-primary mt-6 w-full disabled:opacity-50"
      >
        {!selected ? "Мамандық таңдаңыз" : isCreative ? "Бұл мамандық қолжетімді емес" : "Пробное ҰБТ бастау →"}
      </button>
    </div>
  );
}
