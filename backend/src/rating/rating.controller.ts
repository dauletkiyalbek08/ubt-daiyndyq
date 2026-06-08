import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { RatingService, type Period } from "./rating.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("rating")
export class RatingController {
  constructor(private readonly rating: RatingService) {}

  // Публичная таблица лидеров
  @Get()
  leaderboard(@Query("period") period: Period = "all") {
    const valid: Period[] = ["week", "month", "all"];
    return this.rating.leaderboard(valid.includes(period) ? period : "all");
  }

  // Достижения текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get("achievements")
  achievements(@CurrentUser() user: { id: string }) {
    return this.rating.achievements(user.id);
  }
}
