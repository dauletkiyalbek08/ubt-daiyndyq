"use client";

import { useState } from "react";
import { api, type Plan } from "@/lib/api";

export function PlanEditor({ plan, onSaved }: { plan: Plan; onSaved: () => void }) {
  const [name, setName] = useState(plan.name);
  const [priceQuarter, setPriceQuarter] = useState(plan.priceQuarter);
  const [priceYear, setPriceYear] = useState(plan.priceYear);
  const [popular, setPopular] = useState(plan.popular);
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const [excluded, setExcluded] = useState(plan.excluded.join("\n"));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await api.updatePlan(plan.id, {
        name,
        priceQuarter: Number(priceQuarter),
        priceYear: Number(priceYear),
        popular,
        features: features.split("\n").map((s) => s.trim()).filter(Boolean),
        excluded: excluded.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      setMsg("Сақталды ✓");
      onSaved();
    } catch {
      setMsg("Қате");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <span className="badge bg-slate-100 text-slate-500">{plan.code}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-600">Атауы</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
          <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand" />
          «Танымал» белгісі
        </label>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Баға / 3 ай (₸)</label>
          <input type="number" value={priceQuarter} onChange={(e) => setPriceQuarter(Number(e.target.value))} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Баға / жыл (₸)</label>
          <input type="number" value={priceYear} onChange={(e) => setPriceYear(Number(e.target.value))} className="input-field" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-600">Мүмкіндіктер (әр жолда біреу)</label>
          <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={5} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Кірмейді (әр жолда біреу)</label>
          <textarea value={excluded} onChange={(e) => setExcluded(e.target.value)} rows={5} className="input-field" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Сақталуда..." : "Сақтау"}
        </button>
        {msg && <span className="text-sm text-emerald-600">{msg}</span>}
      </div>
    </div>
  );
}
