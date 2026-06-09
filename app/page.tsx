import Link from "next/link";
import { platformStats } from "@/lib/mock-data";
import { ENT_PROFILE_SUBJECTS } from "@/lib/ent";
import { Reveal } from "@/components/Reveal";
import { PlansPreview } from "@/components/PlansPreview";
import { SubjectIcon } from "@/components/SubjectIcon";
import { GraduationCap, Library, Languages, Clock, BarChart3, Sparkles, Rocket } from "lucide-react";

const SUBJECT_COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-rose-50 text-rose-600",
  "bg-violet-50 text-violet-600",
  "bg-amber-50 text-amber-600",
  "bg-cyan-50 text-cyan-600",
  "bg-indigo-50 text-indigo-600",
  "bg-teal-50 text-teal-600",
];

const advantages = [
  { icon: GraduationCap, title: "Өзекті ҰБТ тапсырмалары", text: "Нақты ҰБТ форматына сәйкес жаңартылып отыратын тапсырмалар.", grad: "from-blue-500 to-indigo-500" },
  { icon: Library, title: "Үлкен тесттер базасы", text: "Барлық пәндер бойынша мыңдаған тест пен сұрақ.", grad: "from-emerald-500 to-teal-500" },
  { icon: Languages, title: "Толық қазақ тілінде", text: "Барлық материалдар мен интерфейс қазақ тілінде.", grad: "from-sky-500 to-cyan-500" },
  { icon: Clock, title: "Кез келген уақытта", text: "Қалаған уақытта, қалаған жерде дайындалыңыз.", grad: "from-violet-500 to-purple-500" },
  { icon: BarChart3, title: "Нәтижелер статистикасы", text: "Прогресіңізді бақылаңыз, әлсіз тақырыптарды табыңыз.", grad: "from-amber-500 to-orange-500" },
  { icon: Sparkles, title: "Ыңғайлы интерфейс", text: "Қарапайым әрі заманауи дизайн, жылдам жүктелу.", grad: "from-rose-500 to-pink-500" },
];

const steps = [
  { num: "1", title: "Тіркеліңіз", text: "Бірнеше секундта аккаунт ашыңыз." },
  { num: "2", title: "Тариф таңдаңыз", text: "Өзіңізге қолайлы жоспарды таңдаңыз." },
  { num: "3", title: "Тест тапсырыңыз", text: "Тесттер мен пробное ҰБТ-дан өтіңіз." },
  { num: "4", title: "Прогресті бақылаңыз", text: "Нәтижелеріңізді талдаңыз және жақсартыңыз." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Декоративный фон: сетка + плавающие градиентные пятна */}
        <div className="pointer-events-none absolute inset-0 bg-grid-slate [background-size:40px_40px]" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />

        <div className="container-page relative grid items-center gap-12 py-16 md:grid-cols-2 md:py-28">
          <div>
            <span className="badge inline-flex animate-fade-in items-center gap-1.5 bg-brand/10 text-brand">
              <Rocket className="h-3.5 w-3.5" /> №1 қазақ тіліндегі ҰБТ платформасы
            </span>
            <h1 className="mt-5 animate-fade-up text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              ҰБТ-ға дайындалудың <span className="text-gradient">ең тиімді</span> платформасы
            </h1>
            <p className="mt-6 max-w-lg animate-fade-up text-lg text-slate-600 [animation-delay:120ms]">
              Біз сәтті дайындық үшін мыңдаған тапсырмалар мен тесттерді жинадық. Қазір бастаңыз және
              нәтижеңізді арттырыңыз.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 animate-fade-up [animation-delay:240ms]">
              <Link href="/register" className="btn-primary text-lg">
                Қазір бастау →
              </Link>
              <Link href="/tests" className="btn-secondary text-lg">
                Тесттерді көру
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 animate-fade-up [animation-delay:360ms]">
              <div className="flex -space-x-2">
                {["А", "Н", "Д", "Е"].map((l, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand-light text-xs font-semibold text-white"
                  >
                    {l}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">25 000+</span> оқушы дайындалуда
              </p>
            </div>
          </div>

          <div className="animate-scale-in [animation-delay:200ms]">
            <div className="card-interactive relative">
              {/* Пульсирующая точка «онлайн» */}
              <span className="absolute -right-2 -top-2 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Бүгінгі прогресс</p>
                  <p className="text-3xl font-bold text-slate-900">118 балл</p>
                </div>
                <span className="badge bg-emerald-50 text-emerald-600">+14 ↑</span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { s: "Математика", v: 85 },
                  { s: "Қазақстан тарихы", v: 92 },
                  { s: "Физика", v: 64 },
                ].map((row) => (
                  <div key={row.s}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-slate-600">{row.s}</span>
                      <span className="font-semibold text-slate-900">{row.v}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light"
                        style={{ width: `${row.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="container-page -mt-6 pb-16">
        <Reveal className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card md:grid-cols-4">
          {[
            { label: "Тесттер саны", value: platformStats.totalTests },
            { label: "Оқушылар", value: platformStats.totalStudents },
            { label: "Орташа өсім", value: platformStats.averageImprovement },
            { label: "Тест тапсырулар", value: platformStats.totalAttempts },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-gradient sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Преимущества */}
      <section className="container-page py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Неліктен бізді таңдайды?
          </h2>
          <p className="mt-3 text-slate-600">Платформаның басты артықшылықтары</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((adv, i) => (
            <Reveal key={adv.title} delay={i * 80}>
              <div className="card-interactive group h-full">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${adv.grad} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <adv.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{adv.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{adv.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Предметы */}
      <section className="bg-white py-16">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Бейіндік пәндер
            </h2>
            <p className="mt-3 text-slate-600">
              Мамандығыңызға қажет профильдік пәндер бойынша дайындалыңыз
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {ENT_PROFILE_SUBJECTS.map((subj, i) => (
              <Reveal key={subj.id} delay={i * 40}>
                <Link
                  href={`/tests?subject=${subj.id}`}
                  className="card group flex items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card-hover"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}
                  >
                    <SubjectIcon id={subj.id} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 break-words text-sm font-medium leading-tight text-slate-800 group-hover:text-brand sm:text-base">
                    {subj.name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="container-page py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Қалай жұмыс істейді?
          </h2>
          <p className="mt-3 text-slate-600">4 қарапайым қадам</p>
        </Reveal>
        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Соединительная линия */}
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent lg:block" />
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 120} className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-light text-lg font-bold text-white shadow-glow">
                {step.num}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 max-w-[14rem] text-sm text-slate-600">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Тарифы (превью) */}
      <section className="bg-white py-16">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Қолжетімді тарифтер
            </h2>
            <p className="mt-3 text-slate-600">Өзіңізге қолайлы жоспарды таңдаңыз</p>
          </Reveal>
          <p className="mx-auto -mt-2 mb-8 text-center text-sm text-emerald-600">
            Жылдық жазылымда <b>30% жеңілдік</b>
          </p>
          <Reveal>
            <PlansPreview />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <Reveal>
          <div className="shimmer-overlay relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-dark px-6 py-16 text-center text-white shadow-glow sm:px-8">
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1 text-sm font-medium text-white">
              <GraduationCap className="h-4 w-4" /> 25 000+ оқушы сенеді
            </span>
            <h2 className="relative mt-4 text-3xl font-bold sm:text-4xl">Дайындықты бүгін бастаңыз</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/90">
              Мыңдаған оқушы біздің платформамен ҰБТ-ға дайындалуда. Сіз де қосылыңыз!
            </p>
            <Link
              href="/register"
              style={{ backgroundColor: "#ffffff", color: "#0D9488" }}
              className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Тегін тіркелу →
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
