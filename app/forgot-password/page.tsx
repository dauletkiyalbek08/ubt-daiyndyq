"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <AuthShell
      title="Құпиясөзді қалпына келтіру"
      subtitle="Email-іңізге қалпына келтіру сілтемесін жібереміз"
      footer={
        <Link href="/login" className="font-semibold text-brand hover:underline">
          ← Кіру бетіне оралу
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">
          ✓ Сілтеме жіберілді! Email-іңізді тексеріңіз.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required placeholder="email@example.kz" className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full">
            Сілтеме жіберу
          </button>
        </form>
      )}
    </AuthShell>
  );
}
