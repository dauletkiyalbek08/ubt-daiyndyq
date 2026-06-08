import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AdminGuard, AdminOnly, JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard, AdminGuard)
@AdminOnly()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get("stats")
  stats() {
    return this.users.stats();
  }

  // Выдать/изменить тариф пользователю
  @Patch(":id/plan")
  setPlan(
    @Param("id") id: string,
    @Body() body: { plan: string; period?: string }
  ) {
    return this.users.setPlan(id, body.plan, body.period);
  }

  // Ручной запуск сброса просроченных подписок (для проверки крона)
  @Post("expire-check")
  expireCheck() {
    return this.users.expireSubscriptions();
  }
}
