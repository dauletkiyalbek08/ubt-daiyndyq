import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-12">
      {/* Декоративный фон */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl animate-float" />
      <div className="relative w-full max-w-md px-4">
        <div className="card animate-scale-in">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">Ұ</span>
            <span className="text-lg">ҰБТ Дайындық</span>
          </Link>
          <h1 className="text-center text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-center text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </div>
  );
}
