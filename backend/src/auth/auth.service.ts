import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { User } from "../entities/user.entity";
import { LoginDto, RegisterDto } from "./dto";

// Данные, которые присылает Telegram Login Widget
export type TelegramData = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  private sign(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwt.sign(payload);
  }

  private publicUser(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Бұл email тіркелген");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
    });
    await this.users.save(user);

    return { token: this.sign(user), user: this.publicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException("Email немесе құпиясөз қате");
    }

    // Пользователь зарегистрирован через соцсеть — пароля нет
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        `Бұл аккаунт ${user.provider} арқылы тіркелген. Сол арқылы кіріңіз.`
      );
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Email немесе құпиясөз қате");
    }

    return { token: this.sign(user), user: this.publicUser(user) };
  }

  // Вход/регистрация через соцсеть (Google, Telegram).
  // Ищем пользователя по email; если нет — создаём.
  async oauthLogin(profile: {
    email: string;
    firstName: string;
    lastName?: string;
    provider: string;
    avatarUrl?: string;
  }) {
    let user = await this.users.findOne({ where: { email: profile.email } });
    if (!user) {
      user = this.users.create({
        firstName: profile.firstName,
        lastName: profile.lastName ?? "",
        email: profile.email,
        passwordHash: null,
        provider: profile.provider,
        avatarUrl: profile.avatarUrl ?? null,
      });
      await this.users.save(user);
    }
    return { token: this.sign(user), user: this.publicUser(user) };
  }

  // Проверка подписи Telegram и вход. Алгоритм из офиц. документации Telegram.
  async telegramLogin(data: TelegramData) {
    const botToken = this.config.get<string>("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new UnauthorizedException("Telegram бот бапталмаған");
    }

    const { hash, ...fields } = data;
    const checkString = Object.keys(fields)
      .filter((k) => (fields as any)[k] !== undefined && (fields as any)[k] !== null)
      .sort()
      .map((k) => `${k}=${(fields as any)[k]}`)
      .join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const computed = crypto
      .createHmac("sha256", secretKey)
      .update(checkString)
      .digest("hex");

    if (computed !== hash) {
      throw new UnauthorizedException("Telegram қолтаңбасы жарамсыз");
    }

    // Срок действия данных — 1 день (защита от повторного использования)
    if (Date.now() / 1000 - data.auth_date > 86400) {
      throw new UnauthorizedException("Telegram деректерінің мерзімі өтті");
    }

    return this.oauthLogin({
      email: `tg${data.id}@telegram.local`,
      firstName: data.first_name ?? data.username ?? "Telegram",
      lastName: data.last_name ?? "",
      provider: "telegram",
      avatarUrl: data.photo_url,
    });
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  // Изменение личных данных
  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string }
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    await this.users.save(user);
    return this.publicUser(user);
  }

  // Смена пароля
  async changePassword(
    userId: string,
    data: { currentPassword?: string; newPassword: string }
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    // Если у пользователя уже есть пароль — проверяем текущий
    if (user.passwordHash) {
      const ok = await bcrypt.compare(data.currentPassword ?? "", user.passwordHash);
      if (!ok) throw new UnauthorizedException("Ағымдағы құпиясөз қате");
    }

    user.passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.users.save(user);
    return { success: true };
  }
}
