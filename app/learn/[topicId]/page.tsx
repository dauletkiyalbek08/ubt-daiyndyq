"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, type TopicDetail } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Lock,
  Presentation,
} from "lucide-react";

export default function TopicPage() {
  const params = useParams();
  const topicId = String(params.topicId);

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .learnTopic(topicId)
      .then((t) => {
        setTopic(t);
        setError(null);
      })
      .catch((e) => {
        const status = e instanceof ApiError ? e.status : 0;
        setError({ status, message: e.message });
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  if (loading) {
    return <div className="container-page py-20 text-center text-slate-400">Жүктелуде...</div>;
  }

  // Нет доступа (не Premium) или тема заблокирована
  if (error) {
    return (
      <div className="container-page py-16">
        <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
          <ArrowLeft className="h-4 w-4" /> Сабақтарға қайту
        </Link>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Қолжетімді емес</h1>
          <p className="mt-2 text-sm text-slate-600">{error.message}</p>
          <Link href="/pricing" className="btn-primary mt-6 inline-block px-5 py-2.5 text-sm">
            Тарифті таңдау
          </Link>
        </div>
      </div>
    );
  }

  if (!topic) return null;

  return (
    <div className="container-page py-10">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> Сабақтарға қайту
      </Link>

      <div className="mt-4">
        <p className="text-sm font-medium text-brand">{topic.tarauTitle}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{topic.title}</h1>
      </div>

      {/* Статус прохождения */}
      {topic.passed && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">
            Сіз бұл тақырыпты аяқтадыңыз ({topic.bestPercent}%). Келесі тақырып ашылды!
          </span>
        </div>
      )}

      {/* Презентация */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Presentation className="h-5 w-5 text-brand" /> Презентация
        </h2>
        {topic.presentationUrl ? (
          <a
            href={topic.presentationUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand hover:shadow-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Presentation className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 font-medium text-slate-800">Презентацияны ашу (PDF)</span>
            <Download className="h-4 w-4 shrink-0 text-slate-400" />
          </a>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Презентация әзірге қосылмаған.</p>
        )}
      </section>

      {/* Книги / материалы */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <FileText className="h-5 w-5 text-brand" /> Кітаптар мен материалдар
        </h2>
        {topic.materials.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {topic.materials.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand hover:shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{m.title}</span>
                <Download className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Материалдар әзірге қосылмаған.</p>
        )}
      </section>

      {/* Тест темы */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <GraduationCap className="h-5 w-5 text-brand" /> Тақырып тесті
        </h2>
        {topic.testId ? (
          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                Өту шегі: <span className="text-brand">≥ {topic.passPercent}%</span>
              </p>
              <p className="text-sm text-slate-500">
                {topic.passed
                  ? `Сіздің нәтижеңіз: ${topic.bestPercent}% — өтілді ✓`
                  : topic.bestPercent != null
                  ? `Соңғы нәтиже: ${topic.bestPercent}%. Келесі тақырыпты ашу үшін ≥ ${topic.passPercent}% жинаңыз.`
                  : "Тестті тапсырып, келесі тақырыпты ашыңыз."}
              </p>
            </div>
            <Link href={`/tests/${topic.testId}`} className="btn-primary px-6 py-2.5">
              {topic.bestPercent != null ? "Қайта тапсыру" : "Тестті бастау"}
            </Link>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Бұл тақырыпқа тест әзірге қосылмаған.</p>
        )}
      </section>
    </div>
  );
}
