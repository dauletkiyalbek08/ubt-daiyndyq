"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TestRunner } from "@/components/TestRunner";
import { useAuth } from "@/components/AuthProvider";
import { api, ApiError, type ApiTestFull } from "@/lib/api";
import { Lock } from "lucide-react";

export default function TestPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [test, setTest] = useState<ApiTestFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getTest(params.id)
      .then(setTest)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Тест жүктелмеді"))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Ждём проверку авторизации
  if (authLoading || loading) {
    return (
      <div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>
    );
  }

  // Тест можно проходить только после входа (результат сохраняется в аккаунт)
  if (!user) {
    return (
      <div className="container-page max-w-md py-20 text-center">
        <div className="card">
          <Lock className="mx-auto h-10 w-10 text-brand" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Кіру қажет</h1>
          <p className="mt-2 text-sm text-slate-500">
            Тест тапсыру және нәтижені сақтау үшін аккаунтқа кіріңіз.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="btn-primary">
              Кіру
            </Link>
            <Link href="/register" className="btn-secondary">
              Тіркелу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container-page max-w-md py-20 text-center">
        <div className="card text-rose-600">{error || "Тест табылмады"}</div>
        <Link href="/tests" className="btn-secondary mt-6">
          Тесттерге оралу
        </Link>
      </div>
    );
  }

  return (
    <TestRunner
      title={test.title}
      questions={test.questions}
      durationMin={test.durationMin}
      studentName={`${user.firstName} ${user.lastName ?? ""}`.trim()}
      onFinish={(answers) => api.submitResult(test.id, answers)}
    />
  );
}
