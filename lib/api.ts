// Клиент для общения с бэкенд-API (NestJS).
// Токен хранится в localStorage и подставляется в заголовок Authorization.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Адрес, куда ведёт кнопка «Войти через Google» (серверный OAuth-редирект)
export const googleAuthUrl = () => `${API_URL}/auth/google`;

// Человекочитаемые названия тарифов
export const PLAN_LABELS: Record<string, string> = {
  free: "Тегін",
  standard: "Стандарт",
  premium: "Премиум",
  max: "Максимум",
};

// Есть ли у пользователя доступ к пробным ҰБТ и рейтингу (Premium/Maximum или админ)
export function isPremium(user?: {
  plan?: string;
  planEndsAt?: string | null;
  role?: string;
} | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.plan || !["premium", "max"].includes(user.plan)) return false;
  if (user.planEndsAt && new Date(user.planEndsAt).getTime() < Date.now()) return false;
  return true;
}

const TOKEN_KEY = "ent_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Серверге қосыла алмадық. Бэкенд қосулы ма? (порт 4000)",
      0
    );
  }

  if (!res.ok) {
    let message = `Қате (${res.status})`;
    try {
      const data = await res.json();
      message = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message ?? message;
    } catch {
      // тело не JSON — оставляем стандартное сообщение
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Типы ответов API ----
export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  avatarUrl?: string | null; // фото из Google/Telegram
  plan?: string; // free | standard | premium
  planPeriod?: string | null; // quarter | year
  planEndsAt?: string | null;
  createdAt: string;
};

export type AuthResponse = { token: string; user: AuthUser };

export type ApiTest = {
  id: string;
  title: string;
  subjectId: string;
  difficulty: string;
  year: number;
  topic: string;
  durationMin: number;
  questionsCount?: number;
  isTrial?: boolean;
  weekLabel?: string | null;
  published?: boolean;
  publishAt?: string | null;
};

export type ApiQuestion = {
  id: string;
  text: string;
  type?: string; // single | context | matching | multiple
  options: string[];
  correctIndex: number;
  correctIndexes?: number[] | null;
  context?: string | null;
  matchLeft?: string[] | null;
  matchRight?: string[] | null;
  points?: number;
  explanation: string;
  imageUrl?: string | null;
  subject?: string | null;
};

export type ApiTestFull = ApiTest & { questions: ApiQuestion[] };

export type ReviewItem = {
  questionId: string;
  type?: string;
  subject?: string | null;
  context?: string | null;
  text: string;
  options: string[];
  matchLeft?: string[] | null;
  matchRight?: string[] | null;
  correctIndex: number;
  correctIndexes?: number[] | null;
  userAnswer: any;
  correct: boolean;
  points: number;
  gained: number;
  explanation: string;
  imageUrl?: string | null;
};

export type SubjectScore = {
  subjectId: string;
  score: number;
  max: number;
  correct: number;
  total: number;
};

export type SubmitResponse = {
  resultId: string;
  score: number;
  total: number;
  percent: number;
  bySubject: SubjectScore[];
  review: ReviewItem[];
};

export type ResultRow = {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  total: number;
  createdAt: string;
};

export type UserStats = {
  testsCompleted: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  correctRate: number;
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  score: number; // баллы (как в ҰБТ)
  total: number; // максимум баллов
  percent: number;
  date: string;
};

export type AchievementRow = {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export type Plan = {
  id: string;
  code: string;
  name: string;
  priceQuarter: number;
  priceYear: number;
  features: string[];
  excluded: string[];
  popular: boolean;
  sortOrder: number;
  active: boolean;
};

export type NotifItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null; // внутренний путь для перехода по клику
  read: boolean;
  createdAt: string;
};

// ---- Обучение (тарау → темы) ----
export type TopicMaterial = { title: string; url: string };

// Состояние темы для ученика: открыта / пройдена / заблокирована
export type TopicState = "completed" | "open" | "locked";

export type LearnTopic = {
  id: string;
  title: string;
  order: number;
  hasPresentation: boolean;
  materialsCount: number;
  hasTest: boolean;
  passPercent: number;
  bestPercent: number | null;
  state: TopicState;
};

export type LearnTarau = {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  order: number;
  topics: LearnTopic[];
};

export type LearnOverview = { hasAccess: boolean; tarautar: LearnTarau[] };

// Один курс (тарау) с темами
export type CourseDetail = {
  hasAccess: boolean;
  course: {
    id: string;
    title: string;
    imageUrl: string | null;
    description: string | null;
    subjectId: string;
  };
  topics: LearnTopic[];
};

// ---- Вебинары ----
export type Webinar = {
  id: string;
  title: string;
  speaker: string | null;
  description: string | null;
  startsAt: string;
  link: string | null; // null, если нет доступа (не Premium)
  isPast: boolean;
};

export type WebinarList = { hasAccess: boolean; webinars: Webinar[] };

// Полная тема (детали для ученика и для админки)
export type ApiTopic = {
  id: string;
  tarauId: string;
  title: string;
  order: number;
  presentationUrl: string | null;
  materials: TopicMaterial[] | null;
  testId: string | null;
  passPercent: number;
  createdAt?: string;
};

export type ApiTarau = {
  id: string;
  subjectId: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  order: number;
  createdAt?: string;
  topics: ApiTopic[];
};

export type TopicDetail = {
  id: string;
  tarauId: string;
  tarauTitle: string;
  subjectId: string;
  title: string;
  order: number;
  presentationUrl: string | null;
  materials: TopicMaterial[];
  testId: string | null;
  passPercent: number;
  bestPercent: number | null;
  passed: boolean;
};

// ---- Методы API ----
export const api = {
  // Авторизация
  register: (body: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
  }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<AuthUser>("/auth/me"),

  updateProfile: (body: { firstName?: string; lastName?: string; phone?: string }) =>
    request<AuthUser>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  changePassword: (body: { currentPassword?: string; newPassword: string }) =>
    request<{ success: boolean }>("/auth/password", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Вход через Telegram (данные от Telegram Login Widget)
  telegramLogin: (data: Record<string, unknown>) =>
    request<AuthResponse>("/auth/telegram", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Тесты
  listTests: (params: {
    subject?: string;
    difficulty?: string;
    year?: string;
    q?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.subject) qs.set("subject", params.subject);
    if (params.difficulty) qs.set("difficulty", params.difficulty);
    if (params.year) qs.set("year", params.year);
    if (params.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<ApiTest[]>(`/tests${suffix}`);
  },

  getTest: (id: string) => request<ApiTestFull>(`/tests/${id}`),

  // Пробные ҰБТ
  listTrials: () =>
    request<{ hasAccess: boolean; trials: ApiTest[] }>("/trials"),

  getTrial: (id: string) => request<ApiTestFull>(`/trials/${id}`),

  // Результаты (subjects — выбранные профильные предметы для пробного ҰБТ)
  submitResult: (testId: string, answers: Record<string, any>, subjects?: string[]) =>
    request<SubmitResponse>("/results/submit", {
      method: "POST",
      body: JSON.stringify({ testId, answers, subjects }),
    }),

  myResults: () => request<ResultRow[]>("/results/my"),

  myStats: () => request<UserStats>("/results/stats"),

  myAnalytics: () =>
    request<{
      weekly: { label: string; value: number }[];
      subjects: { subjectId: string; avg: number; count: number }[];
    }>("/results/analytics"),

  // Рейтинг и достижения
  rating: (period: "week" | "month" | "all") =>
    request<LeaderboardRow[]>(`/rating?period=${period}`),

  achievements: () => request<AchievementRow[]>("/rating/achievements"),

  // Тарифы
  plans: () => request<Plan[]>("/plans"),
  allPlans: () => request<Plan[]>("/plans/all"),
  updatePlan: (id: string, body: Partial<Plan>) =>
    request<Plan>(`/plans/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Уведомления
  notifications: () =>
    request<{ items: NotifItem[]; unread: number }>("/notifications"),

  markNotificationsRead: () =>
    request<{ success: boolean }>("/notifications/read", { method: "POST" }),

  // ---- Админ ----
  listUsers: () => request<AuthUser[]>("/users"),

  usersStats: () =>
    request<{ totalUsers: number; admins: number; students: number }>("/users/stats"),

  adminStats: () =>
    request<{
      totalUsers: number;
      students: number;
      admins: number;
      activeSubscriptions: number;
      premiumUsers: number;
      revenue: number;
      byPlan: { standard: number; premium: number };
      byPeriod: { quarter: number; year: number };
      totalAttempts: number;
      weekly: { label: string; count: number }[];
    }>("/admin/stats"),

  createTest: (body: {
    title: string;
    subjectId: string;
    difficulty?: string;
    year: number;
    topic: string;
    durationMin?: number;
    isTrial?: boolean;
    weekLabel?: string;
    publishAt?: string;
    questions?: {
      text: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
      imageUrl?: string;
    }[];
  }) =>
    request<ApiTest>("/tests", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Админ: выдать/изменить тариф пользователю (period: quarter | year)
  setUserPlan: (id: string, plan: string, period: string = "quarter") =>
    request<AuthUser>(`/users/${id}/plan`, {
      method: "PATCH",
      body: JSON.stringify({ plan, period }),
    }),

  // Полный тест с правильными ответами (для редактирования, только админ)
  getTestFull: (id: string) => request<ApiTestFull>(`/tests/${id}/full`),

  updateTest: (
    id: string,
    body: {
      title: string;
      subjectId: string;
      difficulty?: string;
      year: number;
      topic: string;
      durationMin?: number;
      isTrial?: boolean;
      weekLabel?: string;
      questions?: {
        text: string;
        options: string[];
        correctIndex: number;
        explanation?: string;
        imageUrl?: string;
      }[];
    }
  ) =>
    request<ApiTest>(`/tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteTest: (id: string) =>
    request<{ success: boolean }>(`/tests/${id}`, { method: "DELETE" }),

  // Загрузка картинки (multipart). Возвращает { url } — полный адрес файла.
  uploadImage: (file: File) => uploadFile("/uploads", file),

  // Загрузка PDF-документа (презентация/книга) для раздела «Обучение».
  uploadDoc: (file: File) => uploadFile("/uploads/doc", file),

  // ---- Обучение ----
  // Структура предмета для ученика (темы с замками/прогрессом)
  learnOverview: (subject: string) =>
    request<LearnOverview>(`/learn?subject=${encodeURIComponent(subject)}`),

  // Один курс (тарау) с темами
  learnCourse: (id: string) => request<CourseDetail>(`/learn/course/${id}`),

  // Детали темы (презентация + книги + тест)
  learnTopic: (id: string) => request<TopicDetail>(`/learn/topics/${id}`),

  // Админ: полная структура предмета (тарау + темы)
  learnManage: (subject: string) =>
    request<ApiTarau[]>(`/learn/manage?subject=${encodeURIComponent(subject)}`),

  // Админ: тарау (главы/курсы)
  createTarau: (body: {
    subjectId: string;
    title: string;
    order?: number;
    imageUrl?: string | null;
    description?: string | null;
  }) => request<ApiTarau>("/learn/tarau", { method: "POST", body: JSON.stringify(body) }),
  updateTarau: (
    id: string,
    body: { title?: string; order?: number; imageUrl?: string | null; description?: string | null }
  ) => request<ApiTarau>(`/learn/tarau/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTarau: (id: string) =>
    request<{ success: boolean }>(`/learn/tarau/${id}`, { method: "DELETE" }),

  // Админ: темы
  createTopic: (body: {
    tarauId: string;
    title: string;
    order?: number;
    presentationUrl?: string | null;
    materials?: TopicMaterial[] | null;
    testId?: string | null;
    passPercent?: number;
  }) => request<ApiTopic>("/learn/topics", { method: "POST", body: JSON.stringify(body) }),
  updateTopic: (
    id: string,
    body: {
      title?: string;
      order?: number;
      presentationUrl?: string | null;
      materials?: TopicMaterial[] | null;
      testId?: string | null;
      passPercent?: number;
    }
  ) => request<ApiTopic>(`/learn/topics/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTopic: (id: string) =>
    request<{ success: boolean }>(`/learn/topics/${id}`, { method: "DELETE" }),

  // ---- Вебинары ----
  listWebinars: () => request<WebinarList>("/webinars"),
  createWebinar: (body: {
    title: string;
    speaker?: string | null;
    description?: string | null;
    startsAt: string;
    link: string;
  }) => request<Webinar>("/webinars", { method: "POST", body: JSON.stringify(body) }),
  updateWebinar: (
    id: string,
    body: {
      title?: string;
      speaker?: string | null;
      description?: string | null;
      startsAt?: string;
      link?: string;
    }
  ) => request<Webinar>(`/webinars/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteWebinar: (id: string) =>
    request<{ success: boolean }>(`/webinars/${id}`, { method: "DELETE" }),
};

// Общая загрузка файла (картинка или PDF) через multipart. Возвращает { url }.
async function uploadFile(path: string, file: File): Promise<{ url: string }> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
  } catch {
    throw new ApiError("Серверге қосыла алмадық (порт 4000)", 0);
  }
  if (!res.ok) {
    let message = `Жүктеу қатесі (${res.status})`;
    try {
      const data = await res.json();
      message = data.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return res.json();
}
