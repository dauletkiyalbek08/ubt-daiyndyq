import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Result } from "../entities/result.entity";
import { Test } from "../entities/test.entity";
import { User } from "../entities/user.entity";
import { ResultsService } from "./results.service";
import { ResultsController } from "./results.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Result, Test, User])],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
