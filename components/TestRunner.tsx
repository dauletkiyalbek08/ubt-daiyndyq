"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { subjectName } from "@/lib/ent";
import { PeriodicTable } from "@/components/PeriodicTable";
import type { ReviewItem, SubjectScore } from "@/lib/api";

export type RunnerQuestion = {
  id: string;
  text: string;
  type?: string;
  options: string[];
  imageUrl?: string | null;
  subject?: string | null; // отображаемое название предмета
  context?: string | null;
  matchLeft?: string[] | null;
  matchRight?: string[] | null;
  points?: number;
  correctIndex?: number;
  explanation?: string;
};

type FinishResult = {
  score: number;
  total: number;
  percent?: number;
  bySubject?: SubjectScore[];
  review: ReviewItem[];
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function TestRunner({
  title,
  questions,
  durationMin,
  backHref = "/tests",
  studentName = "Оқушы",
  onFinish,
}: {
  title: string;
  questions: RunnerQuestion[];
  durationMin: number;
  backHref?: string;
  studentName?: string;
  onFinish?: (answers: Record<string, any>) => Promise<FinishResult>;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tool, setTool] = useState<null | "card" | "calc" | "table" | "units" | "sections">(null);

  const isAnswered = (qid: string) => {
    const a = answers[qid];
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.length > 0 && a.every((x) => x !== "" && x !== undefined);
    return true;
  };
  const answeredCount = questions.filter((q) => isAnswered(q.id)).length;

  // Разделы (предметы) — последовательные группы вопросов
  const sections = useMemo(() => {
    const map: { subject: string; idxs: number[] }[] = [];
    questions.forEach((q, i) => {
      const key = q.subject || "Тест";
      const last = map[map.length - 1];
      if (last && last.subject === key) last.idxs.push(i);
      else map.push({ subject: key, idxs: [i] });
    });
    return map;
  }, [questions]);

  const secIndex = sections.findIndex((s) => s.idxs.includes(current));
  const section = sections[secIndex] ?? sections[0];
  const localIndex = section ? section.idxs.indexOf(current) : 0;

  async function finish() {
    if (submitting || result) return;
    setSubmitting(true);
    setError("");
    try {
      if (onFinish) setResult(await onFinish(answers));
      else {
        let score = 0;
        const review: ReviewItem[] = questions.map((q) => {
          const correct = answers[q.id] === q.correctIndex;
          if (correct) score++;
          return { questionId: q.id, type: q.type ?? "single", subject: q.subject ?? null, context: q.context ?? null, text: q.text, options: q.options, matchLeft: q.matchLeft ?? null, matchRight: q.matchRight ?? null, correctIndex: q.correctIndex ?? -1, correctIndexes: null, userAnswer: answers[q.id] ?? null, correct, points: 1, gained: correct ? 1 : 0, explanation: q.explanation ?? "", imageUrl: q.imageUrl ?? null };
        });
        setResult({ score, total: questions.length, review });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Жіберу қатесі");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) { finish(); return; }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  const percent = useMemo(() => (result ? Math.round((result.score / Math.max(1, result.total)) * 100) : 0), [result]);

  // ---------- РЕЗУЛЬТАТ ----------
  if (result) {
    const subjects = (result.bySubject ?? []).filter((s) => s.subjectId !== "other");
    const emoji = percent >= 70 ? "🎉" : percent >= 40 ? "👍" : "💪";
    const message =
      percent >= 85 ? "Тамаша нәтиже! Осылай жалғастыр 🔥"
      : percent >= 70 ? "Жарайсың, жақсы жұмыс! 👏"
      : percent >= 40 ? "Жаман емес — әрі қарай жақсартамыз 💪"
      : "Бастама жасалды, дайындықты жалғастыр 📚";
    return (
      <div className="container-page max-w-3xl py-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-8 text-center text-white shadow-glow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="text-5xl">{emoji}</div>
            <h1 className="mt-3 text-2xl font-bold">Тест аяқталды!</h1>
            <p className="mt-1 text-white/80">{title}</p>

            <div className="mx-auto mt-6 w-fit">
              <ProgressRing percent={percent} score={result.score} total={result.total} />
            </div>

            <p className="mt-4 text-lg font-semibold">{message}</p>

            <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                <p className="text-xl font-bold">{result.score} / {result.total}</p>
                <p className="text-xs text-white/70">Балл</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                <p className="text-xl font-bold">{fmt(durationMin * 60 - timeLeft)}</p>
                <p className="text-xs text-white/70">Уақыт</p>
              </div>
            </div>
          </div>
        </div>
        {subjects.length > 0 && (
          <div className="card mt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Пәндер бойынша</h2>
            <div className="space-y-3">
              {subjects.map((s) => {
                const p = Math.round((s.score / Math.max(1, s.max)) * 100);
                return (
                  <div key={s.subjectId}>
                    <div className="mb-1 flex justify-between text-sm"><span className="text-slate-700">{subjectName(s.subjectId)}</span><span className="font-semibold text-slate-900">{s.score}/{s.max} балл · {s.correct}/{s.total} дұрыс</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light" style={{ width: `${p}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-8">
          <ReviewBySubject review={result.review} />
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={backHref} className="btn-secondary">Артқа</Link>
          <Link href="/dashboard" className="btn-primary">Жеке кабинет</Link>
        </div>
      </div>
    );
  }

  // ---------- ПРОХОЖДЕНИЕ (полноэкранный ҰБТ-режим) ----------
  const q = questions[current];
  const tools = [
    { id: "sections" as const, icon: "📚", label: "Бөлімдер" },
    { id: "card" as const, icon: "🗂️", label: "Жауап картасы" },
    { id: "calc" as const, icon: "🧮", label: "Калькулятор" },
    { id: "table" as const, icon: "⚛️", label: "Менделеев" },
    { id: "units" as const, icon: "📐", label: "Бірлік кестесі" },
  ];

  function nextSection() {
    if (secIndex < sections.length - 1) setCurrent(sections[secIndex + 1].idxs[0]);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <Watermark />

      {/* Верхняя панель */}
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden text-xl text-slate-400 sm:inline">☰</span>
          <span className="truncate font-semibold text-slate-800">{studentName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <span className={`rounded-lg px-2 py-1.5 font-mono text-xs font-bold sm:px-3 sm:text-sm ${timeLeft < 60 ? "bg-rose-50 text-rose-600" : "bg-brand/10 text-brand"}`}>⏱ {fmt(timeLeft)}</span>
          {secIndex < sections.length - 1 ? (
            <button onClick={nextSection} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark sm:px-4 sm:text-sm">
              <span className="hidden sm:inline">Келесі пән &gt;</span><span className="sm:hidden">Пән &gt;</span>
            </button>
          ) : (
            <button onClick={finish} disabled={submitting} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 sm:px-4 sm:text-sm">
              {submitting ? "..." : `Аяқтау (${answeredCount}/${questions.length})`}
            </button>
          )}
        </div>
      </header>

      {/* Прогресс: сколько вопросов отвечено */}
      <div className="relative z-10 h-1 w-full shrink-0 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-300"
          style={{ width: `${Math.round((answeredCount / Math.max(1, questions.length)) * 100)}%` }}
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* Левая панель инструментов */}
        <aside className="flex w-16 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-slate-200 bg-white py-3 sm:w-20">
          <div className="mb-2 flex flex-col items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{studentName[0]}</span>
            <span className="mt-1 max-w-full truncate text-[10px] text-slate-500">{studentName.split(" ")[0]}</span>
          </div>
          {tools.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} className="flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-slate-500 transition hover:bg-brand/5 hover:text-brand">
              <span className="text-lg">{t.icon}</span>
              <span className="text-center text-[9px] leading-tight">{t.label}</span>
            </button>
          ))}
        </aside>

        {/* Основная область */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Номера вопросов раздела */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white/70 px-4 py-2 backdrop-blur">
            {section?.idxs.map((gi, li) => (
              <button key={gi} onClick={() => setCurrent(gi)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-medium transition ${
                  gi === current ? "border-slate-800 bg-white text-slate-900"
                  : isAnswered(questions[gi].id) ? "border-brand bg-brand text-white"
                  : "border-brand/40 bg-brand/5 text-brand hover:bg-brand/10"}`}>
                {li + 1}
              </button>
            ))}
          </div>

          {/* Заголовок раздела */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
            <h2 className="min-w-0 truncate text-base font-bold text-slate-800 sm:text-lg">Бөлім: {section?.subject}</h2>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="whitespace-nowrap text-sm text-slate-500">Сұрақ № {localIndex + 1}</span>
              {localIndex < (section?.idxs.length ?? 0) - 1 && (
                <button onClick={() => setCurrent(section.idxs[localIndex + 1])} className="hidden rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark sm:inline-flex">Келесі сұрақ &gt;</button>
              )}
            </div>
          </div>

          {/* Вопрос */}
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {q.type === "multiple" && <span className="badge bg-amber-50 text-amber-600">Бірнеше жауап · {q.points ?? 3} балл</span>}
              {q.type === "matching" && <span className="badge bg-violet-50 text-violet-600">Сәйкестендіру</span>}
              {q.type === "context" && <span className="badge bg-sky-50 text-sky-600">Мәтін бойынша</span>}
            </div>
            {q.context && <div className="mb-4 whitespace-pre-line rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{q.context}</div>}
            <p className="border-b border-slate-200 pb-3 text-base font-semibold text-slate-900">{q.text}</p>
            {q.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={q.imageUrl} alt="" className="mt-4 max-h-72 rounded-xl border border-slate-200" />
            )}
            <div className="mt-5">
              {q.type === "matching" ? (
                <MatchingInput q={q} value={answers[q.id]} onChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))} />
              ) : (
                <OptionList q={q} multiple={q.type === "multiple"} value={answers[q.id]} onChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))} />
              )}
            </div>

            {error && <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="mt-8 flex items-center justify-between pb-10">
              <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary disabled:opacity-50">← Алдыңғы</button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">Келесі →</button>
              ) : (
                <button onClick={finish} disabled={submitting} className="btn-primary disabled:opacity-60">{submitting ? "Жіберілуде..." : "Аяқтау"}</button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Модалки инструментов */}
      {tool && (
        <ToolModal title={tools.find((t) => t.id === tool)?.label ?? ""} onClose={() => setTool(null)}>
          {tool === "calc" && <Calculator />}
          {tool === "table" && <PeriodicTable />}
          {tool === "units" && <UnitsTable />}
          {tool === "card" && (
            <div className="space-y-4">
              {sections.map((s) => (
                <div key={s.subject}>
                  <p className="mb-2 text-sm font-semibold text-slate-700">{s.subject}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.idxs.map((gi, li) => (
                      <button key={gi} onClick={() => { setCurrent(gi); setTool(null); }}
                        className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm ${isAnswered(questions[gi].id) ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-500"}`}>{li + 1}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tool === "sections" && (
            <div className="space-y-2">
              {sections.map((s, i) => (
                <button key={s.subject} onClick={() => { setCurrent(s.idxs[0]); setTool(null); }}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm ${i === secIndex ? "border-brand bg-brand/5" : "border-slate-200 hover:bg-slate-50"}`}>
                  <span className="font-medium text-slate-800">{s.subject}</span>
                  <span className="text-slate-400">{s.idxs.filter((gi) => isAnswered(questions[gi].id)).length}/{s.idxs.length}</span>
                </button>
              ))}
            </div>
          )}
        </ToolModal>
      )}
    </div>
  );
}

// Кольцо прогресса для экрана результата (белое на цветном фоне)
function ProgressRing({ percent, score, total }: { percent: number; score: number; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold">{percent}%</span>
        <span className="text-xs text-white/70">{score}/{total}</span>
      </div>
    </div>
  );
}

// Водяной знак «ПРОБНОЕ ТЕСТИРОВАНИЕ»
function Watermark() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.04]">
      <div className="absolute -inset-1/4 flex flex-wrap gap-x-10 gap-y-12 rotate-[-25deg]">
        {Array.from({ length: 120 }).map((_, i) => (
          <span key={i} className="whitespace-nowrap text-2xl font-extrabold uppercase text-slate-900">Пробное тестирование</span>
        ))}
      </div>
    </div>
  );
}

// Варианты ответа (квадратные чекбоксы, как в ҰБТ)
function OptionList({ q, multiple, value, onChange }: { q: RunnerQuestion; multiple: boolean; value: any; onChange: (v: any) => void }) {
  const sel: number[] = multiple ? (Array.isArray(value) ? value : []) : [];
  const click = (idx: number) => {
    if (multiple) onChange(sel.includes(idx) ? sel.filter((x) => x !== idx) : [...sel, idx]);
    else onChange(idx);
  };
  return (
    <div className="space-y-3">
      {q.options.map((opt, idx) => {
        const selected = multiple ? sel.includes(idx) : value === idx;
        return (
          <button key={idx} onClick={() => click(idx)}
            className={`flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition ${selected ? "border-brand ring-1 ring-brand" : "border-slate-200 hover:border-brand/50"}`}>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${selected ? "border-brand bg-brand text-white" : "border-slate-400"}`}>{selected ? "✓" : ""}</span>
            <span className="text-slate-800">{String.fromCharCode(65 + idx)}) {opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function MatchingInput({ q, value, onChange }: { q: RunnerQuestion; value: any; onChange: (v: string[]) => void }) {
  const left = q.matchLeft ?? [];
  const right = q.matchRight ?? [];
  const cur: string[] = Array.isArray(value) ? value : left.map(() => "");
  const set = (i: number, v: string) => { const n = [...cur]; while (n.length < left.length) n.push(""); n[i] = v; onChange(n); };
  return (
    <div className="space-y-3">
      {left.map((l, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">{l}</span>
          <span className="text-slate-400">→</span>
          <select value={cur[i] ?? ""} onChange={(e) => set(i, e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-brand">
            <option value="">— таңдаңыз —</option>
            {right.map((r, j) => (<option key={j} value={r}>{r}</option>))}
          </select>
        </div>
      ))}
    </div>
  );
}

function ToolModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Calculator() {
  const [v, setV] = useState("");
  const calc = () => { try { const r = Function(`"use strict";return (${v.replace(/[^-0-9+*/.() ]/g, "")})`)(); setV(String(r)); } catch { setV("қате"); } };
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];
  return (
    <div>
      <input value={v} readOnly className="input-field mb-3 text-right font-mono text-lg" />
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => setV("")} className="col-span-4 rounded-lg bg-rose-50 py-2 font-semibold text-rose-600">C</button>
        {keys.map((k) => (
          <button key={k} onClick={() => (k === "=" ? calc() : setV((x) => x + k))}
            className={`rounded-lg py-3 font-semibold ${k === "=" ? "bg-brand text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}>{k}</button>
        ))}
      </div>
    </div>
  );
}

function UnitsTable() {
  const rows = [["Ұзындық", "метр (м)"], ["Масса", "килограмм (кг)"], ["Уақыт", "секунд (с)"], ["Күш", "Ньютон (Н)"], ["Жұмыс/Энергия", "Джоуль (Дж)"], ["Қуат", "Ватт (Вт)"], ["Қысым", "Паскаль (Па)"], ["Ток күші", "Ампер (А)"], ["Кернеу", "Вольт (В)"]];
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([a, b]) => (<tr key={a} className="border-b border-slate-100"><td className="py-2 text-slate-700">{a}</td><td className="py-2 text-right font-medium text-slate-900">{b}</td></tr>))}
      </tbody>
    </table>
  );
}

// Разбор ответов, сгруппированный по предметам (сворачиваемые секции)
function ReviewBySubject({ review }: { review: ReviewItem[] }) {
  const [onlyWrong, setOnlyWrong] = useState(false);

  // группируем по предмету в порядке появления вопросов
  const groups: { subject: string | null; items: { item: ReviewItem; index: number }[] }[] = [];
  review.forEach((item, index) => {
    const key = item.subject ?? "—";
    let g = groups.find((x) => (x.subject ?? "—") === key);
    if (!g) {
      g = { subject: item.subject ?? null, items: [] };
      groups.push(g);
    }
    g.items.push({ item, index });
  });

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-900">Жауаптарды талдау</h2>
        <button
          onClick={() => setOnlyWrong((v) => !v)}
          className={`badge ${onlyWrong ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}
        >
          {onlyWrong ? "Барлығын көрсету" : "Тек қателер"}
        </button>
      </div>

      {groups.map((g) => {
        const items = onlyWrong ? g.items.filter((x) => !x.item.correct) : g.items;
        const correct = g.items.filter((x) => x.item.correct).length;
        const wrong = g.items.length - correct;
        const gained = g.items.reduce((s, x) => s + x.item.gained, 0);
        const max = g.items.reduce((s, x) => s + x.item.points, 0);
        if (items.length === 0) return null;
        return (
          <details
            key={g.subject ?? "—"}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 truncate font-semibold text-slate-900">
                {subjectName(g.subject) || "Сұрақтар"}
              </span>
              <span className="flex shrink-0 items-center gap-2 text-sm">
                {wrong > 0 ? (
                  <span className="badge bg-rose-50 text-rose-600">{wrong} қате</span>
                ) : (
                  <span className="badge bg-emerald-50 text-emerald-600">Қатесіз ✓</span>
                )}
                <span className="hidden text-slate-500 sm:inline">
                  {correct}/{g.items.length} · {gained}/{max} балл
                </span>
                <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
              </span>
            </summary>
            <div className="space-y-4 border-t border-slate-100 bg-surface p-4">
              {items.map(({ item, index }) => (
                <ReviewCard key={item.questionId} item={item} index={index} />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function ReviewCard({ item, index }: { item: ReviewItem; index: number }) {
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm text-white ${item.correct ? "bg-emerald-500" : "bg-rose-500"}`}>{item.correct ? "✓" : "✕"}</span>
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {item.subject && <span className="badge bg-brand/10 text-brand">{subjectName(item.subject)}</span>}
            <span className="text-xs text-slate-400">{item.gained}/{item.points} балл</span>
          </div>
          {item.context && <div className="mb-2 whitespace-pre-line rounded-lg bg-surface p-3 text-sm text-slate-600">{item.context}</div>}
          <p className="font-medium text-slate-900">{index + 1}. {item.text}</p>
          {item.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.imageUrl} alt="" className="mt-3 max-h-60 rounded-lg border border-slate-200" />
          )}
          {item.type === "matching" && item.matchLeft ? (
            <div className="mt-3 space-y-2">
              {item.matchLeft.map((l, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="rounded-lg bg-surface px-3 py-1.5 text-slate-700">{l}</span>
                  <span className="text-slate-400">→</span>
                  <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-700">{item.matchRight?.[i]}</span>
                  {Array.isArray(item.userAnswer) && item.userAnswer[i] !== item.matchRight?.[i] && (
                    <span className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-600">сіз: {item.userAnswer[i] || "—"}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {item.options.map((opt, idx) => {
                const isRight = item.type === "multiple" ? (item.correctIndexes ?? []).includes(idx) : idx === item.correctIndex;
                const isUser = item.type === "multiple" ? Array.isArray(item.userAnswer) && item.userAnswer.includes(idx) : item.userAnswer === idx;
                return (
                  <div key={idx} className={`rounded-lg border px-3 py-2 text-sm ${isRight ? "border-emerald-300 bg-emerald-50 text-emerald-700" : isUser ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600"}`}>
                    {opt}{isRight && " ✓"}{isUser && !isRight && " — сіздің жауабыңыз"}
                  </div>
                );
              })}
            </div>
          )}
          {item.explanation && <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">💡 {item.explanation}</p>}
        </div>
      </div>
    </div>
  );
}
