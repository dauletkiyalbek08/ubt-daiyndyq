"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type CourseDetail, type TopicDetail } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Crown,
  Download,
  FileText,
  GraduationCap,
  Lock,
  PlayCircle,
  Presentation,
} from "lucide-react";

export default function CoursePage() {
  const params = useParams();
  const id = String(params.id);

  const [data, setData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  // Раскрытая тема (аккордеон) + кэш загруженных деталей
  const [openId, setOpenId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, TopicDetail>>({});
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .learnCourse(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Раскрыть/свернуть тему; при раскрытии — подгружаем детали (презентация, книги, тест)
  async function toggle(topicId: string) {
    if (openId === topicId) {
      setOpenId(null);
      return;
    }
    setOpenId(topicId);
    if (!details[topicId]) {
      setLoadingTopic(topicId);
      try {
        const d = await api.learnTopic(topicId);
        setDetails((m) => ({ ...m, [topicId]: d }));
      } catch {
        /* gated / ошибка — покажем сообщение ниже */
      } finally {
        setLoadingTopic(null);
      }
    }
  }

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

      {/* Темы (аккордеон) */}
      <div className="mt-6 space-y-3">
        {topics.length === 0 && (
          <p className="text-sm text-slate-400">Бұл курста әзірге тақырып жоқ.</p>
        )}
        {topics.map((tp) => {
          const locked = tp.state === "locked" || !hasAccess;
          const completed = tp.state === "completed";
          const isOpen = openId === tp.id;
          const detail = details[tp.id];

          return (
            <div
              key={tp.id}
              className={`overflow-hidden rounded-2xl border transition ${
                locked ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
              }`}
            >
              {/* Заголовок темы — клик раскрывает */}
              <button
                disabled={locked}
                onClick={() => toggle(tp.id)}
                className={`flex w-full items-center gap-4 p-4 text-left ${
                  locked ? "cursor-not-allowed opacity-70" : "hover:bg-surface"
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

                <div className="flex shrink-0 items-center gap-3 text-sm">
                  {completed ? (
                    <span className="font-semibold text-emerald-600">
                      {tp.bestPercent != null ? `${tp.bestPercent}%` : "✓"}
                    </span>
                  ) : tp.bestPercent != null ? (
                    <span className="text-slate-500">{tp.bestPercent}%</span>
                  ) : locked ? (
                    <span className="text-slate-400">Жабық</span>
                  ) : null}
                  {!locked && (
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </button>

              {/* Раскрытое содержимое темы */}
              {isOpen && !locked && (
                <div className="border-t border-slate-100 p-5">
                  {loadingTopic === tp.id && (
                    <p className="text-sm text-slate-400">Жүктелуде...</p>
                  )}
                  {detail && <TopicBody d={detail} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Содержимое темы: презентация + книги + тест
function TopicBody({ d }: { d: TopicDetail }) {
  return (
    <div className="space-y-6">
      {d.passed && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Аяқталды ({d.bestPercent}%) — келесі тақырып ашылды!
        </div>
      )}

      {/* Презентация */}
      <div>
        <h3 className="flex items-center gap-2 font-bold text-slate-900">
          <Presentation className="h-5 w-5 text-brand" /> Презентация
        </h3>
        {d.presentationUrl ? (
          <a
            href={d.presentationUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Presentation className="h-4 w-4" />
            </span>
            <span className="flex-1 font-medium text-slate-800">Презентацияны ашу (PDF)</span>
            <Download className="h-4 w-4 text-slate-400" />
          </a>
        ) : (
          <p className="mt-1 text-sm text-slate-400">Презентация әзірге қосылмаған.</p>
        )}
      </div>

      {/* Книги */}
      <div>
        <h3 className="flex items-center gap-2 font-bold text-slate-900">
          <FileText className="h-5 w-5 text-brand" /> Кітаптар
        </h3>
        {d.materials.length > 0 ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {d.materials.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand"
              >
                <FileText className="h-4 w-4 text-brand" />
                <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{m.title}</span>
                <Download className="h-4 w-4 text-slate-400" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-400">Материалдар әзірге қосылмаған.</p>
        )}
      </div>

      {/* Тест */}
      <div>
        <h3 className="flex items-center gap-2 font-bold text-slate-900">
          <GraduationCap className="h-5 w-5 text-brand" /> Тақырып тесті
        </h3>
        {d.testId ? (
          <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="flex-1 text-sm text-slate-600">
              Өту шегі: <span className="font-semibold text-brand">≥ {d.passPercent}%</span>
              {d.bestPercent != null && ` · соңғы нәтиже: ${d.bestPercent}%`}
            </p>
            <Link href={`/tests/${d.testId}`} className="btn-primary px-5 py-2.5 text-sm">
              {d.bestPercent != null ? "Қайта тапсыру" : "Тестті бастау"}
            </Link>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-400">Бұл тақырыпқа тест әзірге қосылмаған.</p>
        )}
      </div>
    </div>
  );
}
