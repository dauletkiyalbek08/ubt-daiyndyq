// Простой столбчатый график на чистом CSS (без сторонних библиотек).
export function ProgressChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Әзірге деректер жоқ — тест тапсырыңыз
      </div>
    );
  }

  const max = Math.max(...data.map((w) => w.value), 1);

  return (
    <div className="flex h-48 items-end justify-between gap-3">
      {data.map((w, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{w.value}%</span>
          <div
            className="w-full origin-bottom animate-bar-grow rounded-t-lg bg-gradient-to-t from-brand to-brand-light transition-all duration-300 group-hover:from-brand-dark group-hover:to-brand"
            style={{ height: `${(w.value / max) * 100}%`, animationDelay: `${i * 90}ms` }}
          />
          <span className="text-xs text-slate-400">{w.label}</span>
        </div>
      ))}
    </div>
  );
}
