import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/user.entity";
import { Test } from "./entities/test.entity";
import { Question } from "./entities/question.entity";
import { Result } from "./entities/result.entity";
import { Subscription } from "./entities/subscription.entity";
import { Notification } from "./entities/notification.entity";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  entities: [User, Test, Question, Result, Subscription, Notification],
  synchronize: true,
});

type Q = {
  subject: string;
  type: string;
  text: string;
  options?: string[];
  correctIndex?: number;
  correctIndexes?: number[];
  context?: string;
  matchLeft?: string[];
  matchRight?: string[];
  points: number;
  explanation: string;
};

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// одиночный (curated)
function single(subject: string, text: string, options: string[], correctIndex: number): Q {
  const correctVal = options[correctIndex];
  const sh = shuffle(options);
  return { subject, type: "single", text, options: sh, correctIndex: sh.indexOf(correctVal), points: 1, explanation: `Дұрыс жауап: ${correctVal}` };
}
// числовой одиночный
function numS(subject: string, text: string, ans: number, unit = ""): Q {
  const set = new Set<number>([ans]);
  while (set.size < 4) { const c = ans + rnd(1, 9) * (Math.random() < 0.5 ? -1 : 1); if (c >= 0) set.add(c); }
  const arr = shuffle([...set]);
  return { subject, type: "single", text, options: arr.map((n) => `${n}${unit ? " " + unit : ""}`), correctIndex: arr.indexOf(ans), points: 1, explanation: `Дұрыс жауап: ${ans}${unit ? " " + unit : ""}` };
}
// контекстный (числовой)
function ctx(subject: string, context: string, text: string, ans: number, unit = ""): Q {
  const q = numS(subject, text, ans, unit);
  return { ...q, type: "context", context };
}
// соответствие
function matching(subject: string, text: string, pairs: [string, string][]): Q {
  return { subject, type: "matching", text, options: [], matchLeft: pairs.map((p) => p[0]), matchRight: pairs.map((p) => p[1]), points: 1, explanation: "" };
}
// множественный (несколько правильных) — 3 балла
function multi(subject: string, text: string, options: string[], correctIdx: number[]): Q {
  const correctVals = correctIdx.map((i) => options[i]);
  const sh = shuffle(options);
  return { subject, type: "multiple", text, options: sh, correctIndexes: correctVals.map((v) => sh.indexOf(v)), points: 3, explanation: `Дұрыс: ${correctVals.join(", ")}` };
}

// ---------- Профильные: МАТЕМАТИКА (40 вопросов = 50 баллов) ----------
function mathProfile(): Q[] {
  const out: Q[] = [];
  for (let i = 0; i < 25; i++) {
    const k = rnd(0, 3);
    if (k === 0) { const a = rnd(11, 99), b = rnd(11, 99); out.push(numS("math", `${a} + ${b} = ?`, a + b)); }
    else if (k === 1) { const a = rnd(50, 99), b = rnd(10, 49); out.push(numS("math", `${a} − ${b} = ?`, a - b)); }
    else if (k === 2) { const a = rnd(2, 12), b = rnd(2, 12); out.push(numS("math", `${a} × ${b} = ?`, a * b)); }
    else { const x = rnd(2, 20), a = rnd(1, 30); out.push(numS("math", `x + ${a} = ${x + a}, x = ?`, x)); }
  }
  for (let i = 0; i < 5; i++) {
    const p = rnd(2, 9) * 100, n = rnd(2, 6), m = rnd(2, 6), q = rnd(50, 150);
    out.push(ctx("math", `Кесте: Дүкендегі бағалар\nДәптер — ${p} тг\nҚалам — ${q} тг`, `${n} дәптер мен ${m} қалам қанша тұрады?`, p * n + q * m, "тг"));
  }
  const mt: [string, string][][] = [
    [["1+2", "3"], ["2×3", "6"], ["10−1", "9"], ["8÷4", "2"]],
    [["4+5", "9"], ["3×4", "12"], ["7−2", "5"], ["16÷2", "8"]],
    [["5+5", "10"], ["6×2", "12"], ["9−4", "5"], ["14÷7", "2"]],
    [["2+6", "8"], ["3×5", "15"], ["10−3", "7"], ["12÷3", "4"]],
    [["7+1", "8"], ["4×4", "16"], ["9−5", "4"], ["18÷2", "9"]],
  ];
  mt.forEach((p) => out.push(matching("math", "Амалды нәтижесімен сәйкестендіріңіз", p)));
  for (let i = 0; i < 5; i++) {
    const nums = shuffle(Array.from({ length: 12 }, (_, n) => n + 1)).slice(0, 6);
    const correct = nums.map((n, idx) => (n % 2 === 0 ? idx : -1)).filter((x) => x >= 0).slice(0, 3);
    if (correct.length === 0) correct.push(0);
    out.push(multi("math", "Қайсылары жұп сан? (барлық дұрысын таңдаңыз)", nums.map(String), correct));
  }
  return out;
}

// ---------- Профильные: ФИЗИКА (40 вопросов = 50 баллов) ----------
function physicsProfile(): Q[] {
  const out: Q[] = [];
  for (let i = 0; i < 25; i++) {
    const k = rnd(0, 3);
    if (k === 0) { const v = rnd(2, 20), t = rnd(2, 10); out.push(numS("physics", `v=${v} м/с, t=${t} с. Жол S=v·t (м)?`, v * t, "м")); }
    else if (k === 1) { const m = rnd(1, 10), a = rnd(1, 10); out.push(numS("physics", `m=${m} кг, a=${a} м/с². F=m·a (Н)?`, m * a, "Н")); }
    else if (k === 2) { const F = rnd(2, 20), s = rnd(2, 10); out.push(numS("physics", `F=${F} Н, s=${s} м. A=F·s (Дж)?`, F * s, "Дж")); }
    else { const I = rnd(1, 10), R = rnd(1, 10); out.push(numS("physics", `I=${I} А, R=${R} Ом. U=I·R (В)?`, I * R, "В")); }
  }
  for (let i = 0; i < 5; i++) {
    const v = rnd(5, 20), t = rnd(2, 8);
    out.push(ctx("physics", `Дене бірқалыпты қозғалады.\nЖылдамдық v = ${v} м/с`, `${t} секундта жүрген жолы (S=v·t)?`, v * t, "м"));
  }
  const mt: [string, string][][] = [
    [["F=m·a", "Күш"], ["S=v·t", "Жол"], ["U=I·R", "Кернеу"], ["A=F·s", "Жұмыс"]],
    [["P=F/S", "Қысым"], ["N=A/t", "Қуат"], ["ρ=m/V", "Тығыздық"], ["Q=cmΔt", "Жылу"]],
    [["v=S/t", "Жылдамдық"], ["a=v/t", "Үдеу"], ["m·g", "Ауырлық күші"], ["m·v", "Импульс"]],
    [["Дж", "Жұмыс"], ["Н", "Күш"], ["Вт", "Қуат"], ["Па", "Қысым"]],
    [["м/с", "Жылдамдық"], ["кг", "Масса"], ["с", "Уақыт"], ["А", "Ток күші"]],
  ];
  mt.forEach((p) => out.push(matching("physics", "Шаманы өлшем бірлігімен/мағынасымен сәйкестендіріңіз", p)));
  for (let i = 0; i < 5; i++) {
    const correctPool = ["Күш", "Жылдамдық", "Қуат", "Масса", "Уақыт"];
    const wrongPool = ["Алма", "Кітап", "Гүл", "Дос", "Қуаныш"];
    const c = shuffle(correctPool).slice(0, 3);
    const w = shuffle(wrongPool).slice(0, 3);
    const opts = shuffle([...c, ...w]);
    out.push(multi("physics", "Қайсылары физикалық шама? (барлығын таңдаңыз)", opts, c.map((x) => opts.indexOf(x))));
  }
  return out;
}

// ---------- Обязательные ----------
const history: Q[] = [
  single("history", "Қазақ хандығы қай жылы құрылды?", ["1465", "1456", "1480", "1511"], 0),
  single("history", "Қазақ хандығының алғашқы хандарының бірі?", ["Керей", "Абылай", "Тәуке", "Қасым"], 0),
  single("history", "«Жеті жарғы» заңын шығарған хан?", ["Тәуке", "Абылай", "Қасым", "Есім"], 0),
  single("history", "Қазақстан тәуелсіздігін жариялаған жыл?", ["1991", "1990", "1995", "1986"], 0),
  single("history", "Желтоқсан көтерілісі қай жылы болды?", ["1986", "1991", "1979", "1980"], 0),
  single("history", "Алаш партиясының көшбасшысы?", ["Ә. Бөкейханов", "М. Әуезов", "Қ. Сәтбаев", "С. Сейфуллин"], 0),
  single("history", "Астана елорда болған жыл?", ["1997", "1991", "1998", "2000"], 0),
  single("history", "Ұлы Отан соғысы басталған жыл?", ["1941", "1939", "1945", "1938"], 0),
  single("history", "Қазақстанның Тұңғыш Президенті?", ["Н. Назарбаев", "Қ. Тоқаев", "Д. Қонаев", "Н. Әбіқаев"], 0),
  single("history", "Қазақ КСР құрылған жыл?", ["1936", "1920", "1924", "1991"], 0),
  single("history", "Қазақтың үш жүзі: Ұлы, Орта және...?", ["Кіші жүз", "Батыс жүз", "Шығыс жүз", "Солтүстік жүз"], 0),
  single("history", "Абылай хан өмір сүрген ғасыр?", ["XVIII ғ.", "XVI ғ.", "XX ғ.", "XV ғ."], 0),
  single("history", "«Ақтабан шұбырынды» — қай оқиғаға қатысты?", ["жоңғар шапқыншылығы", "орыс отаршылдығы", "аштық", "ұлы көш"], 0),
  single("history", "Кенесары Қасымұлы көтерілісінің ғасыры?", ["XIX ғ.", "XVII ғ.", "XX ғ.", "XVI ғ."], 0),
  single("history", "1930 жылдардағы ашаршылықтың басты себебі?", ["күштеп ұжымдастыру", "соғыс", "құрғақшылық", "көші-қон"], 0),
  single("history", "Тұңғыш қазақ ғарышкері?", ["Тоқтар Әубәкіров", "Талғат Мұсабаев", "Айдын Айымбетов", "Ю. Гагарин"], 0),
  single("history", "ҚР Тұңғыш Конституциясы қабылданған жыл?", ["1993", "1991", "1995", "1990"], 0),
  single("history", "«Мәңгілік ел» идеясын ұсынған?", ["Н. Назарбаев", "Қ. Тоқаев", "Д. Қонаев", "А. Байтұрсынов"], 0),
  single("history", "Алтын Орда негізделген ғасыр?", ["XIII ғ.", "XV ғ.", "XI ғ.", "XVII ғ."], 0),
  single("history", "ҚР қазіргі Президенті (2019 жылдан)?", ["Қ. Тоқаев", "Н. Назарбаев", "Ә. Смайылов", "Д. Қонаев"], 0),
];
const readlit: Q[] = [
  single("readlit", "«Үлкен» сөзінің антонимі?", ["кіші", "биік", "ұзын", "жуан"], 0),
  single("readlit", "«Бақытты» сөзінің синонимі?", ["қуанышты", "ашулы", "мұңды", "шаршаған"], 0),
  single("readlit", "«Мектеп» сөзі неше буыннан тұрады?", ["2", "1", "3", "4"], 0),
  single("readlit", "Зат есімді табыңыз:", ["үй", "жүгірді", "әдемі", "тез"], 0),
  single("readlit", "«Ол кітап оқыды» — баяндауыш?", ["оқыды", "ол", "кітап", "жоқ"], 0),
  single("readlit", "Көптік жалғауын табыңыз: «балалар»", ["-лар", "ба-", "-ла", "-ар"], 0),
  single("readlit", "«Жылдам» сөзінің синонимі?", ["шапшаң", "баяу", "үлкен", "ауыр"], 0),
  single("readlit", "Сын есімді табыңыз:", ["биік", "үй", "келді", "мен"], 0),
  single("readlit", "«Күн шықты» — баяндауыш?", ["шықты", "күн", "жарық", "жоқ"], 0),
  single("readlit", "«Дос» сөзінің антонимі?", ["дұшпан", "жолдас", "аға", "көрші"], 0),
];
function mathlit10(): Q[] {
  const out: Q[] = [];
  for (let i = 0; i < 10; i++) {
    const k = rnd(0, 2);
    if (k === 0) { const a = rnd(20, 99), b = rnd(20, 99); out.push(numS("mathlit", `Дүкенде ${a} тг және ${b} тг тауар алынды. Барлығы?`, a + b, "тг")); }
    else if (k === 1) { const p = rnd(2, 9) * 100, n = rnd(2, 9); out.push(numS("mathlit", `Бір дәптер ${p} тг. ${n} дәптер қанша тұрады?`, p * n, "тг")); }
    else { const t = rnd(2, 9) * 10, pr = rnd(2, 9) * 10; out.push(numS("mathlit", `${t} оқушының ${pr}% — қыздар. Қыздар саны?`, Math.round((t * pr) / 100))); }
  }
  return out;
}

// ---------- Другие профильные (curated, одиночные) ----------
const chemistry: Q[] = [
  single("chemistry", "Судың формуласы?", ["H₂O", "CO₂", "O₂", "NaCl"], 0),
  single("chemistry", "Ас тұзының формуласы?", ["NaCl", "KCl", "CaCO₃", "H₂O"], 0),
  single("chemistry", "Оттегінің белгісі?", ["O", "Au", "Ag", "Fe"], 0),
  single("chemistry", "Көмірқышқыл газы?", ["CO₂", "CO", "O₂", "H₂"], 0),
  single("chemistry", "Алтынның белгісі?", ["Au", "Ag", "Al", "Ar"], 0),
  single("chemistry", "Темірдің белгісі?", ["Fe", "Cu", "Zn", "Pb"], 0),
  single("chemistry", "pH = 7 ерітінді?", ["бейтарап", "қышқыл", "сілтілік", "тұзды"], 0),
  single("chemistry", "Тұз қышқылы?", ["HCl", "H₂SO₄", "HNO₃", "H₂O"], 0),
];
const biology: Q[] = [
  single("biology", "Жасушаның энергия көзі?", ["митохондрия", "ядро", "рибосома", "вакуоль"], 0),
  single("biology", "Фотосинтез қай органоидта?", ["хлоропласт", "ядро", "митохондрия", "рибосома"], 0),
  single("biology", "Қанды айдайтын мүше?", ["жүрек", "бауыр", "өкпе", "бүйрек"], 0),
  single("biology", "Тыныс алу мүшесі?", ["өкпе", "жүрек", "асқазан", "бүйрек"], 0),
  single("biology", "ДНҚ қайда сақталады?", ["ядро", "цитоплазма", "қабырға", "вакуоль"], 0),
  single("biology", "Адам қанының неше тобы бар?", ["4", "2", "3", "5"], 0),
  single("biology", "Өсімдікте бар, жануарда жоқ?", ["жасуша қабырғасы", "ядро", "митохондрия", "мембрана"], 0),
  single("biology", "C витаминіне бай өнім?", ["лимон", "ет", "нан", "май"], 0),
];
const geography: Q[] = [
  single("geography", "Қазақстанның астанасы?", ["Астана", "Алматы", "Шымкент", "Ақтөбе"], 0),
  single("geography", "Ең үлкен мұхит?", ["Тынық", "Атлант", "Үнді", "Солтүстік Мұзды"], 0),
  single("geography", "Ең биік тау шыңы?", ["Эверест", "Хан Тәңірі", "Эльбрус", "Монблан"], 0),
  single("geography", "Қазақстан қай материкте?", ["Еуразия", "Африка", "Америка", "Аустралия"], 0),
  single("geography", "Ең үлкен материк?", ["Еуразия", "Африка", "Антарктида", "Аустралия"], 0),
  single("geography", "Қазақстанмен шектеспейтін ел?", ["Иран", "Ресей", "Қытай", "Өзбекстан"], 0),
  single("geography", "Ең үлкен су айдыны?", ["Каспий", "Балқаш", "Арал", "Алакөл"], 0),
  single("geography", "Жер неше материктен тұрады?", ["6", "5", "7", "4"], 0),
];
const informatics: Q[] = [
  single("informatics", "1 байт неше бит?", ["8", "4", "16", "2"], 0),
  single("informatics", "Екілік жүйеде 2 саны?", ["10", "2", "11", "1"], 0),
  single("informatics", "Процессордың қызметі?", ["есептеу", "сақтау", "басып шығару", "бейнелеу"], 0),
  single("informatics", "RAM — бұл?", ["жедел жад", "тұрақты жад", "диск", "принтер"], 0),
  single("informatics", "Бағдарламалау тілі?", ["Python", "HTTP", "JPG", "PDF"], 0),
  single("informatics", "URL дегеніміз?", ["сайт мекенжайы", "вирус", "шрифт", "файл"], 0),
  single("informatics", "Веб-бет тілі?", ["HTML", "Excel", "Word", "Paint"], 0),
];
const worldhistory: Q[] = [
  single("worldhistory", "Бірінші дүниежүзілік соғыс басталған жыл?", ["1914", "1939", "1905", "1900"], 0),
  single("worldhistory", "Екінші дүниежүзілік соғыс аяқталған жыл?", ["1945", "1941", "1939", "1950"], 0),
  single("worldhistory", "Ұлы француз революциясы басталған жыл?", ["1789", "1812", "1861", "1917"], 0),
  single("worldhistory", "Американы ашқан саяхатшы?", ["Х. Колумб", "Ф. Магеллан", "Васко да Гама", "Дж. Кук"], 0),
  single("worldhistory", "Ресейдегі Қазан төңкерісі жылы?", ["1917", "1905", "1914", "1922"], 0),
  single("worldhistory", "Берлин қабырғасы құлаған жыл?", ["1989", "1991", "1961", "1945"], 0),
  single("worldhistory", "Ежелгі Рим империясының астанасы?", ["Рим", "Афины", "Спарта", "Карфаген"], 0),
];
const foreign: Q[] = [
  single("foreign", "Choose: She ___ a teacher.", ["is", "are", "am", "be"], 0),
  single("foreign", "Plural of 'child'?", ["children", "childs", "childes", "child"], 0),
  single("foreign", "Past simple of 'go'?", ["went", "goed", "gone", "going"], 0),
  single("foreign", "I ___ coffee every morning.", ["drink", "drinks", "drinking", "drank"], 0),
  single("foreign", "Opposite of 'big'?", ["small", "tall", "long", "wide"], 0),
  single("foreign", "They ___ playing now.", ["are", "is", "am", "be"], 0),
  single("foreign", "Article: ___ apple", ["an", "a", "the", "—"], 0),
  single("foreign", "Past simple of 'have'?", ["had", "haved", "has", "having"], 0),
];
const kazlang: Q[] = [
  single("kazlang", "«Кітап» — қай сөз табы?", ["зат есім", "етістік", "сын есім", "үстеу"], 0),
  single("kazlang", "«Әдемі» — қай сөз табы?", ["сын есім", "зат есім", "етістік", "сан есім"], 0),
  single("kazlang", "«Жүгірді» — қай сөз табы?", ["етістік", "зат есім", "сын есім", "шылау"], 0),
  single("kazlang", "«Үш» — қай сөз табы?", ["сан есім", "зат есім", "етістік", "сын есім"], 0),
  single("kazlang", "Көптік жалғауы?", ["-лар/-лер", "-ны", "-да", "-ға"], 0),
  single("kazlang", "«Мен оқимын» — бастауыш?", ["мен", "оқимын", "оқу", "жоқ"], 0),
];
const kazlit: Q[] = [
  single("kazlit", "«Абай жолы» авторы?", ["М. Әуезов", "А. Құнанбаев", "С. Мұқанов", "Ж. Аймауытов"], 0),
  single("kazlit", "Абайдың «Қара сөздерінің» саны?", ["45", "20", "30", "50"], 0),
  single("kazlit", "«Қозы Көрпеш — Баян сұлу» — бұл?", ["лиро-эпос жыр", "роман", "әңгіме", "повесть"], 0),
  single("kazlit", "Қазақтың ұлы ақыны, ағартушы?", ["Абай", "Пушкин", "Гёте", "Шекспир"], 0),
  single("kazlit", "«Ермек үшін жазбаймын өлеңді» авторы?", ["Абай", "Махамбет", "Жамбыл", "Мағжан"], 0),
  single("kazlit", "Жамбыл Жабаев — кім?", ["ақын", "жазушы", "ғалым", "әнші"], 0),
];
const ruslang: Q[] = [
  single("ruslang", "«Книга» — часть речи?", ["существительное", "глагол", "прилагательное", "наречие"], 0),
  single("ruslang", "«Красивый» — часть речи?", ["прилагательное", "существительное", "глагол", "союз"], 0),
  single("ruslang", "«Бежал» — часть речи?", ["глагол", "существительное", "прилагательное", "предлог"], 0),
  single("ruslang", "Сколько падежей в русском языке?", ["6", "5", "7", "4"], 0),
  single("ruslang", "Антоним к «большой»?", ["маленький", "высокий", "длинный", "широкий"], 0),
  single("ruslang", "«Мама мыла раму» — подлежащее?", ["мама", "мыла", "раму", "нет"], 0),
];
const ruslit: Q[] = [
  single("ruslit", "Автор «Евгения Онегина»?", ["А. Пушкин", "М. Лермонтов", "Л. Толстой", "Н. Гоголь"], 0),
  single("ruslit", "Автор «Войны и мира»?", ["Л. Толстой", "Ф. Достоевский", "А. Чехов", "И. Тургенев"], 0),
  single("ruslit", "Автор «Преступления и наказания»?", ["Ф. Достоевский", "Л. Толстой", "А. Пушкин", "Н. Гоголь"], 0),
  single("ruslit", "Кто написал «Мёртвые души»?", ["Н. Гоголь", "А. Чехов", "А. Пушкин", "М. Лермонтов"], 0),
  single("ruslit", "Автор «Бородино»?", ["М. Лермонтов", "А. Пушкин", "Н. Некрасов", "А. Блок"], 0),
  single("ruslit", "А. Чехов по образованию?", ["врач", "инженер", "учитель", "юрист"], 0),
];
const law: Q[] = [
  single("law", "Ең жоғары заң күші бар құжат?", ["Конституция", "жарлық", "бұйрық", "ереже"], 0),
  single("law", "ҚР Конституциясы (қолданыстағы) жылы?", ["1995", "1991", "1993", "1998"], 0),
  single("law", "ҚР-да билік неше тармаққа бөлінеді?", ["3", "2", "4", "5"], 0),
  single("law", "ҚР-да кәмелетке толу жасы?", ["18", "16", "21", "14"], 0),
  single("law", "Заң шығаратын орган?", ["Парламент", "Үкімет", "Сот", "Әкімдік"], 0),
  single("law", "Адам құқықтары негізінен қайда жазылған?", ["Конституция", "газет", "кітап", "жарнама"], 0),
];

async function run() {
  await AppDataSource.initialize();
  console.log("✓ Базаға қосылды");
  const userRepo = AppDataSource.getRepository(User);
  const testRepo = AppDataSource.getRepository(Test);

  const email = "dauletkiyalbek08@gmail.com";
  const user = await userRepo.findOne({ where: { email } });
  if (user) {
    user.plan = "premium";
    user.planPeriod = "year";
    const end = new Date(); end.setMonth(end.getMonth() + 12);
    user.planEndsAt = end;
    await userRepo.save(user);
    console.log(`✓ ${email} → Премиум (жыл)`);
  } else console.log(`⚠ ${email} табылмады`);

  await AppDataSource.createQueryBuilder().delete().from(Result).execute();
  await AppDataSource.createQueryBuilder().delete().from(Question).execute();
  await AppDataSource.createQueryBuilder().delete().from(Test).execute();
  console.log("✓ Рейтинг тазартылды, тесттер жойылды");

  const questions: Q[] = [
    ...history,           // 20
    ...readlit,           // 10
    ...mathlit10(),       // 10
    ...mathProfile(),     // 40 (50 балл)
    ...physicsProfile(),  // 40 (50 балл)
    ...chemistry, ...biology, ...geography, ...informatics, ...worldhistory,
    ...foreign, ...kazlang, ...kazlit, ...ruslang, ...ruslit, ...law,
  ];

  const trial = testRepo.create({
    title: "Пробное ҰБТ — апталық нұсқа",
    subjectId: "ent", difficulty: "Орташа", year: 2026, topic: "ҰБТ форматы",
    durationMin: 240, isTrial: true, weekLabel: "2026-W24", published: true,
    questions: questions.map((q) => testRepo.manager.create(Question, q)),
  });
  await testRepo.save(trial);

  const points: Record<string, number> = {};
  questions.forEach((q) => (points[q.subject] = (points[q.subject] ?? 0) + q.points));
  console.log(`✓ Пробное ҰБТ: ${questions.length} сұрақ. Макс балл по предметам:`, points);

  await AppDataSource.destroy();
  console.log("✅ Дайын!");
}

run().catch((err) => { console.error("❌ Қате:", err); process.exit(1); });
