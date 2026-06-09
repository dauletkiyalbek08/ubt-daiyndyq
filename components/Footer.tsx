import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="group flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-light text-white shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              Ұ
            </span>
            <span className="text-lg">ҰБТ Дайындық</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            ҰБТ-ға дайындалудың ең тиімді платформасы. Толық қазақ тілінде.
          </p>
          <a
            href="https://t.me/ubt_daiyndyq_kz_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand/25 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:border-brand/50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.06-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
            Telegram
          </a>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Платформа</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/tests" className="hover:text-brand">Тесттер</Link></li>
            <li><Link href="/trial" className="hover:text-brand">Пробное ҰБТ</Link></li>
            <li><Link href="/rating" className="hover:text-brand">Рейтинг</Link></li>
            <li><Link href="/pricing" className="hover:text-brand">Тарифтер</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Аккаунт</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/login" className="hover:text-brand">Кіру</Link></li>
            <li><Link href="/register" className="hover:text-brand">Тіркелу</Link></li>
            <li><Link href="/dashboard" className="hover:text-brand">Жеке кабинет</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Байланыс</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>support@ubt-daiyndyq.kz</li>
            <li>+7 (700) 000-00-00</li>
            <li>Қазақстан</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="container-page py-5 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ҰБТ Дайындық. Барлық құқықтар қорғалған.
        </div>
      </div>
    </footer>
  );
}
