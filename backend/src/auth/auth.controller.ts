import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { AuthService, type TelegramData } from "./auth.service";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from "./dto";
import { CurrentUser, JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: { id: string }) {
    return this.auth.me(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  updateProfile(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("password")
  changePassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.id, dto);
  }

  // --- Google OAuth ---
  // 1) Пользователь переходит сюда → редирект на страницу входа Google
  @UseGuards(AuthGuard("google"))
  @Get("google")
  google() {
    // тело не выполняется — guard перенаправляет на Google
  }

  // 2) Google возвращает сюда → создаём токен и редиректим на фронтенд
  @UseGuards(AuthGuard("google"))
  @Get("google/callback")
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const frontend = this.config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
    try {
      const { token } = await this.auth.oauthLogin(req.user);
      res.redirect(`${frontend}/auth/callback?token=${token}`);
    } catch {
      res.redirect(`${frontend}/login?error=google`);
    }
  }

  // --- Telegram Login Widget ---
  // Виджет на фронтенде присылает подписанные данные, мы их проверяем
  @Post("telegram")
  telegram(@Body() data: TelegramData) {
    return this.auth.telegramLogin(data);
  }
}
