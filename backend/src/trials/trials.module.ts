import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestsModule } from "../tests/tests.module";
import { User } from "../entities/user.entity";
import { TrialsController } from "./trials.controller";

@Module({
  imports: [TestsModule, TypeOrmModule.forFeature([User])],
  controllers: [TrialsController],
})
export class TrialsModule {}
