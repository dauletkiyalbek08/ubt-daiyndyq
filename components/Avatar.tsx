// Аватар пользователя: фото из Google/Telegram (avatarUrl),
// иначе — инициалы на градиенте (цвет зависит от имени).

const GRADIENTS = [
  "from-brand to-brand-light",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-cyan-500",
  "from-indigo-500 to-blue-500",
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const ini = parts.map((p) => p[0]).slice(0, 2).join("");
  return ini.toUpperCase() || "?";
}

function gradientOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 1000;
  return GRADIENTS[h % GRADIENTS.length];
}

export function Avatar({
  name,
  avatarUrl,
  className = "h-10 w-10",
  textClass = "text-sm",
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  textClass?: string;
}) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      className={`${className} ${textClass} inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientOf(
        name
      )} font-semibold text-white`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
