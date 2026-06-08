import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Result } from "../entities/result.entity";
import { PlansService } from "../plans/plans.service";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Result)
    private readonly results: Repository<Result>,
    private readonly plansService: PlansService
  ) {}

  async dashboard() {
    const users = await this.users.find();
    const results = await this.results.find({ select: { createdAt: true } });
    const prices = await this.plansService.priceMap();
    const priceOf = (plan: string, period?: string | null) =>
      prices[plan]?.[period === "year" ? "year" : "quarter"] ?? 0;
    const now = Date.now();

    let revenue = 0;
    let activeSubscriptions = 0;
    const byPlan: Record<string, number> = { standard: 0, premium: 0 };
    const byPeriod = { quarter: 0, year: 0 };

    for (const u of users) {
      if (u.plan && u.plan !== "free") {
        byPlan[u.plan] = (byPlan[u.plan] ?? 0) + 1;
        revenue += priceOf(u.plan, u.planPeriod);
        const per = u.planPeriod === "year" ? "year" : "quarter";
        byPeriod[per]++;
        if (!u.planEndsAt || new Date(u.planEndsAt).getTime() > now) activeSubscriptions++;
      }
    }

    // прохождения по неделям (последние 8 недель)
    const counts = Array(8).fill(0);
    for (const r of results) {
      const diff = Math.floor((now - new Date(r.createdAt).getTime()) / (7 * 86400_000));
      if (diff >= 0 && diff < 8) counts[diff]++;
    }
    const weekly = counts
      .map((count, i) => {
        const d = new Date(now - i * 7 * 86400_000);
        const label = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
        return { label, count };
      })
      .reverse();

    return {
      totalUsers: users.length,
      students: users.filter((u) => u.role !== "admin").length,
      admins: users.filter((u) => u.role === "admin").length,
      activeSubscriptions,
      premiumUsers: byPlan.premium + byPlan.max,
      revenue,
      byPlan,
      byPeriod,
      totalAttempts: results.length,
      weekly,
    };
  }
}
