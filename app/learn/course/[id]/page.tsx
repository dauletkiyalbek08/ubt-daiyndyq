"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type CourseDetail } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Lock,
  PlayCircle,
} from "lucide-react";

export default function CoursePage() {
  const params = useParams();
  const id = String(params.id);

  const [data, setData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .learnCourse(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="container-page py-20 text-center text-slate-400">Жүктелуде...</div>;
  }
  if (!data) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-slate-500">Курс табылмады.</p>
        <Link href="/learn" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">
          Курстарға қайту
        </Link>
      </div>
    );
  }

  const { hasAccess, course, topics } = data;
  const done = topics.filter((t) => t.state === "completed").length;

  return (
    <div className="container-page py-10">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> Курстарға қайту
      </Link>

      {/* Шапка курса */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {course.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.imageUrl} alt={course.title} className="h-40 w-full object-cover" />
        )}
        <div className="p-5">
          <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
          {course.description && <p className="mt-1 text-slate-600">{course.description}</p>}
          <p className="mt-2 text-sm text-slate-400">
            {topics.length} сабақ · {done} аяқталды
          </p>
        </div>
      </div>

      {/* Баннер про Premium */}
      {!hasAccess && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Crown className="h-6 w-6 text-amber-500" />
          <p className="flex-1 text-sm text-amber-800">
            Оқу бөлімі тек <b>Premium</b> және <b>Maximum</b> тарифтерінде толық қолжетімді.
          </p>
          <Link href="/pricing" className="btn-primary px-4 py-2 text-sm">
            Тарифті таңдау
          </Link>
        </div>
      )}

      {/* Темы */}
      <div className="mt-6 space-y-3">
        {topics.length === 0 && (
          <p className="text-sm text-slate-400">Бұл курста әзірге тақырып жоқ.</p>
        )}
        {topics.map((tp) => {
          const locked = tp.state === "locked" || !hasAccess;
          const completed = tp.state === "completed";

          const inner = (
            <div
              className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                locked
                  ? "border-slate-100 bg-slate-50 opacity-70"
                  : "border-slate-200 bg-white hover:border-brand hover:shadow-card"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  completed
                    ? "bg-emerald-100 text-emerald-600"
                    : locked
                    ? "bg-slate-200 text-slate-400"
                    : "bg-brand/10 text-brand"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : locked ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <PlayCircle className="h-5 w-5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{tp.title}</p>
                <p className="text-xs text-slate-400">
                  {tp.hasPresentation && "Презентация · "}
                  {tp.materialsCount > 0 && `${tp.materialsCount} кітап · `}
                  {tp.hasTest ? `Тест (өту ≥ ${tp.passPercent}%)` : "Тест жоқ"}
                </p>
              </div>

              <div className="text-right text-sm">
                {completed ? (
                  <span className="font-semibold text-emerald-600">
                    Аяқталды {tp.bestPercent != null && `· ${tp.bestPercent}%`}
                  </span>
                ) : tp.bestPercent != null ? (
                  <span className="text-slate-500">Соңғы: {tp.bestPercent}%</span>
                ) : locked ? (
                  <span className="text-slate-400">Жабық</span>
                ) : (
                  <span className="font-medium text-brand">Бастау →</span>
                )}
              </div>
            </div>
          );

          return locked ? (
            <div key={tp.id}>{inner}</div>
          ) : (
            <Link key={tp.id} href={`/learn/${tp.id}`} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
