import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { NotificationsService } from "../notifications/notifications.service";

// Сколько месяцев действует тариф по умолчанию
const PLAN_LABELS: Record<string, string> = {
  free: "Тегін",
  standard: "Стандарт",
  premium: "Премиум",
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly notifs: NotificationsService
  ) {}

  private publicUser(u: User) {
    const { passwordHash, ...rest } = u;
    return rest;
  }

  async findAll() {
    const rows = await this.users.find({ order: { createdAt: "DESC" } });
    return rows.map((u) => this.publicUser(u));
  }

  async stats() {
    const total = await this.users.count();
    const admins = await this.users.count({ where: { role: "admin" } });
    const premium = await this.users.count({ where: { plan: "premium" } });
    return {
      totalUsers: total,
      admins,
      students: total - admins,
      premiumUsers: premium,
    };
  }

  // Админ выдаёт/меняет тариф. period: quarter (3 мес) | year (год).
  async setPlan(id: string, plan: string, period: string = "quarter") {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Пайдаланушы табылмады");

    if (plan === "free") {
      user.plan = "free";
      user.planPeriod = null;
      user.planEndsAt = null;
    } else {
      user.plan = plan;
      user.planPeriod = period === "year" ? "year" : "quarter";
      const months = period === "year" ? 12 : 3;
      const end = new Date();
      end.setMonth(end.getMonth() + months);
      user.planEndsAt = end;
    }
    await this.users.save(user);

    if (plan !== "free") {
      const periodLabel = user.planPeriod === "year" ? "1 жыл" : "3 ай";
      await this.notifs.notifyPlanActivated(
        user.id,
        `${PLAN_LABELS[plan] ?? plan} (${periodLabel})`
      );
    }
    return this.publicUser(user);
  }

  // Сброс просроченных подписок на free + уведомление (вызывается кроном раз в сутки)
  async expireSubscriptions() {
    const expired = await this.users
      .createQueryBuilder("u")
      .where("u.plan != 'free'")
      .andWhere("u.planEndsAt IS NOT NULL")
      .andWhere("u.planEndsAt < :now", { now: new Date() })
      .getMany();

    for (const u of expired) {
      u.plan = "free";
      u.planPeriod = null;
      await this.users.save(u);
      await this.notifs.create(
        u.id,
        "sub_ended",
        "Жазылым аяқталды ⛔",
        "Тарифіңіздің мерзімі бітті. Жалғастыру үшін тарифті жаңартыңыз."
      );
    }
    return { expired: expired.length };
  }
}
