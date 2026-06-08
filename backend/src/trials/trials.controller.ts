import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TestsService } from "../tests/tests.service";
import { User } from "../entities/user.entity";
import {
  AdminGuard,
  AdminOnly,
  CurrentUser,
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";
import { hasPremiumAccess } from "../auth/access";

@Controller("trials")
export class TrialsController {
  constructor(
    private readonly tests: TestsService,
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) {}

  private async access(userId?: string) {
    if (!userId) return false;
    const user = await this.users.findOne({ where: { id: userId } });
    return hasPremiumAccess(user!);
  }

  // Публичный список пробных (видят все). Админ видит и неопубликованные.
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async list(@CurrentUser() user: { id: string; role: string } | null) {
    const isAdmin = user?.role === "admin";
    const [trials, hasAccess] = await Promise.all([
      this.tests.listTrials(!isAdmin),
      this.access(user?.id),
    ]);
    return { hasAccess, trials };
  }

  // Ручной запуск авто-публикации — только админ
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post("publish-due")
  publishDue() {
    return this.tests.publishDueTrials();
  }

  // Один пробный с вопросами — только Premium (вход обязателен)
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getOne(
    @CurrentUser() user: { id: string; role: string },
    @Param("id") id: string
  ) {
    if (!(await this.access(user.id))) {
      throw new ForbiddenException(
        "Пробное ҰБТ тек Premium тарифінде қолжетімді"
      );
    }
    const trial = await this.tests.findOne(id, false);
    if (!(trial as any).published && user.role !== "admin") {
      throw new NotFoundException("Пробное ҰБТ табылмады");
    }
    return trial;
  }
}
