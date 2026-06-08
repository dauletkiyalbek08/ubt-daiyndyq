import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="text-7xl font-extrabold text-gradient">404</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Бет табылмады</h1>
      <p className="mt-2 max-w-md text-slate-600">
        Кешіріңіз, мұндай бет жоқ немесе жылжытылған. Басты бетке оралыңыз.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">
          Басты бет
        </Link>
        <Link href="/tests" className="btn-secondary">
          Тесттерге өту
        </Link>
      </div>
    </div>
  );
}
