"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Plan } from "@/lib/api";

export function PlansPreview() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api.plans().then(setPlans).catch(() => {});
  }, []);

  if (plans.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2 md:items-start">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`card relative flex h-full flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover ${
            plan.popular ? "border-brand ring-2 ring-brand shadow-glow md:-mt-2" : ""
          }`}
        >
          {plan.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-brand to-brand-light px-4 py-1 text-xs font-bold text-white shadow-glow">
              ⭐ Танымал таңдау
            </span>
          )}
          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
          <p className="mt-4 text-3xl font-extrabold text-gradient">
            {plan.priceQuarter.toLocaleString("ru-RU")} ₸
            <span className="text-sm font-medium text-slate-500"> / 3 ай</span>
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
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
          <Link href="/pricing" className={`mt-6 w-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}>
            Таңдау
          </Link>
        </div>
      ))}
    </div>
  );
}
