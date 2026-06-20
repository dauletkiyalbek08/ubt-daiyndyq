import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { WebinarsService, WebinarDto } from "./webinars.service";
import {
  AdminGuard,
  AdminOnly,
  CurrentUser,
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";

@Controller("webinars")
export class WebinarsController {
  constructor(private readonly webinars: WebinarsService) {}

  // Список вебинаров (вход не обязателен — гость видит расписание без ссылки)
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  list(@CurrentUser() user: { id: string } | null) {
    return this.webinars.list(user?.id);
  }

  // ===== АДМИН =====
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post()
  create(@Body() dto: WebinarDto) {
    return this.webinars.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<WebinarDto>) {
    return this.webinars.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.webinars.remove(id);
  }
}
