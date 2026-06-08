import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ResultsService, SubmitDto } from "./results.service";
import { CurrentUser, JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("results")
export class ResultsController {
  constructor(private readonly results: ResultsService) {}

  @Post("submit")
  submit(@CurrentUser() user: { id: string }, @Body() dto: SubmitDto) {
    return this.results.submit(user.id, dto);
  }

  @Get("my")
  my(@CurrentUser() user: { id: string }) {
    return this.results.findByUser(user.id);
  }

  @Get("stats")
  stats(@CurrentUser() user: { id: string }) {
    return this.results.stats(user.id);
  }

  @Get("analytics")
  analytics(@CurrentUser() user: { id: string }) {
    return this.results.analytics(user.id);
  }
}
