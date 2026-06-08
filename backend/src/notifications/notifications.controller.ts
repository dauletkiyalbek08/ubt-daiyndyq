import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifs: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.notifs.list(user.id);
  }

  @Post("read")
  markRead(@CurrentUser() user: { id: string }) {
    return this.notifs.markAllRead(user.id);
  }
}
