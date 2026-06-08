import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile, type VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      // Если переменные не заданы — подставляем заглушку, чтобы приложение запустилось.
      // Реальный вход заработает после добавления ключей в .env.
      clientID: config.get<string>("GOOGLE_CLIENT_ID") || "not-configured",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") || "not-configured",
      callbackURL:
        config.get<string>("GOOGLE_CALLBACK_URL") ||
        "http://localhost:4000/api/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  // Вызывается после успешного входа в Google. Формируем профиль пользователя.
  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const email = profile.emails?.[0]?.value;
    const user = {
      email,
      firstName: profile.name?.givenName ?? profile.displayName ?? "Қолданушы",
      lastName: profile.name?.familyName ?? "",
      avatarUrl: profile.photos?.[0]?.value,
      provider: "google",
    };
    done(null, user);
  }
}
