import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Result } from "../entities/result.entity";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { PlansModule } from "../plans/plans.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Result]), PlansModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
