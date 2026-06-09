"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/Avatar";
import { api, ApiError, PLAN_LABELS } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  // Личные данные
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // Смена пароля
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  if (loading || !user) {
    return <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>;
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({ firstName, lastName, phone });
      setUser(updated);
      setProfileMsg("Деректер сақталды ✓");
    } catch (err) {
      setProfileErr(err instanceof ApiError ? err.message : "Сақтау қатесі");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg("");
    setPassErr("");
    setSavingPass(true);
    try {
      await api.changePassword({ currentPassword: currentPassword || undefined, newPassword });
      setPassMsg("Құпиясөз жаңартылды ✓");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPassErr(err instanceof ApiError ? err.message : "Қате");
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Профиль</h1>
      <p className="mt-2 text-slate-600">Жеке деректеріңізді басқарыңыз</p>

      {/* Сводка */}
      <div className="card mt-6 flex items-center gap-4">
        <Avatar
          name={`${user.firstName} ${user.lastName ?? ""}`}
          avatarUrl={user.avatarUrl}
          className="h-14 w-14"
          textClass="text-xl"
        />
        <div>
          <p className="font-semibold text-slate-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="ml-auto text-right">
          <span className="badge bg-brand/10 text-brand">
            {PLAN_LABELS[user.plan ?? "free"]}
            {user.planPeriod ? (user.planPeriod === "year" ? " · Жыл" : " · 3 ай") : ""}
          </span>
          {user.planEndsAt && (
            <p className="mt-1 text-xs text-slate-500">
              {(() => {
                const days = Math.ceil((new Date(user.planEndsAt).getTime() - Date.now()) / 86400000);
                return days > 0 ? `Қалды ${days} күн` : "Мерзімі бітті";
              })()}
            </p>
          )}
        </div>
      </div>

      {/* Личные данные */}
      <form onSubmit={saveProfile} className="card mt-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Жеке деректер</h2>
        {profileErr && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{profileErr}</div>}
        {profileMsg && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{profileMsg}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Аты</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Тегі</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Телефон</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (700) 000-00-00" className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input value={user.email} disabled className="input-field cursor-not-allowed bg-slate-50 text-slate-400" />
          <p className="mt-1 text-xs text-slate-400">Email өзгертілмейді</p>
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-60">
          {savingProfile ? "Сақталуда..." : "Сақтау"}
        </button>
      </form>

      {/* Смена пароля */}
      <form onSubmit={savePassword} className="card mt-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Құпиясөзді өзгерту</h2>
        {passErr && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{passErr}</div>}
        {passMsg && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passMsg}</div>}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Ағымдағы құпиясөз</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Соцсеть арқылы кірсеңіз — бос қалдырыңыз"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Жаңа құпиясөз</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Кемінде 6 таңба"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={savingPass} className="btn-primary disabled:opacity-60">
          {savingPass ? "Сақталуда..." : "Құпиясөзді жаңарту"}
        </button>
      </form>
    </div>
  );
}
