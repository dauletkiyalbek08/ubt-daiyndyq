import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TestsService } from "../tests/tests.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly tests: TestsService,
    private readonly users: UsersService
  ) {}

  // Каждые 30 минут публикуем тесты, у которых наступила дата публикации
  @Cron(CronExpression.EVERY_30_MINUTES)
  async publishScheduled() {
    const res = await this.tests.publishDueTrials();
    if (res.published > 0) {
      this.logger.log(`Авто-публикация: опубликовано ${res.published} тест(ов)`);
    }
  }

  // Раз в сутки сбрасываем просроченные подписки на free
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions() {
    const res = await this.users.expireSubscriptions();
    if (res.expired > 0) {
      this.logger.log(`Подписки: истекло ${res.expired}, переведены на free`);
    }
  }
}
