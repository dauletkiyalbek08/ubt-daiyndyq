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
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`card flex h-full flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover ${
            plan.popular ? "relative ring-2 ring-brand" : ""
          }`}
        >
          {plan.popular && (
            <span className="badge mb-3 w-fit bg-brand text-white shadow-glow">Танымал таңдау</span>
          )}
          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
          <p className="mt-4 text-3xl font-extrabold text-gradient">
            {plan.priceQuarter.toLocaleString("ru-RU")} ₸
            <span className="text-sm font-medium text-slate-500"> / 3 ай</span>
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-slate-700">
                <span className="text-emerald-500">✓</span> {f}
              </li>
            ))}
            {plan.excluded.map((f) => (
              <li key={f} className="flex items-start gap-2 text-slate-400 line-through">
                <span>✕</span> {f}
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
