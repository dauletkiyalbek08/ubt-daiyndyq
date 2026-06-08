"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuth } from "@/components/SocialAuth";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Делим отображаемое имя на имя и фамилию (как ожидает бэкенд)
      const parts = name.trim().split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ");
      await register({ firstName, lastName, email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Тіркелу қатесі");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Тіркелгі жасау"
      subtitle="Жаңа аккаунт ашып, ҰБТ-ға дайындықты бастаңыз"
      footer={
        <>
          Тіркелгіңіз бар ма?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Кіру
          </Link>
        </>
      }
    >
      <SocialAuth action="register" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Көрсетілетін аты
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Арман Қойшыбаев"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Электрондық пошта
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Құпия сөз</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Кемінде 6 таңба"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Тіркелуде..." : "Тіркелу"}
        </button>
      </form>
    </AuthShell>
  );
}
