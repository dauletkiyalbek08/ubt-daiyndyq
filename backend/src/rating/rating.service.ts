import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";
import { Result } from "../entities/result.entity";

export type Period = "week" | "month" | "all";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  score: number; // лучший результат в процентах
  date: string;
};

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Result)
    private readonly results: Repository<Result>
  ) {}

  private sinceDate(period: Period): Date | null {
    if (period === "week") return new Date(Date.now() - 7 * 86400_000);
    if (period === "month") return new Date(Date.now() - 30 * 86400_000);
    return null;
  }

  // Таблица лидеров: лучший результат пробного ҰБТ (в %) каждого ученика за период.
  // Учитываются ТОЛЬКО пробные ҰБТ (isTrial) — обычные тесты в рейтинг не идут.
  async leaderboard(period: Period): Promise<LeaderboardRow[]> {
    const since = this.sinceDate(period);
    const rows = await this.results.find({
      where: since ? { isTrial: true, createdAt: MoreThanOrEqual(since) } : { isTrial: true },
      relations: { user: true },
      order: { createdAt: "DESC" },
    });

    // группируем по пользователю, берём лучший процент
    const best = new Map<string, LeaderboardRow>();
    for (const r of rows) {
      if (!r.user) continue;
      const percent = Math.round((r.score / Math.max(1, r.total)) * 100);
      const name = `${r.user.firstName} ${r.user.lastName ?? ""}`.trim();
      const existing = best.get(r.userId);
      if (!existing || percent > existing.score) {
        best.set(r.userId, {
          rank: 0,
          userId: r.userId,
          name,
          score: percent,
          date: r.createdAt.toISOString(),
        });
      }
    }

    const list = Array.from(best.values()).sort((a, b) => b.score - a.score);
    list.forEach((row, i) => (row.rank = i + 1));
    return list.slice(0, 100);
  }

  // Достижения текущего пользователя — по результатам ПРОБНЫХ ҰБТ
  async achievements(userId: string) {
    const rows = await this.results.find({
      where: { userId, isTrial: true },
      order: { createdAt: "ASC" },
    });
    const count = rows.length;
    const bestPercent = rows.reduce(
      (m, r) => Math.max(m, Math.round((r.score / Math.max(1, r.total)) * 100)),
      0
    );

    // место в общем рейтинге пробных ҰБТ
    const board = await this.leaderboard("all");
    const myRank = board.find((b) => b.userId === userId)?.rank ?? Infinity;

    return [
      { id: "a1", icon: "🎯", title: "Алғашқы сынақ", description: "Бірінші пробное ҰБТ-ты аяқтадыңыз", unlocked: count >= 1 },
      { id: "a2", icon: "🔥", title: "Тұрақтылық", description: "4 пробное ҰБТ (бір ай)", unlocked: count >= 4 },
      { id: "a3", icon: "⭐", title: "Марафоншы", description: "10 пробное ҰБТ аяқталды", unlocked: count >= 10 },
      { id: "a4", icon: "💯", title: "Жоғары нәтиже", description: "Пробное ҰБТ-та 80%+", unlocked: bestPercent >= 80 },
      { id: "a5", icon: "🏆", title: "Үздік", description: "Пробное ҰБТ-та 90%+", unlocked: bestPercent >= 90 },
      { id: "a6", icon: "🥇", title: "Топ-3", description: "Рейтингте үздік үштікте", unlocked: myRank <= 3 },
      { id: "a7", icon: "👑", title: "Топ-10", description: "Рейтингте Топ-10", unlocked: myRank <= 10 },
    ];
  }
}
