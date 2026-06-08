import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Result } from "../entities/result.entity";
import { Test } from "../entities/test.entity";
import { User } from "../entities/user.entity";
import { hasPremiumAccess } from "../auth/access";

export type SubmitDto = {
  testId: string;
  // ответы: { questionId: number | number[] | string[] } в зависимости от типа
  answers: Record<string, any>;
  // для пробного ҰБТ: выбранные профильные предметы
  subjects?: string[];
};

// Обязательные предметы пробного ҰБТ (учитываются всегда)
const MANDATORY_SUBJECTS = ["history", "mathlit", "readlit"];

// Сравнение множеств индексов (для вопросов с несколькими ответами)
function sameSet(a: any, b: any): boolean {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}
// Сравнение массивов строк по порядку (для соответствия)
function sameOrder(a: any, b: any): boolean {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Result)
    private readonly results: Repository<Result>,
    @InjectRepository(Test)
    private readonly tests: Repository<Test>,
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) {}

  // Проверяем ответы на сервере (нельзя доверять клиенту) и сохраняем результат
  async submit(userId: string, dto: SubmitDto) {
    const test = await this.tests.findOne({
      where: { id: dto.testId },
      relations: { questions: true },
    });
    if (!test) throw new NotFoundException("Тест табылмады");

    // Пробное ҰБТ можно проходить только с тарифом Premium/Maximum
    if (test.isTrial) {
      const user = await this.users.findOne({ where: { id: userId } });
      if (!hasPremiumAccess(user!)) {
        throw new ForbiddenException(
          "Пробное ҰБТ тек Премиум тарифінде қолжетімді"
        );
      }
    }

    // Для пробного ҰБТ считаем только обязательные + выбранные профильные предметы
    let scoredQuestions = test.questions;
    if (test.isTrial && dto.subjects && dto.subjects.length > 0) {
      const allowed = new Set([...MANDATORY_SUBJECTS, ...dto.subjects]);
      scoredQuestions = test.questions.filter(
        (q) => !q.subject || allowed.has(q.subject)
      );
    }

    let score = 0; // набранные баллы
    let maxScore = 0; // максимум баллов
    // статистика по предметам
    const subjAcc: Record<string, { score: number; max: number; correct: number; total: number }> = {};

    const review = scoredQuestions.map((q) => {
      const ua = dto.answers[q.id];
      const pts = q.points ?? 1;
      let correct = false;

      if (q.type === "multiple") {
        correct = sameSet(ua, q.correctIndexes ?? []);
      } else if (q.type === "matching") {
        correct = sameOrder(ua, q.matchRight ?? []);
      } else {
        // single | context
        correct = ua === q.correctIndex;
      }

      const gained = correct ? pts : 0;
      score += gained;
      maxScore += pts;

      const subj = q.subject ?? "other";
      const a = (subjAcc[subj] ??= { score: 0, max: 0, correct: 0, total: 0 });
      a.score += gained;
      a.max += pts;
      a.total += 1;
      if (correct) a.correct += 1;

      return {
        questionId: q.id,
        type: q.type,
        subject: q.subject ?? null,
        context: q.context ?? null,
        text: q.text,
        options: q.options,
        matchLeft: q.matchLeft ?? null,
        matchRight: q.matchRight ?? null,
        correctIndex: q.correctIndex,
        correctIndexes: q.correctIndexes ?? null,
        userAnswer: ua ?? null,
        correct,
        points: pts,
        gained,
        explanation: q.explanation,
        imageUrl: q.imageUrl ?? null,
      };
    });

    const bySubject = Object.entries(subjAcc).map(([subjectId, v]) => ({
      subjectId,
      ...v,
    }));

    const result = this.results.create({
      userId,
      testId: test.id,
      testTitle: test.title,
      subjectId: test.subjectId,
      score,
      total: maxScore, // храним максимум баллов как «total»
      isTrial: test.isTrial,
      bySubject, // разбивка по предметам — для анализа в кабинете
    });
    await this.results.save(result);

    return {
      resultId: result.id,
      score,
      total: maxScore,
      percent: Math.round((score / Math.max(1, maxScore)) * 100),
      bySubject,
      review,
    };
  }

  // История результатов пользователя
  findByUser(userId: string) {
    return this.results.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  // Аналитика: прогресс по дням + результаты по предметам
  async analytics(userId: string) {
    const rows = await this.results.find({
      where: { userId },
      order: { createdAt: "ASC" },
    });

    // Прогресс: средний процент по дням (последние 8 дней с активностью)
    const byDay = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      const day = r.createdAt.toISOString().slice(0, 10);
      const pct = (r.score / Math.max(1, r.total)) * 100;
      const e = byDay.get(day) ?? { sum: 0, count: 0 };
      e.sum += pct;
      e.count++;
      byDay.set(day, e);
    }
    const weekly = Array.from(byDay.entries())
      .map(([day, e]) => ({
        label: day.slice(8, 10) + "." + day.slice(5, 7), // dd.MM
        value: Math.round(e.sum / e.count),
      }))
      .slice(-8);

    // По предметам: средний процент и количество.
    // Для пробного ҰБТ берём детальную разбивку bySubject (история/матем/физика…),
    // для старых/обычных результатов — общий subjectId всего теста.
    const bySubject = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      if (Array.isArray(r.bySubject) && r.bySubject.length > 0) {
        for (const s of r.bySubject) {
          const pct = (s.score / Math.max(1, s.max)) * 100;
          const e = bySubject.get(s.subjectId) ?? { sum: 0, count: 0 };
          e.sum += pct;
          e.count++;
          bySubject.set(s.subjectId, e);
        }
      } else if (r.subjectId) {
        const pct = (r.score / Math.max(1, r.total)) * 100;
        const e = bySubject.get(r.subjectId) ?? { sum: 0, count: 0 };
        e.sum += pct;
        e.count++;
        bySubject.set(r.subjectId, e);
      }
    }
    const subjects = Array.from(bySubject.entries())
      .map(([subjectId, e]) => ({
        subjectId,
        avg: Math.round(e.sum / e.count),
        count: e.count,
      }))
      .sort((a, b) => b.avg - a.avg);

    return { weekly, subjects };
  }

  // Сводная статистика для личного кабинета
  async stats(userId: string) {
    const rows = await this.results.find({ where: { userId } });
    if (rows.length === 0) {
      return { testsCompleted: 0, averageScore: 0, bestScore: 0, worstScore: 0, correctRate: 0 };
    }
    const percents = rows.map((r) => (r.score / Math.max(1, r.total)) * 100);
    const avg = percents.reduce((a, b) => a + b, 0) / percents.length;
    return {
      testsCompleted: rows.length,
      averageScore: Math.round(avg),
      bestScore: Math.round(Math.max(...percents)),
      worstScore: Math.round(Math.min(...percents)),
      correctRate: Math.round(avg),
    };
  }
}
