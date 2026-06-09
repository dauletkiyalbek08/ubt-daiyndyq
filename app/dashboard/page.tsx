"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressChart } from "@/components/ProgressChart";
import { useAuth } from "@/components/AuthProvider";
import { api, PLAN_LABELS, type AchievementRow, type ResultRow, type UserStats } from "@/lib/api";
import { subjectName } from "@/lib/ent";
import { FileCheck2, BarChart3, Trophy, Target, TrendingUp, TrendingDown } from "lucide-react";
import { AchievementIcon } from "@/components/AchievementIcon";
import { Avatar } from "@/components/Avatar";

type Analytics = {
  weekly: { label: string; value: number }[];
  subjects: { subjectId: string; avg: number; count: number }[];
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<ResultRow[]>([]);
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Не вошёл — отправляем на страницу входа
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.myStats(), api.myResults(), api.achievements(), api.myAnalytics()])
      .then(([s, h, a, an]) => {
        setStats(s);
        setHistory(h);
        setAchievements(a);
        setAnalytics(an);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  // Сильные и слабые темы по предметам
  const ranked = analytics?.subjects ?? [];
  const strengths = ranked.filter((s) => s.avg >= 70).slice(0, 3);
  const weaknesses = [...ranked].reverse().filter((s) => s.avg < 60).slice(0, 3);

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  const metrics = [
    { label: "Аяқталған тесттер", value: stats?.testsCompleted ?? 0, icon: FileCheck2, grad: "from-brand to-brand-light" },
    { label: "Орташа балл", value: `${stats?.averageScore ?? 0}%`, icon: BarChart3, grad: "from-emerald-500 to-teal-500" },
    { label: "Үздік нәтиже", value: `${stats?.bestScore ?? 0}%`, icon: Trophy, grad: "from-amber-500 to-orange-500" },
    { label: "Дұрыс жауап", value: `${stats?.correctRate ?? 0}%`, icon: Target, grad: "from-rose-500 to-pink-500" },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={`${user.firstName} ${user.lastName ?? ""}`}
            avatarUrl={user.avatarUrl}
            className="h-14 w-14"
            textClass="text-xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Сәлем, {user.firstName}! 👋</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-brand/10 text-brand">
            Тариф: {PLAN_LABELS[user.plan ?? "free"]}
            {user.planPeriod ? (user.planPeriod === "year" ? " · Жыл" : " · 3 ай") : ""}
          </span>
          {user.planEndsAt && (() => {
            const days = Math.ceil((new Date(user.planEndsAt).getTime() - Date.now()) / 86400000);
            const soon = days <= 7;
            return (
              <span className={`badge ${soon ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                {days > 0 ? `Қалды ${days} күн` : "Мерзімі бітті"} · {new Date(user.planEndsAt).toLocaleDateString("ru-RU")}
              </span>
            );
          })()}
          <Link href="/profile" className="btn-secondary px-4 py-2 text-sm">
            ⚙️ Профиль
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-interactive">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.grad} text-white shadow-lg`}>
              <m.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {dataLoading ? "…" : m.value}
            </p>
            <p className="text-sm text-slate-500">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Прогресс (% дұрыс жауап)</h2>
          </div>
          <ProgressChart data={analytics?.weekly ?? []} />
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Пәндер бойынша талдау</h2>
          {ranked.length === 0 ? (
            <p className="text-sm text-slate-400">Тест тапсырғаннан кейін талдау пайда болады.</p>
          ) : (
            <>
              <div className="mb-4">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600"><TrendingUp className="h-4 w-4" /> Күшті жақтар</p>
                <div className="flex flex-wrap gap-2">
                  {strengths.length > 0 ? (
                    strengths.map((s) => (
                      <span key={s.subjectId} className="badge bg-emerald-50 text-emerald-600">
                        {subjectName(s.subjectId)} · {s.avg}%
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Әзірге жоқ</span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-rose-600"><TrendingDown className="h-4 w-4" /> Әлсіз тақырыптар</p>
                <div className="flex flex-wrap gap-2">
                  {weaknesses.length > 0 ? (
                    weaknesses.map((s) => (
                      <span key={s.subjectId} className="badge bg-rose-50 text-rose-600">
                        {subjectName(s.subjectId)} · {s.avg}%
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Жақсы! Әлсіз тақырып жоқ</span>
                  )}
                </div>
              </div>
            </>
          )}
          <Link href="/tests" className="btn-secondary mt-6 w-full text-sm">
            Тесттерге өту
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Нәтижелер тарихы</h2>
          {dataLoading ? (
            <p className="text-sm text-slate-400">Жүктелуде...</p>
          ) : history.length === 0 ? (
            <div className="rounded-xl bg-surface p-6 text-center text-sm text-slate-500">
              Әзірге нәтиже жоқ. <Link href="/tests" className="text-brand hover:underline">Бірінші тестті бастаңыз →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="pb-3 font-medium">Тест</th>
                    <th className="pb-3 font-medium">Нәтиже</th>
                    <th className="pb-3 font-medium">Күні</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => {
                    const pct = Math.round((row.score / Math.max(1, row.total)) * 100);
                    return (
                      <tr key={row.id} className="border-b border-slate-50">
                        <td className="py-3 font-medium text-slate-800">{row.testTitle}</td>
                        <td className="py-3">
                          <span
                            className={`badge ${
                              pct >= 70
                                ? "bg-emerald-50 text-emerald-600"
                                : pct >= 40
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {row.score}/{row.total}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(row.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Жетістіктер</h2>
            <Link href="/achievements" className="text-sm text-brand hover:underline">
              Барлығы
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {achievements.slice(0, 6).map((a) => (
              <div
                key={a.id}
                title={a.title}
                className={`flex flex-col items-center rounded-xl p-3 text-center ${
                  a.unlocked ? "bg-brand/5" : "bg-slate-50 opacity-40 grayscale"
                }`}
              >
                <AchievementIcon id={a.id} className={`h-6 w-6 ${a.unlocked ? "text-brand" : "text-slate-400"}`} />
                <span className="mt-1 text-[10px] leading-tight text-slate-600">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
