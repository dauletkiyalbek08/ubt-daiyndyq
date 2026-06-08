import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Test } from "../entities/test.entity";
import { Question } from "../entities/question.entity";
import { CreateTestDto, UpdateTestDto } from "./dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test)
    private readonly tests: Repository<Test>,
    @InjectRepository(Question)
    private readonly questions: Repository<Question>,
    private readonly notifs: NotificationsService
  ) {}

  // Список тестов с поддержкой фильтров
  async findAll(filters: {
    subjectId?: string;
    difficulty?: string;
    year?: string;
    q?: string;
  }) {
    const qb = this.tests.createQueryBuilder("test");

    // Обычный список тестов не включает пробные ҰБТ
    qb.where("test.isTrial = false");

    if (filters.subjectId)
      qb.andWhere("test.subjectId = :subjectId", { subjectId: filters.subjectId });
    if (filters.difficulty)
      qb.andWhere("test.difficulty = :difficulty", { difficulty: filters.difficulty });
    if (filters.year)
      qb.andWhere("test.year = :year", { year: Number(filters.year) });
    if (filters.q)
      qb.andWhere("(test.title ILIKE :q OR test.topic ILIKE :q)", { q: `%${filters.q}%` });

    qb.loadRelationCountAndMap("test.questionsCount", "test.questions");
    qb.orderBy("test.createdAt", "DESC");
    return qb.getMany();
  }

  // Тест с вопросами (для прохождения). Скрываем правильные ответы при необходимости.
  async findOne(id: string, includeAnswers = false) {
    const test = await this.tests.findOne({
      where: { id },
      relations: { questions: true },
    });
    if (!test) throw new NotFoundException("Тест табылмады");

    if (!includeAnswers) {
      test.questions = test.questions.map((q) => {
        const safe: any = {
          ...q,
          correctIndex: -1,
          correctIndexes: null,
          explanation: "",
        };
        // для «соответствия» перемешиваем правую колонку, чтобы не выдать ответ
        if (q.type === "matching" && q.matchRight) {
          safe.matchRight = [...q.matchRight].sort(() => Math.random() - 0.5);
        }
        return safe;
      }) as Question[];
    }
    return test;
  }

  // Список пробных ҰБТ (еженедельные варианты), новые сверху.
  // Для учеников показываем только опубликованные, админ видит все.
  listTrials(onlyPublished = false) {
    const qb = this.tests.createQueryBuilder("test");
    qb.where("test.isTrial = true");
    if (onlyPublished) qb.andWhere("test.published = true");
    qb.loadRelationCountAndMap("test.questionsCount", "test.questions");
    qb.orderBy("test.createdAt", "DESC");
    return qb.getMany();
  }

  async create(dto: CreateTestDto) {
    // Если задана будущая дата публикации — тест создаётся скрытым (опубликует крон)
    const publishAt = dto.publishAt ? new Date(dto.publishAt) : null;
    const scheduled = !!publishAt && publishAt.getTime() > Date.now();

    const test = this.tests.create({
      title: dto.title,
      subjectId: dto.subjectId,
      difficulty: dto.difficulty as Test["difficulty"],
      year: dto.year,
      topic: dto.topic,
      durationMin: dto.durationMin,
      isTrial: dto.isTrial ?? false,
      weekLabel: dto.weekLabel ?? null,
      publishAt,
      published: !scheduled,
      questions: dto.questions?.map((q) => this.questions.create(q)),
    });
    const saved = await this.tests.save(test);

    // Уведомляем сразу только если тест уже опубликован (иначе уведомит крон)
    if (saved.published) {
      await this.notifs.notifyNewTest(saved.title, saved.isTrial);
    }
    return saved;
  }

  // Авто-публикация: находит тесты с наступившей датой публикации и публикует их
  async publishDueTrials() {
    const due = await this.tests
      .createQueryBuilder("test")
      .where("test.published = false")
      .andWhere("test.publishAt IS NOT NULL")
      .andWhere("test.publishAt <= :now", { now: new Date() })
      .getMany();

    for (const t of due) {
      t.published = true;
      await this.tests.save(t);
      await this.notifs.notifyNewTest(t.title, t.isTrial);
    }
    return { published: due.length };
  }

  async update(id: string, dto: UpdateTestDto) {
    const test = await this.tests.findOne({
      where: { id },
      relations: { questions: true },
    });
    if (!test) throw new NotFoundException("Тест табылмады");

    Object.assign(test, {
      title: dto.title,
      subjectId: dto.subjectId,
      difficulty: dto.difficulty ?? test.difficulty,
      year: dto.year,
      topic: dto.topic,
      durationMin: dto.durationMin ?? test.durationMin,
    });

    if (dto.questions) {
      await this.questions.delete({ testId: id });
      test.questions = dto.questions.map((q) =>
        this.questions.create({ ...q, testId: id })
      );
    }

    return this.tests.save(test);
  }

  async remove(id: string) {
    const test = await this.tests.findOne({ where: { id } });
    if (!test) throw new NotFoundException("Тест табылмады");
    await this.tests.remove(test);
    return { success: true };
  }
}
