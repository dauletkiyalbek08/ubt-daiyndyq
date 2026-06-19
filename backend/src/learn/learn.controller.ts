import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { LearnService, TarauDto, TopicDto } from "./learn.service";
import {
  AdminGuard,
  AdminOnly,
  CurrentUser,
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";

@Controller("learn")
export class LearnController {
  constructor(private readonly learn: LearnService) {}

  // Структура предмета для ученика (темы с состоянием замок/открыто/пройдено).
  // Вход не обязателен — гость видит замки и hasAccess=false.
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  overview(
    @CurrentUser() user: { id: string } | null,
    @Query("subject") subjectId: string
  ) {
    return this.learn.overview(subjectId, user?.id);
  }

  // Полная структура предмета для админки (с материалами и тестами)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get("manage")
  manage(@Query("subject") subjectId: string) {
    return this.learn.loadForAdmin(subjectId);
  }

  // Детали темы (презентация + книги + тест). Gated: Premium + разблокировано.
  @UseGuards(OptionalJwtAuthGuard)
  @Get("topics/:id")
  topic(
    @CurrentUser() user: { id: string } | null,
    @Param("id") id: string
  ) {
    return this.learn.topicDetail(id, user?.id);
  }

  // ===== АДМИН: тарау =====
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post("tarau")
  createTarau(@Body() dto: TarauDto) {
    return this.learn.createTarau(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch("tarau/:id")
  updateTarau(@Param("id") id: string, @Body() dto: Partial<TarauDto>) {
    return this.learn.updateTarau(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete("tarau/:id")
  removeTarau(@Param("id") id: string) {
    return this.learn.removeTarau(id);
  }

  // ===== АДМИН: темы =====
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post("topics")
  createTopic(@Body() dto: TopicDto) {
    return this.learn.createTopic(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch("topics/:id")
  updateTopic(@Param("id") id: string, @Body() dto: Partial<TopicDto>) {
    return this.learn.updateTopic(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete("topics/:id")
  removeTopic(@Param("id") id: string) {
    return this.learn.removeTopic(id);
  }
}
