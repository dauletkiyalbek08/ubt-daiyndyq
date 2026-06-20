"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type LearnOverview, type WebinarList } from "@/lib/api";
import { ALL_SUBJECTS, subjectIcon } from "@/lib/ent";
import { BookOpen, Calendar, Crown, Radio, Video } from "lucide-react";

type Tab = "courses" | "webinars";

export default function LearnPage() {
  const [tab, setTab] = useState<Tab>("courses");
  const [subject, setSubject] = useState(ALL_SUBJECTS[0].id);
  const [data, setData] = useState<LearnOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [webinars, setWebinars] = useState<WebinarList | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .learnOverview(subject)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [subject]);

  useEffect(() => {
    api.listWebinars().then(setWebinars).catch(() => setWebinars(null));
    // Открыть вкладку вебинаров по ссылке /learn?tab=webinars (из уведомления)
    if (new URLSearchParams(window.location.search).get("tab") === "webinars") {
      setTab("webinars");
    }
  }, []);

  const empty = !loading && (!data || data.tarautar.length === 0);

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-light text-white shadow-glow">
          <BookOpen className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Сабақтар</h1>
          <p className="text-slate-600">Курстар мен вебинарлар — ҰБТ-ға дайындық</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("courses")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "courses" ? "bg-brand text-white shadow-glow" : "bg-surface text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Курстар
        </button>
        <button
          onClick={() => setTab("webinars")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "webinars" ? "bg-brand text-white shadow-glow" : "bg-surface text-slate-600 hover:text-slate-900"
          }`}
        >
          <Radio className="h-4 w-4" /> Вебинарлар
        </button>
      </div>

      {/* ===== КУРСЫ ===== */}
      {tab === "courses" && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Пән:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field max-w-xs"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {subjectIcon(s.id)} {s.name}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="mt-10 text-center text-slate-400">Жүктелуде...</p>}

          {empty && (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              Бұл пән бойынша әзірге курстар жоқ.
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data?.tarautar.map((tar, ti) => {
              const total = tar.topics.length;
              const done = tar.topics.filter((t) => t.state === "completed").length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <Link
                  key={tar.id}
                  href={`/learn/course/${tar.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-card"
                >
                  {/* Обложка */}
                  <div className="relative h-32 overflow-hidden">
                    {tar.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tar.imageUrl} alt={tar.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-4xl">
                        {subjectIcon(subject)}
                      </div>
                    )}
                    <span className="absolute right-2 top-2 rounded-lg bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                      {total} сабақ
                    </span>
                  </div>

                  <div className="p-4">
                    {/* Прогресс */}
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-500">{pct}%</span>
                    </div>
                    <p className="mt-3 font-bold text-slate-900">
                      {ti + 1}. {tar.title}
                    </p>
                    {tar.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{tar.description}</p>
                    )}
                    <span className="mt-3 inline-block text-sm font-semibold text-brand group-hover:underline">
                      {pct > 0 ? "Жалғастыру →" : "Бастау →"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* ===== ВЕБИНАРЫ ===== */}
      {tab === "webinars" && (
        <div className="mt-6">
          {webinars && !webinars.hasAccess && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <Crown className="h-6 w-6 text-amber-500" />
              <p className="flex-1 text-sm text-amber-800">
                Вебинарлар (нұсқа талдау) тек <b>Premium</b> тарифінде. Сілтеме премиумда ашылады.
              </p>
              <Link href="/pricing" className="btn-primary px-4 py-2 text-sm">
                Премиум алу
              </Link>
            </div>
          )}

          {webinars && webinars.webinars.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              Әзірге жоспарланған вебинарлар жоқ.
            </div>
          )}

          <div className="space-y-3">
            {webinars?.webinars.map((w) => (
              <div
                key={w.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 ${
                  w.isPast ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    w.isPast ? "bg-slate-200 text-slate-400" : "bg-brand/10 text-brand"
                  }`}
                >
                  <Video className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{w.title}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(w.startsAt).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Almaty",
                      })}
                    </span>
                    {w.speaker && <span>· {w.speaker}</span>}
                    {w.isPast && <span className="text-slate-400">· өтті</span>}
                  </p>
                  {w.description && <p className="mt-1 text-sm text-slate-500">{w.description}</p>}
                </div>
                {w.link ? (
                  <a
                    href={w.link}
                    target="_blank"
                    rel="noreferrer"
                    className={w.isPast ? "btn-secondary px-4 py-2 text-sm" : "btn-primary px-4 py-2 text-sm"}
                  >
                    {w.isPast ? "Жазбаны қарау" : "Кіру"}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                    <Crown className="h-4 w-4" /> Premium
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
