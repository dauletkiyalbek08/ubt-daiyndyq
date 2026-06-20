"use client";

import { useEffect, useState } from "react";
import { api, type Webinar } from "@/lib/api";
import { Calendar, Plus, Trash2, Video } from "lucide-react";

// Управление вебинарами (админ): тема + дата + ссылка.
export function WebinarsManager() {
  const [list, setList] = useState<Webinar[]>([]);
  const [form, setForm] = useState({
    title: "",
    speaker: "",
    description: "",
    startsAt: "",
    link: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () =>
    api.listWebinars().then((d) => setList(d.webinars)).catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  async function add() {
    if (!form.title.trim() || !form.startsAt || !form.link.trim()) {
      setError("Тақырып, күні және сілтеме қажет");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.createWebinar({
        title: form.title.trim(),
        speaker: form.speaker.trim() || null,
        description: form.description.trim() || null,
        startsAt: new Date(form.startsAt).toISOString(),
        link: form.link.trim(),
      });
      setForm({ title: "", speaker: "", description: "", startsAt: "", link: "" });
      refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Вебинарды жою керек пе?")) return;
    await api.deleteWebinar(id);
    refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Форма добавления */}
      <div className="card space-y-3">
        <p className="font-semibold text-slate-800">Жаңа вебинар</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Тақырыбы: Пробный ҰБТ нұсқа талдау"
            className="input-field"
          />
          <input
            value={form.speaker}
            onChange={(e) => setForm({ ...form, speaker: e.target.value })}
            placeholder="Мұғалім (міндетті емес)"
            className="input-field"
          />
          <div>
            <label className="mb-1 block text-xs text-slate-500">Күні мен уақыты</label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Сілтеме (Zoom / YouTube)</label>
            <input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
              className="input-field"
            />
          </div>
        </div>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Сипаттама (міндетті емес)"
          rows={2}
          className="input-field"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          onClick={add}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {saving ? "Сақталуда..." : "Вебинар қосу"}
        </button>
      </div>

      {/* Список */}
      {list.length === 0 && (
        <p className="text-sm text-slate-400">Әзірге вебинарлар жоқ.</p>
      )}
      <div className="space-y-3">
        {list.map((w) => (
          <div
            key={w.id}
            className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${
              w.isPast ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Video className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{w.title}</p>
              <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(w.startsAt).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {w.speaker && <span>· {w.speaker}</span>}
                {w.isPast && <span>· өтті</span>}
              </p>
              {w.link && (
                <a
                  href={w.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand hover:underline"
                >
                  {w.link}
                </a>
              )}
            </div>
            <button
              onClick={() => del(w.id)}
              className="text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
