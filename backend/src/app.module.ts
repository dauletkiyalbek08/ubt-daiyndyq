import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Test } from "./entities/test.entity";
import { Question } from "./entities/question.entity";
import { Result } from "./entities/result.entity";
import { Subscription } from "./entities/subscription.entity";
import { Notification } from "./entities/notification.entity";
import { Plan } from "./entities/plan.entity";
import { Tarau } from "./entities/tarau.entity";
import { Topic } from "./entities/topic.entity";
import { Webinar } from "./entities/webinar.entity";
import { AuthModule } from "./auth/auth.module";
import { TestsModule } from "./tests/tests.module";
import { ResultsModule } from "./results/results.module";
import { UsersModule } from "./users/users.module";
import { UploadsModule } from "./uploads/uploads.module";
import { RatingModule } from "./rating/rating.module";
import { TrialsModule } from "./trials/trials.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { TasksModule } from "./tasks/tasks.module";
import { AdminModule } from "./admin/admin.module";
import { PlansModule } from "./plans/plans.module";
import { LearnModule } from "./learn/learn.module";
import { WebinarsModule } from "./webinars/webinars.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): any => {
        const url = config.get<string>("DATABASE_URL");
        const entities = [User, Test, Question, Result, Subscription, Notification, Plan, Tarau, Topic, Webinar];
        // В облаке (Railway/Render) база подключается через DATABASE_URL + SSL.
        if (url) {
          // Railway internal база — без SSL; внешние (Render и т.п.) — с SSL
          const needSsl = !url.includes("railway.internal") && !url.includes("localhost");
          return {
            type: "postgres",
            url,
            entities,
            synchronize: true,
            ssl: needSsl ? { rejectUnauthorized: false } : false,
          };
        }
        // Локально — отдельные переменные
        return {
          type: "postgres",
          host: config.get("DB_HOST"),
          port: Number(config.get("DB_PORT")),
          username: config.get("DB_USER"),
          password: String(config.get("DB_PASSWORD")),
          database: config.get("DB_NAME"),
          entities,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    TestsModule,
    ResultsModule,
    UploadsModule,
    RatingModule,
    TrialsModule,
    NotificationsModule,
    TasksModule,
    AdminModule,
    PlansModule,
    LearnModule,
    WebinarsModule,
  ],
})
export class AppModule {}
