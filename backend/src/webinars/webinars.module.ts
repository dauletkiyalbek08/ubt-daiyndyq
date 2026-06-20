import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Webinar } from "../entities/webinar.entity";
import { User } from "../entities/user.entity";
import { WebinarsController } from "./webinars.controller";
import { WebinarsService } from "./webinars.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [TypeOrmModule.forFeature([Webinar, User]), NotificationsModule],
  controllers: [WebinarsController],
  providers: [WebinarsService],
})
export class WebinarsModule {}
