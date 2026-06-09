"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuth } from "@/components/SocialAuth";
import { useAuth } from "@/components/AuthProvider";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Кіру қатесі");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Аккаунтқа кіру"
      subtitle="Жеке кабинетке кіру үшін деректеріңізді енгізіңіз"
      footer={
        <>
          Аккаунтыңыз жоқ па?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Тіркелу
          </Link>
        </>
      }
    >
      <SocialAuth action="login" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email немесе логин</label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.kz немесе admin"
            className="input-field"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Құпиясөз</label>
            <Link href="/forgot-password" className="text-sm text-brand hover:underline">
              Ұмыттыңыз ба?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Жасыру" : "Көрсету"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Кіруде..." : "Кіру"}
        </button>
      </form>
    </AuthShell>
  );
}
