import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tarau } from "../entities/tarau.entity";
import { Topic } from "../entities/topic.entity";
import { Result } from "../entities/result.entity";
import { User } from "../entities/user.entity";
import { LearnController } from "./learn.controller";
import { LearnService } from "./learn.service";

@Module({
  imports: [TypeOrmModule.forFeature([Tarau, Topic, Result, User])],
  controllers: [LearnController],
  providers: [LearnService],
})
export class LearnModule {}
