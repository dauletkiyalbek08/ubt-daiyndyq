// Проверка: есть ли у пользователя активный доступ Premium/Maximum.
// Админ имеет доступ всегда (для управления и тестирования).
export function hasPremiumAccess(user: {
  plan?: string | null;
  planEndsAt?: Date | string | null;
  role?: string;
}): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.plan || !["premium", "max"].includes(user.plan)) return false;
  if (user.planEndsAt && new Date(user.planEndsAt).getTime() < Date.now()) {
    return false; // подписка истекла
  }
  return true;
}
