import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Webinar } from "../entities/webinar.entity";
import { User } from "../entities/user.entity";
import { WebinarsController } from "./webinars.controller";
import { WebinarsService } from "./webinars.service";

@Module({
  imports: [TypeOrmModule.forFeature([Webinar, User])],
  controllers: [WebinarsController],
  providers: [WebinarsService],
})
export class WebinarsModule {}
