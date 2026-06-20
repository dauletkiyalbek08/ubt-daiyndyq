"use client";

import { useEffect, useState } from "react";
import {
  api,
  type ApiTarau,
  type ApiTopic,
  type ApiTest,
  type TopicMaterial,
} from "@/lib/api";
import { ALL_SUBJECTS } from "@/lib/ent";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Plus,
  Presentation,
  Trash2,
} from "lucide-react";

// Управление разделом «Обучение»: предмет → тарау (главы) → темы.
// Тема содержит презентацию (PDF), книги (PDF) и тест.
export function LearnManager() {
  const [subject, setSubject] = useState(ALL_SUBJECTS[0].id);
  const [tarautar, setTarautar] = useState<ApiTarau[]>([]);
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [newTarau, setNewTarau] = useState("");
  const [newTarauDesc, setNewTarauDesc] = useState("");
  const [newTarauImage, setNewTarauImage] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  // Какую тему сейчас редактируем/создаём (tarauId + опц. сама тема)
  const [editing, setEditing] = useState<{ tarauId: string; topic?: ApiTopic } | null>(null);

  const refresh = () => api.learnManage(subject).then(setTarautar).catch(() => {});

  useEffect(() => {
    refresh();
    setEditing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  useEffect(() => {
    api.listTests({}).then(setTests).catch(() => {});
  }, []);

  async function addTarau() {
    if (!newTarau.trim()) return;
    await api.createTarau({
      subjectId: subject,
      title: newTarau.trim(),
      description: newTarauDesc.trim() || null,
      imageUrl: newTarauImage,
      order: tarautar.length,
    });
    setNewTarau("");
    setNewTarauDesc("");
    setNewTarauImage(null);
    refresh();
  }

  // Загрузка обложки для нового курса (до создания)
  async function uploadNewCover(file: File) {
    setUploadingCover(true);
    try {
      const { url } = await api.uploadImage(file);
      setNewTarauImage(url);
    } finally {
      setUploadingCover(false);
    }
  }

  // Поменять обложку существующего курса
  async function setCover(id: string, file: File) {
    const { url } = await api.uploadImage(file);
    await api.updateTarau(id, { imageUrl: url });
    refresh();
  }

  async function delTarau(id: string) {
    if (!confirm("Бұл тарауды барлық тақырыптарымен бірге жою керек пе?")) return;
    await api.deleteTarau(id);
    refresh();
  }

  async function delTopic(id: string) {
    if (!confirm("Тақырыпты жою керек пе?")) return;
    await api.deleteTopic(id);
    refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Выбор предмета */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-600">Пән:</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-field max-w-xs"
        >
          {ALL_SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Добавить курс (тарау) */}
      <div className="card space-y-3">
        <p className="font-semibold text-slate-800">Жаңа курс (тарау)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={newTarau}
            onChange={(e) => setNewTarau(e.target.value)}
            placeholder="Атауы: Ботаника"
            className="input-field"
          />
          <input
            value={newTarauDesc}
            onChange={(e) => setNewTarauDesc(e.target.value)}
            placeholder="Қысқаша сипаттама (міндетті емес)"
            className="input-field"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {newTarauImage ? (
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newTarauImage} alt="" className="h-10 w-16 rounded object-cover" />
              Мұқаба дайын
              <button onClick={() => setNewTarauImage(null)} className="text-rose-600 hover:underline">
                алып тастау
              </button>
            </span>
          ) : (
            <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
              Мұқаба (сурет)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadNewCover(e.target.files[0])}
              />
            </label>
          )}
          {uploadingCover && <span className="text-sm text-brand">Жүктелуде...</span>}
          <button onClick={addTarau} className="btn-primary ml-auto inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> Курс қосу
          </button>
        </div>
      </div>

      {/* Список тарау */}
      {tarautar.length === 0 && (
        <p className="text-sm text-slate-400">Әзірге тарау жоқ. Жоғарыдан қосыңыз.</p>
      )}

      {tarautar.map((tar) => (
        <div key={tar.id} className="card">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              {tar.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tar.imageUrl} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
              ) : (
                <BookOpen className="h-5 w-5 text-brand" />
              )}
              {tar.title}
            </h3>
            <div className="flex shrink-0 items-center gap-3">
              <label className="cursor-pointer text-sm font-medium text-brand hover:underline">
                Мұқаба
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setCover(tar.id, e.target.files[0])}
                />
              </label>
              <button
                onClick={() => delTarau(tar.id)}
                className="text-sm font-medium text-rose-600 hover:underline"
              >
                Жою
              </button>
            </div>
          </div>

          {/* Темы внутри тарау */}
          <div className="mt-4 space-y-2">
            {tar.topics.map((tp) => (
              <div
                key={tp.id}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-surface px-4 py-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {tp.order + 1}
                </span>
                <span className="font-medium text-slate-800">{tp.title}</span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {tp.presentationUrl && (
                    <span className="inline-flex items-center gap-1"><Presentation className="h-3.5 w-3.5" /> презентация</span>
                  )}
                  {!!tp.materials?.length && (
                    <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {tp.materials.length} кітап</span>
                  )}
                  {tp.testId && (
                    <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> тест</span>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => setEditing({ tarauId: tar.id, topic: tp })}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Өзгерту
                  </button>
                  <button
                    onClick={() => delTopic(tp.id)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Форма темы (создание/редактирование) */}
            {editing?.tarauId === tar.id ? (
              <TopicForm
                tarauId={tar.id}
                topic={editing.topic}
                tests={tests}
                defaultOrder={tar.topics.length}
                onSaved={() => {
                  setEditing(null);
                  refresh();
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <button
                onClick={() => setEditing({ tarauId: tar.id })}
                className="btn-secondary mt-2 inline-flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" /> Тақырып қосу
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Форма создания/редактирования темы
function TopicForm({
  tarauId,
  topic,
  tests,
  defaultOrder,
  onSaved,
  onCancel,
}: {
  tarauId: string;
  topic?: ApiTopic;
  tests: ApiTest[];
  defaultOrder: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(topic?.title ?? "");
  const [order, setOrder] = useState(topic?.order ?? defaultOrder);
  const [passPercent, setPassPercent] = useState(topic?.passPercent ?? 70);
  const [presentationUrl, setPresentationUrl] = useState<string | null>(
    topic?.presentationUrl ?? null
  );
  const [materials, setMaterials] = useState<TopicMaterial[]>(topic?.materials ?? []);
  const [testId, setTestId] = useState<string | null>(topic?.testId ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function uploadPresentation(file: File) {
    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadDoc(file);
      setPresentationUrl(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function addMaterial(file: File) {
    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadDoc(file);
      setMaterials((m) => [...m, { title: file.name.replace(/\.pdf$/i, ""), url }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!title.trim()) {
      setError("Тақырып атауын жазыңыз");
      return;
    }
    setSaving(true);
    setError("");
    const body = {
      title: title.trim(),
      order: Number(order),
      passPercent: Number(passPercent),
      presentationUrl,
      materials,
      testId: testId || null,
    };
    try {
      if (topic) await api.updateTopic(topic.id, body);
      else await api.createTopic({ tarauId, ...body });
      onSaved();
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-brand/30 bg-white p-4">
      <p className="mb-3 font-semibold text-slate-800">
        {topic ? "Тақырыпты өзгерту" : "Жаңа тақырып"}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-600">Тақырып атауы</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Мысалы: Анықталмаған интеграл"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Реті (порядок)</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Өту шегі, %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={passPercent}
            onChange={(e) => setPassPercent(Number(e.target.value))}
            className="input-field"
          />
        </div>
      </div>

      {/* Презентация (PDF) */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-slate-600">Презентация (PDF)</label>
        {presentationUrl ? (
          <div className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 text-sm">
            <Presentation className="h-4 w-4 text-brand" />
            <a href={presentationUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
              Қарау
            </a>
            <button
              onClick={() => setPresentationUrl(null)}
              className="ml-auto text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="btn-secondary inline-flex cursor-pointer items-center gap-1 text-sm">
            Файл таңдау (PDF)
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadPresentation(e.target.files[0])}
            />
          </label>
        )}
      </div>

      {/* Книги (несколько PDF) */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-slate-600">Кітаптар / материалдар (PDF)</label>
        <div className="space-y-2">
          {materials.map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-brand" />
              <input
                value={m.title}
                onChange={(e) =>
                  setMaterials((arr) =>
                    arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x))
                  )
                }
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline">
                ашу
              </a>
              <button
                onClick={() => setMaterials((arr) => arr.filter((_, j) => j !== i))}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <label className="btn-secondary mt-2 inline-flex cursor-pointer items-center gap-1 text-sm">
          <Plus className="h-4 w-4" /> Кітап қосу (PDF)
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && addMaterial(e.target.files[0])}
          />
        </label>
      </div>

      {/* Тест темы */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-slate-600">Тақырып тесті</label>
        <select
          value={testId ?? ""}
          onChange={(e) => setTestId(e.target.value || null)}
          className="input-field"
        >
          <option value="">— тест таңдалмаған —</option>
          {tests.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Тестті алдымен «Тесттер» бөлімінде жасап, осында таңдаңыз.
        </p>
      </div>

      {uploading && <p className="mt-3 text-sm text-brand">Жүктелуде...</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button onClick={save} disabled={saving || uploading} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? "Сақталуда..." : "Сақтау"}
        </button>
        <button onClick={onCancel} className="btn-secondary flex-1">
          Болдырмау
        </button>
      </div>
    </div>
  );
}
