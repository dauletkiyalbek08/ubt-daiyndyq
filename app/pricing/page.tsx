"use client";

import { useEffect, useState } from "react";
import { api, type Plan } from "@/lib/api";
import { PageTitle } from "@/components/PageTitle";

type Billing = "quarter" | "year";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₸";

const faq = [
  { q: "Төлемді қалай жасаймын?", a: "Kaspi QR немесе Kaspi онлайн арқылы. Төлемнен кейін жазылым автоматты түрде белсендіріледі." },
  { q: "3 ай мен жылдық тарифтің айырмашылығы неде?", a: "Мазмұны бірдей. Жылдық тарифте 30% үнемдейсіз — бір жылға бірден төлейсіз." },
  { q: "Стандарт пен Премиумның айырмашылығы?", a: "Стандартта — тесттер мен статистика. Премиумда қосымша апта сайынғы Пробное ҰБТ, рейтинг және жетістіктер бар." },
  { q: "Ақшаны қайтаруға бола ма?", a: "Алғашқы 3 күн ішінде, егер тест тапсырмаған болсаңыз, ақшаны қайтарамыз." },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("quarter");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api.plans().then(setPlans).catch(() => {});
  }, []);

  const priceOf = (p: Plan) => (billing === "year" ? p.priceYear : p.priceQuarter);
  const periodLabel = billing === "year" ? "жыл" : "3 ай";

  return (
    <div className="container-page py-10">
      <PageTitle title="Тарифтер" />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Тарифтер</h1>
        <p className="mt-3 text-slate-600">Дайындықты бастау үшін қолайлы жоспарды таңдаңыз</p>
      </div>

      {/* Переключатель периода */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setBilling("quarter")}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${billing === "quarter" ? "bg-brand text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            3 ай
          </button>
          <button
            onClick={() => setBilling("year")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition ${billing === "year" ? "bg-brand text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Жыл
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${billing === "year" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"}`}>−30%</span>
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2 md:items-start">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card relative flex flex-col ${
              plan.popular ? "border-brand ring-2 ring-brand shadow-glow md:-mt-2" : ""
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-brand to-brand-light px-4 py-1 text-xs font-bold text-white shadow-glow">
                ⭐ Танымал таңдау
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>

            <div className="mt-4">
              <span className="text-4xl font-extrabold text-gradient">{fmt(priceOf(plan))}</span>
              <span className="text-sm text-slate-500"> / {periodLabel}</span>
            </div>
            {billing === "year" && (
              <p className="mt-1 text-xs font-medium text-emerald-600">
                3 айлықпен салыстырғанда {fmt(plan.priceQuarter * 4 - plan.priceYear)} үнемдейсіз
              </p>
            )}

            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-slate-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
              {plan.excluded.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-slate-400">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px]">
                    ✕
                  </span>
                  <span className="line-through">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelected(plan)}
              className={`mt-6 w-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}
            >
              Таңдау
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">Жиі қойылатын сұрақтар</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.q} className="card group">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900">
                {item.q}
                <span className="text-brand transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Модальное окно оплаты (Kaspi) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Төлем</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="mt-4 rounded-xl bg-surface p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Тариф</span>
                <span className="font-medium text-slate-900">{selected.name} · {periodLabel}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">Сома</span>
                <span className="text-xl font-bold text-brand">{fmt(priceOf(selected))}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-5xl">📱</div>
              <p className="mt-3 text-center text-sm text-slate-500">Kaspi QR-ды сканерлеңіз немесе онлайн төлеңіз</p>
            </div>

            <div className="mt-5 space-y-2">
              <button className="btn-primary w-full" style={{ backgroundColor: "#F14635" }}>Kaspi-мен төлеу</button>
              <button onClick={() => setSelected(null)} className="btn-secondary w-full">Бас тарту</button>
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">Төлемнен кейін жазылым автоматты белсендіріледі (демо)</p>
          </div>
        </div>
      )}
    </div>
  );
}
