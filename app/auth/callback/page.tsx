"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Токен табылмады");
      return;
    }
    loginWithToken(token)
      .then(() => router.replace("/dashboard"))
      .catch(() => setError("Кіру сәтсіз аяқталды"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      {error ? (
        <>
          <div className="text-4xl">😕</div>
          <p className="mt-3 font-medium text-slate-700">{error}</p>
          <button onClick={() => router.replace("/login")} className="btn-secondary mt-5">
            Кіру бетіне
          </button>
        </>
      ) : (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
          <p className="mt-4 text-slate-500">Кіру жасалуда...</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-slate-500">Жүктелуде...</div>}>
      <CallbackInner />
    </Suspense>
  );
}
