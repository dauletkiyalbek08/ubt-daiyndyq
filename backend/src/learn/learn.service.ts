import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tarau } from "../entities/tarau.entity";
import { Topic, TopicMaterial } from "../entities/topic.entity";
import { Result } from "../entities/result.entity";
import { User } from "../entities/user.entity";
import { hasPremiumAccess } from "../auth/access";

export interface TarauDto {
  subjectId: string;
  title: string;
  order?: number;
  imageUrl?: string | null;
  description?: string | null;
}

export interface TopicDto {
  tarauId: string;
  title: string;
  order?: number;
  presentationUrl?: string | null;
  materials?: TopicMaterial[] | null;
  testId?: string | null;
  passPercent?: number;
}

@Injectable()
export class LearnService {
  constructor(
    @InjectRepository(Tarau)
    private readonly tarautar: Repository<Tarau>,
    @InjectRepository(Topic)
    private readonly topics: Repository<Topic>,
    @InjectRepository(Result)
    private readonly results: Repository<Result>,
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) {}

  // ===== АДМИН: тарау (главы) =====
  createTarau(dto: TarauDto) {
    return this.tarautar.save(
      this.tarautar.create({
        subjectId: dto.subjectId,
        title: dto.title,
        imageUrl: dto.imageUrl ?? null,
        description: dto.description ?? null,
        order: dto.order ?? 0,
      })
    );
  }

  async updateTarau(id: string, dto: Partial<TarauDto>) {
    const t = await this.tarautar.findOne({ where: { id } });
    if (!t) throw new NotFoundException("Тарау табылмады");
    Object.assign(t, {
      title: dto.title ?? t.title,
      subjectId: dto.subjectId ?? t.subjectId,
      order: dto.order ?? t.order,
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : t.imageUrl,
      description: dto.description !== undefined ? dto.description : t.description,
    });
    return this.tarautar.save(t);
  }

  async removeTarau(id: string) {
    const t = await this.tarautar.findOne({ where: { id } });
    if (!t) throw new NotFoundException("Тарау табылмады");
    await this.tarautar.remove(t); // cascade удалит вложенные темы
    return { success: true };
  }

  // ===== АДМИН: темы =====
  createTopic(dto: TopicDto) {
    return this.topics.save(
      this.topics.create({
        tarauId: dto.tarauId,
        title: dto.title,
        order: dto.order ?? 0,
        presentationUrl: dto.presentationUrl ?? null,
        materials: dto.materials ?? null,
        testId: dto.testId ?? null,
        passPercent: dto.passPercent ?? 70,
      })
    );
  }

  async updateTopic(id: string, dto: Partial<TopicDto>) {
    const t = await this.topics.findOne({ where: { id } });
    if (!t) throw new NotFoundException("Тақырып табылмады");
    // undefined = поле не прислали (не трогаем); null = очистить
    Object.assign(t, {
      title: dto.title ?? t.title,
      order: dto.order ?? t.order,
      presentationUrl:
        dto.presentationUrl !== undefined ? dto.presentationUrl : t.presentationUrl,
      materials: dto.materials !== undefined ? dto.materials : t.materials,
      testId: dto.testId !== undefined ? dto.testId : t.testId,
      passPercent: dto.passPercent ?? t.passPercent,
    });
    return this.topics.save(t);
  }

  async removeTopic(id: string) {
    const t = await this.topics.findOne({ where: { id } });
    if (!t) throw new NotFoundException("Тақырып табылмады");
    await this.topics.remove(t);
    return { success: true };
  }

  // Лучший процент по каждому тесту у пользователя (для подсчёта прогресса).
  private async bestPercentByTest(userId: string): Promise<Map<string, number>> {
    const rows = await this.results.find({ where: { userId } });
    const map = new Map<string, number>();
    for (const r of rows) {
      const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
      if (pct > (map.get(r.testId) ?? 0)) map.set(r.testId, pct);
    }
    return map;
  }

  // Загрузить тарау предмета с темами, отсортированными по порядку.
  private async loadTarautar(subjectId: string) {
    const list = await this.tarautar.find({
      where: { subjectId },
      relations: { topics: true },
      order: { order: "ASC", createdAt: "ASC" },
    });
    for (const t of list) {
      t.topics = (t.topics ?? []).sort(
        (a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime()
      );
    }
    return list;
  }

  // ===== АДМИН: полная структура предмета (с материалами и тестами) =====
  loadForAdmin(subjectId: string) {
    return this.loadTarautar(subjectId);
  }

  // ===== УЧЕНИК: структура предмета с состоянием тем (замки/прогресс) =====
  // Темы внутри предмета образуют одну цепочку «по очереди»: следующая открыта,
  // только когда предыдущая пройдена (≥ passPercent). Тема без теста не блокирует.
  async overview(subjectId: string, userId?: string) {
    const user = userId
      ? await this.users.findOne({ where: { id: userId } })
      : null;
    const hasAccess = user ? hasPremiumAccess(user) : false;
    const isAdmin = user?.role === "admin";

    const tarautar = await this.loadTarautar(subjectId);
    const best = userId
      ? await this.bestPercentByTest(userId)
      : new Map<string, number>();

    let chainOpen = true; // открыта ли ещё цепочка к текущей теме
    const out = tarautar.map((tar) => ({
      id: tar.id,
      title: tar.title,
      imageUrl: tar.imageUrl,
      description: tar.description,
      order: tar.order,
      topics: tar.topics.map((tp) => {
        const bestPercent = tp.testId ? best.get(tp.testId) ?? null : null;
        const completed =
          !!tp.testId && bestPercent !== null && bestPercent >= tp.passPercent;
        const passedGate = !tp.testId || completed; // тема без теста не блокирует
        const unlocked = chainOpen || isAdmin;
        const state: "completed" | "open" | "locked" = completed
          ? "completed"
          : unlocked
          ? "open"
          : "locked";
        chainOpen = chainOpen && passedGate; // цепочка рвётся на первой непройденной
        return {
          id: tp.id,
          title: tp.title,
          order: tp.order,
          hasPresentation: !!tp.presentationUrl,
          materialsCount: tp.materials?.length ?? 0,
          hasTest: !!tp.testId,
          passPercent: tp.passPercent,
          bestPercent,
          state,
        };
      }),
    }));
    return { hasAccess, tarautar: out };
  }

  // ===== УЧЕНИК: один курс (тарау) с темами и их состоянием =====
  async courseDetail(tarauId: string, userId?: string) {
    const tarau = await this.tarautar.findOne({ where: { id: tarauId } });
    if (!tarau) throw new NotFoundException("Курс табылмады");
    const ov = await this.overview(tarau.subjectId, userId);
    const course = ov.tarautar.find((t) => t.id === tarauId);
    return {
      hasAccess: ov.hasAccess,
      course: {
        id: tarau.id,
        title: tarau.title,
        imageUrl: tarau.imageUrl,
        description: tarau.description,
        subjectId: tarau.subjectId,
      },
      topics: course?.topics ?? [],
    };
  }

  // ===== УЧЕНИК: детали темы (презентация + книги + тест) =====
  // Доступ только Premium и только если тема разблокирована (админ — всегда).
  async topicDetail(id: string, userId?: string) {
    const topic = await this.topics.findOne({
      where: { id },
      relations: { tarau: true },
    });
    if (!topic) throw new NotFoundException("Тақырып табылмады");

    const user = userId
      ? await this.users.findOne({ where: { id: userId } })
      : null;
    const isAdmin = user?.role === "admin";

    if (!isAdmin) {
      if (!user || !hasPremiumAccess(user)) {
        throw new ForbiddenException(
          "Оқу бөлімі тек Premium тарифінде қолжетімді"
        );
      }
      const ov = await this.overview(topic.tarau.subjectId, userId);
      const found = ov.tarautar
        .flatMap((t) => t.topics)
        .find((t) => t.id === id);
      if (found?.state === "locked") {
        throw new ForbiddenException("Алдымен алдыңғы тақырыпты аяқтаңыз");
      }
    }

    const best = userId
      ? await this.bestPercentByTest(userId)
      : new Map<string, number>();
    const bestPercent = topic.testId ? best.get(topic.testId) ?? null : null;

    return {
      id: topic.id,
      tarauId: topic.tarauId,
      tarauTitle: topic.tarau.title,
      subjectId: topic.tarau.subjectId,
      title: topic.title,
      order: topic.order,
      presentationUrl: topic.presentationUrl,
      materials: topic.materials ?? [],
      testId: topic.testId,
      passPercent: topic.passPercent,
      bestPercent,
      passed:
        !!topic.testId &&
        bestPercent !== null &&
        bestPercent >= topic.passPercent,
    };
  }
}
