"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  api,
  PLAN_LABELS,
  type ApiTest,
  type ApiTestFull,
  type AuthUser,
  type Plan,
} from "@/lib/api";
import { subjects } from "@/lib/mock-data";
import { CreateTestForm } from "@/components/CreateTestForm";
import { PlanEditor } from "@/components/PlanEditor";

type Tab = "stats" | "users" | "tests" | "plans";

type AdminStats = {
  totalUsers: number;
  students: number;
  admins: number;
  activeSubscriptions: number;
  premiumUsers: number;
  revenue: number;
  byPlan: { standard: number; premium: number };
  byPeriod: { quarter: number; year: number };
  totalAttempts: number;
  weekly: { label: string; count: number }[];
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiTestFull | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState("all");
  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ApiTest | null>(null);

  // Доступ только для админа
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  function reload() {
    api.adminStats().then(setStats).catch(() => {});
    api.listUsers().then(setUsers).catch(() => {});
    // обычные тесты + пробные ҰБТ (админ видит и управляет всеми)
    Promise.all([api.listTests({}), api.listTrials()])
      .then(([reg, tr]) => setTests([...tr.trials, ...reg]))
      .catch(() => {});
    api.allPlans().then(setPlansList).catch(() => {});
  }

  useEffect(() => {
    if (user?.role === "admin") reload();
  }, [user]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    await api.deleteTest(deleteTarget.id);
    setTests((t) => t.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  // Открыть тест на редактирование (загружаем с правильными ответами)
  async function handleEdit(id: string) {
    const full = await api.getTestFull(id);
    setShowForm(false);
    setEditing(full);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Выдать тариф пользователю (с периодом)
  async function handleSetPlan(id: string, plan: string, period: string) {
    const updated = await api.setUserPlan(id, plan, period);
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  }

  // Поиск + фильтр по тарифу
  const filteredUsers = users.filter((u) => {
    if (userPlanFilter !== "all" && (u.plan ?? "free") !== userPlanFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.phone ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Экспорт пользователей в CSV (открывается в Excel; UTF-8 BOM для кириллицы)
  function exportUsers() {
    const headers = ["Аты", "Тегі", "Email", "Телефон", "Рөлі", "Тариф", "Аяқталу", "Тіркелген"];
    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filteredUsers.map((u) =>
      [
        u.firstName,
        u.lastName ?? "",
        u.email,
        u.phone ?? "",
        u.role === "admin" ? "Әкімші" : "Оқушы",
        PLAN_LABELS[u.plan ?? "free"],
        u.planEndsAt ? new Date(u.planEndsAt).toLocaleDateString("ru-RU") : "",
        new Date(u.createdAt).toLocaleDateString("ru-RU"),
      ]
        .map(escape)
        .join(";")
    );
    const csv = "﻿" + [headers.map(escape).join(";"), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ent-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || user?.role !== "admin") {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "Статистика" },
    { id: "users", label: `Пайдаланушылар (${users.length})` },
    { id: "tests", label: `Тесттер (${tests.length})` },
    { id: "plans", label: "Тарифтер" },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900">Админ-панель</h1>
      <p className="mt-2 text-slate-600">Тесттерді, пайдаланушыларды және статистиканы басқару</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Статистика / Дашборд */}
      {tab === "stats" && (
        <div className="mt-8 space-y-6">
          {/* Ключевые метрики */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Доход (барлығы)", value: `${(stats?.revenue ?? 0).toLocaleString("ru-RU")} ₸`, icon: "💰", accent: "text-emerald-600" },
              { label: "Белсенді жазылымдар", value: stats?.activeSubscriptions ?? 0, icon: "⭐", accent: "text-brand" },
              { label: "Барлық пайдаланушы", value: stats?.totalUsers ?? 0, icon: "👥", accent: "text-brand" },
              { label: "Тест тапсырулар", value: stats?.totalAttempts ?? 0, icon: "📝", accent: "text-brand" },
            ].map((m) => (
              <div key={m.label} className="card">
                <div className="text-2xl">{m.icon}</div>
                <p className={`mt-2 text-2xl font-bold ${m.accent}`}>{m.value}</p>
                <p className="text-sm text-slate-500">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Прохождения по неделям */}
            <div className="card lg:col-span-2">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Прохождения по неделям</h2>
              {stats && stats.weekly.some((w) => w.count > 0) ? (
                <div className="flex h-48 items-end justify-between gap-2">
                  {stats.weekly.map((w, i) => {
                    const max = Math.max(...stats.weekly.map((x) => x.count), 1);
                    return (
                      <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{w.count}</span>
                        <div className="w-full origin-bottom animate-bar-grow rounded-t-lg bg-gradient-to-t from-brand to-brand-light"
                          style={{ height: `${(w.count / max) * 100}%`, minHeight: w.count > 0 ? "6px" : "0", animationDelay: `${i * 80}ms` }} />
                        <span className="text-xs text-slate-400">{w.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400">Әзірге деректер жоқ</div>
              )}
            </div>

            {/* Подписки по тарифам */}
            <div className="card">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Тарифтер бойынша</h2>
              <div className="space-y-3">
                {([
                  { id: "standard", label: "Стандарт", price: 5000 },
                  { id: "premium", label: "Премиум", price: 9990 },
                ] as const).map((p) => {
                  const count = stats?.byPlan?.[p.id] ?? 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{p.label}</p>
                        <p className="text-xs text-slate-500">{p.price.toLocaleString("ru-RU")} ₸</p>
                      </div>
                      <span className="text-xl font-bold text-brand">{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <div className="rounded-xl bg-surface px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-800">{stats?.byPeriod?.quarter ?? 0}</p>
                  <p className="text-xs text-slate-500">3 айлық</p>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-800">{stats?.byPeriod?.year ?? 0}</p>
                  <p className="text-xs text-slate-500">Жылдық</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">
                Тесттер базада: <span className="font-semibold text-slate-800">{tests.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Пользователи */}
      {tab === "users" && (
        <>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Аты, email немесе телефон бойынша іздеу..."
            className="input-field max-w-xs"
          />
          <select
            value={userPlanFilter}
            onChange={(e) => setUserPlanFilter(e.target.value)}
            className="input-field max-w-[180px]"
          >
            <option value="all">Барлық тарифтер</option>
            {["free", "standard", "premium"].map((p) => (
              <option key={p} value={p}>{PLAN_LABELS[p]}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">{filteredUsers.length} пайдаланушы</span>
          <button onClick={exportUsers} className="btn-secondary ml-auto px-4 py-2 text-sm">
            ⬇ Excel-ге экспорт
          </button>
        </div>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Аты-жөні</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Рөлі</th>
                <th className="pb-3 font-medium">Тариф</th>
                <th className="pb-3 font-medium">Мерзім</th>
                <th className="pb-3 font-medium">Аяқталу</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="py-3 font-medium text-slate-800">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-3 text-slate-500">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`badge ${
                        u.role === "admin" ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role === "admin" ? "Әкімші" : "Оқушы"}
                    </span>
                  </td>
                  <td className="py-3">
                    <select
                      value={u.plan ?? "free"}
                      onChange={(e) => handleSetPlan(u.id, e.target.value, u.planPeriod || "quarter")}
                      disabled={u.role === "admin"}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand disabled:opacity-50"
                    >
                      {["free", "standard", "premium"].map((p) => (
                        <option key={p} value={p}>
                          {PLAN_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    {u.plan && u.plan !== "free" ? (
                      <select
                        value={u.planPeriod ?? "quarter"}
                        onChange={(e) => handleSetPlan(u.id, u.plan!, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand"
                      >
                        <option value="quarter">3 ай</option>
                        <option value="year">Жыл</option>
                      </select>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-500">
                    {u.planEndsAt ? new Date(u.planEndsAt).toLocaleDateString("ru-RU") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Тесты */}
      {tab === "tests" && (
        <div className="mt-8">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setEditing(null);
                setShowForm((v) => !v);
              }}
              className="btn-primary"
            >
              {showForm ? "Жабу" : "+ Жаңа тест"}
            </button>
          </div>

          {(showForm || editing) && (
            <div className="mb-6">
              <CreateTestForm
                key={editing?.id ?? "new"}
                editTest={editing ?? undefined}
                onSaved={() => {
                  setShowForm(false);
                  setEditing(null);
                  reload();
                }}
              />
              {editing && (
                <button
                  onClick={() => setEditing(null)}
                  className="btn-secondary mt-3 w-full text-sm"
                >
                  Болдырмау
                </button>
              )}
            </div>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-3 font-medium">Атауы</th>
                  <th className="pb-3 font-medium">Пән</th>
                  <th className="pb-3 font-medium">Күрделілік</th>
                  <th className="pb-3 font-medium">Жыл</th>
                  <th className="pb-3 font-medium">Сұрақтар</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-800">
                      {t.title}
                      {t.isTrial && (
                        <span className="badge ml-2 bg-brand/10 text-brand">Пробное</span>
                      )}
                      {t.published === false && (
                        <span className="badge ml-2 bg-amber-50 text-amber-600">
                          ⏳ Жоспарланған
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">{subjectName(t.subjectId)}</td>
                    <td className="py-3 text-slate-500">{t.difficulty}</td>
                    <td className="py-3 text-slate-500">{t.year}</td>
                    <td className="py-3 text-slate-500">{t.questionsCount ?? 0}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleEdit(t.id)}
                        className="mr-4 text-sm font-medium text-brand hover:underline"
                      >
                        Өзгерту
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="text-sm font-medium text-rose-600 hover:underline"
                      >
                        Жою
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Тарифы */}
      {tab === "plans" && (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-slate-500">
            Бағаларды, атауларды және мүмкіндіктерді осы жерден өзгертіңіз — сайтта бірден көрінеді.
          </p>
          {plansList.map((p) => (
            <PlanEditor key={p.id} plan={p} onSaved={reload} />
          ))}
        </div>
      )}

      {/* Подтверждение удаления теста */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-3xl">🗑️</div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Тестті жою</h3>
            <p className="mt-2 text-sm text-slate-600">
              «{deleteTarget.title}» тестін жойғыңыз келе ме? Бұл әрекетті қайтару мүмкін емес.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">
                Болдырмау
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600"
              >
                Жою
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
