import {
  Landmark,
  Calculator,
  BookOpen,
  Sigma,
  Atom,
  FlaskConical,
  Dna,
  Earth,
  Laptop,
  Globe,
  Languages,
  Speech,
  BookMarked,
  Type,
  BookText,
  Scale,
  Palette,
  type LucideIcon,
} from "lucide-react";

// Соответствие предмета → иконка Lucide (единый стиль, подстраивается под тему)
const SUBJECT_ICONS: Record<string, LucideIcon> = {
  history: Landmark,
  mathlit: Calculator,
  readlit: BookOpen,
  math: Sigma,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geography: Earth,
  informatics: Laptop,
  worldhistory: Globe,
  foreign: Languages,
  kazlang: Speech,
  kazlit: BookMarked,
  ruslang: Type,
  ruslit: BookText,
  law: Scale,
  creative: Palette,
};

export function SubjectIcon({
  id,
  className = "h-5 w-5",
}: {
  id?: string | null;
  className?: string;
}) {
  const Icon = (id && SUBJECT_ICONS[id]) || BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}
