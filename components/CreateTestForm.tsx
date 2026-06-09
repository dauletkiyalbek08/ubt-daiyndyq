"use client";

import { useState } from "react";
import { api, type ApiTestFull } from "@/lib/api";
import { subjects } from "@/lib/mock-data";
import { ALL_SUBJECTS, SUBJECTS } from "@/lib/ent";

// Карта: код или название предмета (в любом регистре) → код предмета.
// Позволяет писать в таблице «Биология» или «biology», а также брать предмет
// из названия листа Excel.
const SUBJECT_BY_NAME: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  Object.entries(SUBJECTS).forEach(([code, v]) => {
    m[code.toLowerCase()] = code;
    m[v.name.toLowerCase()] = code;
  });
  return m;
})();
const subjectCode = (s: string) => SUBJECT_BY_NAME[(s ?? "").trim().toLowerCase()];

type QType = "single" | "context" | "matching" | "multiple";

type QForm = {
  type: QType;
  text: string;
  context: string;
  options: string[];
  correctIndex: number;
  correctIndexes: number[];
  matchLeft: string[];
  matchRight: string[];
  points: number;
  explanation: string;
  imageUrl: string;
  subject: string;
  uploading?: boolean;
};

const emptyQuestion = (): QForm => ({
  type: "single",
  text: "",
  context: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  correctIndexes: [],
  matchLeft: ["", ""],
  matchRight: ["", ""],
  points: 1,
  explanation: "",
  imageUrl: "",
  subject: "",
});

export function CreateTestForm({
  editTest,
  onSaved,
}: {
  editTest?: ApiTestFull;
  onSaved: () => void;
}) {
  const isEdit = !!editTest;

  const [title, setTitle] = useState(editTest?.title ?? "");
  const [subjectId, setSubjectId] = useState(editTest?.subjectId ?? subjects[0].id);
  // Сложность и год убраны из интерфейса — задаём значения по умолчанию для бэкенда
  const difficulty = editTest?.difficulty ?? "Орташа";
  const year = editTest?.year ?? new Date().getFullYear();
  const [topic, setTopic] = useState(editTest?.topic ?? "");
  const [durationMin, setDurationMin] = useState(editTest?.durationMin ?? 30);
  const [isTrial, setIsTrial] = useState(editTest?.isTrial ?? false);
  const [weekLabel, setWeekLabel] = useState(editTest?.weekLabel ?? "");
  const [publishAt, setPublishAt] = useState("");
  const [questions, setQuestions] = useState<QForm[]>(
    editTest && editTest.questions.length > 0
      ? editTest.questions.map((q) => ({
          type: (q.type as QType) ?? "single",
          text: q.text,
          context: q.context ?? "",
          options: q.options?.length ? q.options : ["", "", "", ""],
          correctIndex: q.correctIndex ?? 0,
          correctIndexes: q.correctIndexes ?? [],
          matchLeft: q.matchLeft ?? ["", ""],
          matchRight: q.matchRight ?? ["", ""],
          points: q.points ?? 1,
          explanation: q.explanation ?? "",
          imageUrl: q.imageUrl ?? "",
          subject: q.subject ?? "",
        }))
      : [emptyQuestion()]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const upd = (i: number, patch: Partial<QForm>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  // Буквы/цифры правильных ответов → индексы: "B" → [1], "A,C" → [0,2]
  function answersToIdx(raw: string): number[] {
    return raw
      .split(/[,;\s]+/)
      .filter(Boolean)
      .map((tok) => {
        const up = tok.toUpperCase();
        if (/^[A-H]$/.test(up)) return up.charCodeAt(0) - 65;
        const n = parseInt(tok, 10);
        return Number.isNaN(n) ? -1 : n - 1; // допускаем номера (1 = A)
      })
      .filter((i) => i >= 0);
  }

  // Одна строка таблицы → вопрос. Колонки: предмет | вопрос | A | B | … | дұрыс
  function rowToQuestion(cellsRaw: (string | number)[]): QForm | null {
    const cells = cellsRaw.map((c) => String(c ?? "").trim());
    while (cells.length && cells[cells.length - 1] === "") cells.pop();
    if (cells.length < 4) return null;
    const subject = subjectCode(cells[0]) ?? cells[0];
    const text = cells[1];
    const correctRaw = cells[cells.length - 1];
    const options = cells.slice(2, cells.length - 1);
    const correctIdx = answersToIdx(correctRaw).filter((i) => i < options.length);
    if (options.length < 2 || correctIdx.length === 0) return null;
    const isMulti = correctIdx.length > 1;
    return {
      ...emptyQuestion(),
      type: isMulti ? "multiple" : "single",
      text,
      options,
      correctIndex: isMulti ? 0 : correctIdx[0],
      correctIndexes: isMulti ? correctIdx : [],
      points: isMulti ? 3 : 1,
      subject,
    };
  }

  const isHeader = (first: string) => /предмет|пән|subject/i.test((first ?? "").trim());

  // Добавляем распознанные вопросы в форму
  function applyParsed(parsed: QForm[], skipped: number) {
    if (parsed.length === 0) {
      setImportMsg("Қате: бірде-бір жол танылмады (бағандарды тексеріңіз)");
      return;
    }
    setQuestions((qs) => {
      const onlyEmpty =
        qs.length === 1 && qs[0].text.trim() === "" && qs[0].options.every((o) => !o.trim());
      return onlyEmpty ? parsed : [...qs, ...parsed];
    });
    setImportText("");
    setImportMsg(`✓ ${parsed.length} сұрақ қосылды${skipped ? ` · ${skipped} жол өткізілді` : ""}`);
  }

  // Импорт из вставленного текста (Tab из Excel/Sheets либо «|» вручную)
  function parseImport() {
    setImportMsg("");
    const lines = importText.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) {
      setImportMsg("Кірістіретін жол жоқ");
      return;
    }
    const parsed: QForm[] = [];
    let skipped = 0;
    lines.forEach((line, idx) => {
      const sep = line.includes("\t") ? "\t" : "|";
      const cells = line.split(sep);
      if (idx === 0 && isHeader(cells[0])) return;
      const q = rowToQuestion(cells);
      if (q) parsed.push(q);
      else skipped++;
    });
    applyParsed(parsed, skipped);
  }

  // Импорт из файла .xlsx / .xls / .csv
  async function handleImportFile(file?: File) {
    if (!file) return;
    setImportMsg("Файл оқылуда...");
    try {
      const XLSX = await import("xlsx");
      // CSV читаем строго как UTF-8 (иначе казахские/русские буквы ломаются),
      // .xlsx — как бинарный массив (текст внутри уже UTF-8).
      const isCsv = /\.csv$/i.test(file.name);
      const wb = isCsv
        ? XLSX.read(await file.text(), { type: "string" })
        : XLSX.read(await file.arrayBuffer(), { type: "array" });

      const parsed: QForm[] = [];
      let skipped = 0;
      // Читаем ВСЕ листы. Предмет берём из колонки, либо из названия листа.
      wb.SheetNames.forEach((sheetName) => {
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
          header: 1,
          blankrows: false,
        });
        const sheetSubj = subjectCode(sheetName); // напр. лист «Биология» → biology
        rows.forEach((row, idx) => {
          const cells = (Array.isArray(row) ? row : []).map((c) => String(c ?? ""));
          if (cells.every((c) => !c.trim())) return;
          if (idx === 0 && isHeader(cells[0])) return;
          // если первая ячейка — предмет, формат «предмет|вопрос|…», иначе берём предмет листа
          const q = subjectCode(cells[0])
            ? rowToQuestion(cells)
            : sheetSubj
            ? rowToQuestion([sheetSubj, ...cells])
            : rowToQuestion(cells);
          if (q) parsed.push(q);
          else skipped++;
        });
      });
      applyParsed(parsed, skipped);
    } catch {
      setImportMsg("Файлды оқу қатесі (.xlsx немесе .csv жүктеңіз)");
    }
  }

  async function handleImage(qi: number, file?: File) {
    if (!file) return;
    upd(qi, { uploading: true });
    try {
      const { url } = await api.uploadImage(file);
      upd(qi, { imageUrl: url, uploading: false });
    } catch (err) {
      upd(qi, { uploading: false });
      setError(err instanceof Error ? err.message : "Сурет жүктелмеді");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    for (const q of questions) {
      if (!q.text.trim()) return setError("Сұрақ мәтінін толтырыңыз");
      if (q.type === "matching") {
        if (q.matchLeft.some((x) => !x.trim()) || q.matchRight.some((x) => !x.trim()))
          return setError("Сәйкестендіру жұптарын толтырыңыз");
      } else if (q.type === "multiple") {
        if (q.options.filter((o) => o.trim()).length < 2) return setError("Кемінде 2 нұсқа қажет");
        if (q.correctIndexes.length < 1) return setError("Дұрыс жауап(тар)ды белгілеңіз");
      } else {
        if (q.options.filter((o) => o.trim()).length < 2) return setError("Кемінде 2 нұсқа қажет");
      }
    }

    setSaving(true);
    const body = {
      title,
      subjectId,
      difficulty,
      year: Number(year),
      topic,
      durationMin: Number(durationMin),
      isTrial,
      weekLabel: isTrial ? weekLabel || undefined : undefined,
      publishAt: !isEdit && publishAt ? new Date(publishAt).toISOString() : undefined,
      questions: questions.map((q) => {
        const base: any = {
          type: q.type,
          text: q.text,
          explanation: q.explanation || undefined,
          imageUrl: q.imageUrl || undefined,
          subject: q.subject || undefined,
          context: q.type === "context" ? q.context || undefined : undefined,
        };
        if (q.type === "matching") {
          return { ...base, matchLeft: q.matchLeft, matchRight: q.matchRight, points: 1, options: [] };
        }
        if (q.type === "multiple") {
          return { ...base, options: q.options.filter((o) => o.trim()), correctIndexes: q.correctIndexes, points: q.points || 3 };
        }
        return { ...base, options: q.options.filter((o) => o.trim()), correctIndex: q.correctIndex, points: 1 };
      }),
    };
    try {
      if (isEdit) await api.updateTest(editTest!.id, body);
      else await api.createTest(body);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сақтау қатесі");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <h3 className="text-lg font-bold text-slate-900">{isEdit ? "Тестті өзгерту" : "Жаңа тест құру"}</h3>
      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Атауы</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Пән</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input-field">
            {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Тақырып</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Уақыт (мин)</label>
          <input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="input-field" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand" />
          <span>
            <span className="font-medium text-slate-900">Бұл — Пробное ҰБТ (апталық)</span>
            <span className="block text-sm text-slate-500">Премиум үшін, рейтингке кіреді</span>
          </span>
        </label>
        {isTrial && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} className="input-field" placeholder="Апта: 2026-W23" />
            {!isEdit && <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="input-field" />}
          </div>
        )}
      </div>

      {/* Импорт из Excel */}
      <div className="rounded-xl border border-slate-200 bg-surface p-4">
        <h4 className="font-semibold text-slate-900">Сұрақтарды импорттау</h4>
        <p className="mt-1 text-xs text-slate-500">
          Бағандар: <b>предмет · сұрақ · A · B · C · D · … · дұрыс</b>. «Дұрыс» — соңғы баған
          (бір әріп <code>B</code>; бірнеше жауап <code>A,C</code>).
        </p>

        {/* Загрузка файла */}
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">
          📄 Файл жүктеу (.xlsx, .csv)
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              handleImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>

        {/* Или вставить текстом */}
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-500">
            немесе мәтінмен қою (Excel-ден көшіру)
          </summary>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
            className="input-field mt-2 font-mono text-xs"
            placeholder={"history\tҚазақ хандығы қашан құрылды?\t1456\t1465\t1470\t1480\tB"}
          />
          <button type="button" onClick={parseImport} className="btn-secondary mt-2 text-sm">
            Қосу
          </button>
        </details>

        {importMsg && <p className="mt-2 text-xs font-medium text-slate-600">{importMsg}</p>}
      </div>

      {/* Вопросы */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900">Сұрақтар</h4>
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">Сұрақ {qi + 1}</span>
              <div className="flex items-center gap-2">
                <select value={q.type} onChange={(e) => upd(qi, { type: e.target.value as QType, points: e.target.value === "multiple" ? 3 : 1 })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
                  <option value="single">Бір жауап</option>
                  <option value="context">Мәтін бойынша</option>
                  <option value="matching">Сәйкестендіру</option>
                  <option value="multiple">Бірнеше жауап</option>
                </select>
                {questions.length > 1 && (
                  <button type="button" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} className="text-sm text-rose-600 hover:underline">Жою</button>
                )}
              </div>
            </div>

            {isTrial && (
              <select value={q.subject} onChange={(e) => upd(qi, { subject: e.target.value })} className="input-field mb-3">
                <option value="">— пәнді таңдаңыз —</option>
                {ALL_SUBJECTS.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            )}

            {q.type === "context" && (
              <textarea value={q.context} onChange={(e) => upd(qi, { context: e.target.value })} className="input-field mb-3" rows={3} placeholder="Мәтін / кесте / график сипаттамасы" />
            )}

            <input value={q.text} onChange={(e) => upd(qi, { text: e.target.value })} className="input-field mb-3" placeholder="Сұрақ мәтіні" />

            {/* Картинка */}
            <div className="mb-3">
              {q.imageUrl ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.imageUrl} alt="" className="max-h-40 rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => upd(qi, { imageUrl: "" })} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs text-white">✕</button>
                </div>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-brand">
                  {q.uploading ? "Жүктелуде..." : "🖼️ Сурет"}
                  <input type="file" accept="image/*" className="hidden" disabled={q.uploading} onChange={(e) => handleImage(qi, e.target.files?.[0])} />
                </label>
              )}
            </div>

            {/* Варианты по типу */}
            {q.type === "matching" ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Сол ↔ оң баған (дұрыс жұптарды жазыңыз)</p>
                {q.matchLeft.map((l, pi) => (
                  <div key={pi} className="flex items-center gap-2">
                    <input value={l} onChange={(e) => upd(qi, { matchLeft: q.matchLeft.map((x, j) => (j === pi ? e.target.value : x)) })} className="input-field" placeholder={`Сол ${pi + 1}`} />
                    <span className="text-slate-400">↔</span>
                    <input value={q.matchRight[pi] ?? ""} onChange={(e) => upd(qi, { matchRight: q.matchRight.map((x, j) => (j === pi ? e.target.value : x)) })} className="input-field" placeholder={`Оң ${pi + 1}`} />
                    {q.matchLeft.length > 2 && (
                      <button type="button" onClick={() => upd(qi, { matchLeft: q.matchLeft.filter((_, j) => j !== pi), matchRight: q.matchRight.filter((_, j) => j !== pi) })} className="text-rose-600">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => upd(qi, { matchLeft: [...q.matchLeft, ""], matchRight: [...q.matchRight, ""] })} className="text-sm text-brand hover:underline">+ жұп қосу</button>
              </div>
            ) : (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    {q.type === "multiple" ? (
                      <input type="checkbox" checked={q.correctIndexes.includes(oi)}
                        onChange={() => upd(qi, { correctIndexes: q.correctIndexes.includes(oi) ? q.correctIndexes.filter((x) => x !== oi) : [...q.correctIndexes, oi] })}
                        className="h-4 w-4" title="Дұрыс жауап" />
                    ) : (
                      <input type="radio" name={`c-${qi}`} checked={q.correctIndex === oi} onChange={() => upd(qi, { correctIndex: oi })} className="h-4 w-4" title="Дұрыс жауап" />
                    )}
                    <input value={opt} onChange={(e) => upd(qi, { options: q.options.map((o, j) => (j === oi ? e.target.value : o)) })} className="input-field" placeholder={`${String.fromCharCode(65 + oi)} нұсқасы`} />
                    {q.options.length > 2 && (
                      <button type="button" onClick={() => upd(qi, { options: q.options.filter((_, j) => j !== oi) })} className="text-rose-600">✕</button>
                    )}
                  </div>
                ))}
                {q.type === "multiple" && q.options.length < 6 && (
                  <button type="button" onClick={() => upd(qi, { options: [...q.options, ""] })} className="text-sm text-brand hover:underline">+ нұсқа қосу</button>
                )}
                <p className="text-xs text-slate-400">{q.type === "multiple" ? "☑ Дұрыс жауаптарды белгілеңіз" : "◉ Дұрыс жауапты белгілеңіз"}</p>
              </div>
            )}

            <input value={q.explanation} onChange={(e) => upd(qi, { explanation: e.target.value })} className="input-field mt-3" placeholder="Түсіндірме (міндетті емес)" />
          </div>
        ))}
        <button type="button" onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])} className="btn-secondary w-full text-sm">+ Сұрақ қосу</button>
      </div>

      {/* Закреплённая панель сохранения — видна при прокрутке длинного теста */}
      <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <span className="text-sm font-medium text-slate-600">{questions.length} сұрақ</span>
        <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-60">
          {saving ? "Сақталуда..." : isEdit ? "Өзгерістерді сақтау" : "Тестті сақтау"}
        </button>
      </div>
    </form>
  );
}
