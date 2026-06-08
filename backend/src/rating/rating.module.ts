import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Result } from "../entities/result.entity";
import { RatingService } from "./rating.service";
import { RatingController } from "./rating.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Result])],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
