import { Module } from "@nestjs/common";
import { TestsModule } from "../tests/tests.module";
import { UsersModule } from "../users/users.module";
import { TasksService } from "./tasks.service";

@Module({
  imports: [TestsModule, UsersModule],
  providers: [TasksService],
})
export class TasksModule {}
