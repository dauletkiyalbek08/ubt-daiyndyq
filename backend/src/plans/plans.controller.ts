import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { PlansService } from "./plans.service";
import { AdminGuard, AdminOnly, JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("plans")
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  // Публичный список тарифов (для страницы тарифов и главной)
  @Get()
  list() {
    return this.plans.findPublic();
  }

  // Все тарифы — для админки
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get("all")
  all() {
    return this.plans.findAll();
  }

  // Редактирование тарифа (админ)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.plans.update(id, body);
  }
}
