import {
  Target,
  Flame,
  Star,
  BadgeCheck,
  Trophy,
  Medal,
  Crown,
  Award,
  type LucideIcon,
} from "lucide-react";

// Соответствие достижения (id с бэкенда) → иконка Lucide
const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  a1: Target, // Алғашқы сынақ
  a2: Flame, // Тұрақтылық
  a3: Star, // Марафоншы
  a4: BadgeCheck, // Жоғары нәтиже
  a5: Trophy, // Үздік
  a6: Medal, // Топ-3
  a7: Crown, // Топ-10
};

export function AchievementIcon({
  id,
  className = "h-6 w-6",
}: {
  id: string;
  className?: string;
}) {
  const Icon = ACHIEVEMENT_ICONS[id] ?? Award;
  return <Icon className={className} aria-hidden="true" />;
}
