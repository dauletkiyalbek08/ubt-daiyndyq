import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Webinar } from "../entities/webinar.entity";
import { User } from "../entities/user.entity";
import { hasPremiumAccess } from "../auth/access";
import { NotificationsService } from "../notifications/notifications.service";

export interface WebinarDto {
  title: string;
  speaker?: string | null;
  description?: string | null;
  startsAt: string; // ISO-дата
  link: string;
}

@Injectable()
export class WebinarsService {
  constructor(
    @InjectRepository(Webinar)
    private readonly webinars: Repository<Webinar>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly notifs: NotificationsService
  ) {}

  // Список вебинаров. Ссылку отдаём только тем, у кого есть доступ (Premium/админ).
  async list(userId?: string) {
    const user = userId
      ? await this.users.findOne({ where: { id: userId } })
      : null;
    const hasAccess = user ? hasPremiumAccess(user) : false;

    const rows = await this.webinars.find({ order: { startsAt: "DESC" } });
    const now = Date.now();
    const webinars = rows.map((w) => ({
      id: w.id,
      title: w.title,
      speaker: w.speaker,
      description: w.description,
      startsAt: w.startsAt,
      link: hasAccess ? w.link : null, // без доступа ссылку прячем
      isPast: new Date(w.startsAt).getTime() < now,
    }));
    return { hasAccess, webinars };
  }

  async create(dto: WebinarDto) {
    const saved = await this.webinars.save(
      this.webinars.create({
        title: dto.title,
        speaker: dto.speaker ?? null,
        description: dto.description ?? null,
        startsAt: new Date(dto.startsAt),
        link: dto.link,
      })
    );
    // Уведомляем учеников с доступом о новом вебинаре
    await this.notifs.notifyNewWebinar(saved.title, saved.startsAt);
    return saved;
  }

  async update(id: string, dto: Partial<WebinarDto>) {
    const w = await this.webinars.findOne({ where: { id } });
    if (!w) throw new NotFoundException("Вебинар табылмады");
    Object.assign(w, {
      title: dto.title ?? w.title,
      speaker: dto.speaker !== undefined ? dto.speaker : w.speaker,
      description:
        dto.description !== undefined ? dto.description : w.description,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : w.startsAt,
      link: dto.link ?? w.link,
    });
    return this.webinars.save(w);
  }

  async remove(id: string) {
    const w = await this.webinars.findOne({ where: { id } });
    if (!w) throw new NotFoundException("Вебинар табылмады");
    await this.webinars.remove(w);
    return { success: true };
  }
}
