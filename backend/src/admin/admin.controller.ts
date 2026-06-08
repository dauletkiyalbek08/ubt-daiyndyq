import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminGuard, AdminOnly, JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard, AdminGuard)
@AdminOnly()
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.dashboard();
  }
}
