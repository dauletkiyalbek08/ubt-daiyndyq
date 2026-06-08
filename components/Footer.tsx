import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">Ұ</span>
            <span className="text-lg">ҰБТ Дайындық</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            ҰБТ-ға дайындалудың ең тиімді платформасы. Толық қазақ тілінде.
          </p>
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
            <li>support@ent-daiyndyq.kz</li>
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
