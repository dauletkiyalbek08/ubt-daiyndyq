// Мок-данные для демонстрации интерфейса (без бэкенда).
// Позже заменяются реальными запросами к API (NestJS).

export type Subject = {
  id: string;
  name: string; // казахское название
  icon: string; // эмодзи-иконка
  color: string; // tailwind-классы фона/текста
};

export const subjects: Subject[] = [
  { id: "math", name: "Математика", icon: "📐", color: "bg-blue-50 text-blue-600" },
  { id: "history", name: "Қазақстан тарихы", icon: "🏛️", color: "bg-amber-50 text-amber-600" },
  { id: "literacy", name: "Оқу сауаттылығы", icon: "📖", color: "bg-emerald-50 text-emerald-600" },
  { id: "physics", name: "Физика", icon: "⚛️", color: "bg-violet-50 text-violet-600" },
  { id: "chemistry", name: "Химия", icon: "🧪", color: "bg-rose-50 text-rose-600" },
  { id: "biology", name: "Биология", icon: "🧬", color: "bg-teal-50 text-teal-600" },
  { id: "geography", name: "География", icon: "🌍", color: "bg-cyan-50 text-cyan-600" },
  { id: "english", name: "Ағылшын тілі", icon: "🔤", color: "bg-indigo-50 text-indigo-600" },
];

export type Difficulty = "Жеңіл" | "Орташа" | "Қиын";

export type TestItem = {
  id: string;
  title: string;
  subjectId: string;
  difficulty: Difficulty;
  year: number;
  topic: string;
  questionsCount: number;
  durationMin: number;
  attempts: number;
};

export const tests: TestItem[] = [
  { id: "t1", title: "Алгебра: функциялар мен графиктер", subjectId: "math", difficulty: "Орташа", year: 2024, topic: "Алгебра", questionsCount: 30, durationMin: 40, attempts: 1240 },
  { id: "t2", title: "Қазақ хандығының құрылуы", subjectId: "history", difficulty: "Жеңіл", year: 2024, topic: "Орта ғасыр", questionsCount: 25, durationMin: 30, attempts: 980 },
  { id: "t3", title: "Механика: кинематика негіздері", subjectId: "physics", difficulty: "Қиын", year: 2023, topic: "Механика", questionsCount: 35, durationMin: 50, attempts: 760 },
  { id: "t4", title: "Органикалық химия кіріспе", subjectId: "chemistry", difficulty: "Орташа", year: 2024, topic: "Органика", questionsCount: 28, durationMin: 40, attempts: 540 },
  { id: "t5", title: "Жасуша құрылысы", subjectId: "biology", difficulty: "Жеңіл", year: 2023, topic: "Цитология", questionsCount: 20, durationMin: 25, attempts: 1100 },
  { id: "t6", title: "Мәтінмен жұмыс: оқу сауаттылығы", subjectId: "literacy", difficulty: "Орташа", year: 2024, topic: "Оқылым", questionsCount: 30, durationMin: 45, attempts: 1530 },
  { id: "t7", title: "Геометрия: планиметрия", subjectId: "math", difficulty: "Қиын", year: 2024, topic: "Геометрия", questionsCount: 32, durationMin: 45, attempts: 670 },
  { id: "t8", title: "Тәуелсіздік кезеңі", subjectId: "history", difficulty: "Орташа", year: 2024, topic: "Қазіргі заман", questionsCount: 25, durationMin: 30, attempts: 890 },
  { id: "t9", title: "Электр тогы", subjectId: "physics", difficulty: "Орташа", year: 2023, topic: "Электр", questionsCount: 30, durationMin: 40, attempts: 430 },
  { id: "t10", title: "Present & Past Tenses", subjectId: "english", difficulty: "Жеңіл", year: 2024, topic: "Grammar", questionsCount: 25, durationMin: 30, attempts: 720 },
  { id: "t11", title: "Қазақстан физикалық географиясы", subjectId: "geography", difficulty: "Орташа", year: 2024, topic: "Физикалық география", questionsCount: 28, durationMin: 35, attempts: 360 },
  { id: "t12", title: "Бейорганикалық реакциялар", subjectId: "chemistry", difficulty: "Қиын", year: 2023, topic: "Бейорганика", questionsCount: 30, durationMin: 45, attempts: 290 },
];

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// Пример вопросов для прохождения теста (демо)
export const sampleQuestions: Question[] = [
  {
    id: "q1",
    text: "f(x) = 2x + 3 функциясының x = 4 нүктесіндегі мәні неге тең?",
    options: ["8", "11", "14", "10"],
    correctIndex: 1,
    explanation: "f(4) = 2·4 + 3 = 8 + 3 = 11.",
  },
  {
    id: "q2",
    text: "Қазақ хандығы қай жылы құрылды деп есептеледі?",
    options: ["1456 жыл", "1465 жыл", "1480 жыл", "1511 жыл"],
    correctIndex: 1,
    explanation: "Қазақ хандығы шамамен 1465 жылы Керей мен Жәнібек хандардың басшылығымен құрылды.",
  },
  {
    id: "q3",
    text: "Дененің бірқалыпты қозғалысында жылдамдық қалай өзгереді?",
    options: ["Артады", "Кемиді", "Өзгермейді", "Алдымен артады, сосын кемиді"],
    correctIndex: 2,
    explanation: "Бірқалыпты қозғалыста жылдамдық тұрақты болады, яғни өзгермейді.",
  },
  {
    id: "q4",
    text: "Судың химиялық формуласы қандай?",
    options: ["CO₂", "H₂O", "O₂", "NaCl"],
    correctIndex: 1,
    explanation: "Су — екі сутегі және бір оттегі атомынан тұрады: H₂O.",
  },
  {
    id: "q5",
    text: "Жасушаның энергия көзі болып табылатын органоид қайсы?",
    options: ["Ядро", "Рибосома", "Митохондрия", "Вакуоль"],
    correctIndex: 2,
    explanation: "Митохондрия — жасушаның «энергетикалық станциясы», АТФ синтездейді.",
  },
];

export type PlanTier = {
  id: string;
  name: string;
  priceQuarter: number; // ₸ за 3 месяца
  priceYear: number; // ₸ за год (−30%)
  popular?: boolean;
  features: string[]; // что входит
  excluded: string[]; // чего нет
};

export const plans: PlanTier[] = [
  {
    id: "standard",
    name: "Стандарт",
    priceQuarter: 5000,
    priceYear: 14000,
    features: [
      "Барлық пәндер бойынша тесттер",
      "Нәтижелер статистикасы",
      "Қателерді негізгі талдау",
    ],
    excluded: ["Апта сайынғы Пробное ҰБТ", "Рейтинг пен жетістіктер"],
  },
  {
    id: "premium",
    name: "Премиум",
    priceQuarter: 9990,
    priceYear: 27990,
    popular: true,
    features: [
      "Стандарт мүмкіндіктерінің барлығы",
      "Апта сайынғы Пробное ҰБТ",
      "Рейтинг пен жетістіктер",
      "Пробное ҰБТ-ны шектеусіз тапсыру",
      "Қателерді толық талдау",
    ],
    excluded: [],
  },
];

export type RatingRow = {
  rank: number;
  name: string;
  score: number;
  date: string;
};

export const rating: RatingRow[] = [
  { rank: 1, name: "Айгерім С.", score: 138, date: "05.06.2026" },
  { rank: 2, name: "Нұрлан Қ.", score: 135, date: "04.06.2026" },
  { rank: 3, name: "Дана М.", score: 132, date: "06.06.2026" },
  { rank: 4, name: "Ержан Т.", score: 129, date: "03.06.2026" },
  { rank: 5, name: "Мадина А.", score: 127, date: "05.06.2026" },
  { rank: 6, name: "Алихан Б.", score: 124, date: "02.06.2026" },
  { rank: 7, name: "Сабина Ж.", score: 121, date: "06.06.2026" },
  { rank: 8, name: "Тимур Н.", score: 119, date: "01.06.2026" },
  { rank: 9, name: "Аружан Е.", score: 116, date: "04.06.2026" },
  { rank: 10, name: "Бекзат Д.", score: 113, date: "05.06.2026" },
];

// Данные для личного кабинета (демо-пользователь)
export const demoUser = {
  firstName: "Арман",
  lastName: "Қойшыбаев",
  email: "arman@example.kz",
  plan: "Премиум",
  planEndDate: "12.12.2026",
  testsCompleted: 47,
  averageScore: 108,
  bestScore: 131,
  worstScore: 72,
  correctRate: 78,
  strengths: ["Қазақстан тарихы", "Биология"],
  weaknesses: ["Физика", "Химия"],
};

export type HistoryRow = {
  id: string;
  test: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
};

export const resultHistory: HistoryRow[] = [
  { id: "h1", test: "Пробное ҰБТ №12", subject: "Барлығы", score: 118, maxScore: 140, date: "06.06.2026" },
  { id: "h2", test: "Алгебра: функциялар", subject: "Математика", score: 26, maxScore: 30, date: "05.06.2026" },
  { id: "h3", test: "Тәуелсіздік кезеңі", subject: "Қазақстан тарихы", score: 23, maxScore: 25, date: "04.06.2026" },
  { id: "h4", test: "Механика негіздері", subject: "Физика", score: 21, maxScore: 35, date: "03.06.2026" },
  { id: "h5", test: "Пробное ҰБТ №11", subject: "Барлығы", score: 104, maxScore: 140, date: "30.05.2026" },
];

// Прогресс по неделям (для графика)
export const weeklyProgress = [
  { week: "1-апта", score: 88 },
  { week: "2-апта", score: 95 },
  { week: "3-апта", score: 92 },
  { week: "4-апта", score: 104 },
  { week: "5-апта", score: 112 },
  { week: "6-апта", score: 118 },
];

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export const achievements: Achievement[] = [
  { id: "a1", title: "Алғашқы қадам", description: "Бірінші тестті аяқтадыңыз", icon: "🎯", unlocked: true },
  { id: "a2", title: "Жолда", description: "10 тест аяқталды", icon: "🔥", unlocked: true },
  { id: "a3", title: "Тәжірибелі", description: "50 тест аяқталды", icon: "⭐", unlocked: false },
  { id: "a4", title: "100+ балл", description: "100-ден жоғары нәтиже", icon: "💯", unlocked: true },
  { id: "a5", title: "Топ-10", description: "Апталық рейтингте Топ-10", icon: "🏆", unlocked: false },
  { id: "a6", title: "7 күн қатарынан", description: "Бір апта бойы оқу", icon: "📅", unlocked: true },
];

export const platformStats = {
  totalTests: "12 000+",
  totalStudents: "25 000+",
  averageImprovement: "+34%",
  totalAttempts: "1.2 млн+",
};
