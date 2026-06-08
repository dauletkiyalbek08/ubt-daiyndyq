import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Раздача загруженных картинок: http://localhost:4000/uploads/...
  // В облаке берём ту же папку, что и для записи (постоянный диск Railway).
  const uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");
  app.useStaticAssets(uploadDir, { prefix: "/uploads/" });

  // Глобальная валидация входящих данных (DTO)
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true })
  );

  // Префикс для всех маршрутов: /api/...
  app.setGlobalPrefix("api");

  // Разрешаем запросы с фронтенда (Next.js)
  app.enableCors({
    origin: config.get("FRONTEND_URL") ?? "http://localhost:3000",
    credentials: true,
  });

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
  console.log(`🚀 Backend API: http://localhost:${port}/api`);
}
bootstrap();
