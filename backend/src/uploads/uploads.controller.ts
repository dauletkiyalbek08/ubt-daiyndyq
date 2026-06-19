import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { AdminGuard, AdminOnly, JwtAuthGuard } from "../auth/jwt-auth.guard";

// Папка для картинок. В облаке (Railway) указываем постоянный диск через
// переменную UPLOAD_DIR (напр. /data/uploads), чтобы файлы не стирались при редеплое.
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
// Документы для раздела «Обучение»: презентации и книги (PDF).
const ALLOWED_DOCS = [".pdf"];

// Сохранение с уникальным именем (общая настройка для всех загрузок).
const storage = diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
  },
});

// Публичная ссылка на файл по его имени.
function fileUrl(filename: string) {
  const base = process.env.BACKEND_URL ?? "http://localhost:4000";
  return { url: `${base}/uploads/${filename}` };
}

@UseGuards(JwtAuthGuard, AdminGuard)
@AdminOnly()
@Controller("uploads")
export class UploadsController {
  // Загрузка одной картинки (только админ). Поле формы: "file".
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // до 5 МБ
      fileFilter: (_req, file, cb) => {
        const ok = ALLOWED.includes(extname(file.originalname).toLowerCase());
        cb(ok ? null : new BadRequestException("Тек сурет файлдары рұқсат етілген"), ok);
      },
    })
  )
  upload(@UploadedFile() file: { filename: string }) {
    if (!file) throw new BadRequestException("Файл табылмады");
    return fileUrl(file.filename);
  }

  // Загрузка PDF-документа (презентация/книга) для раздела «Обучение». Поле: "file".
  @Post("doc")
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      limits: { fileSize: 25 * 1024 * 1024 }, // до 25 МБ
      fileFilter: (_req, file, cb) => {
        const ok = ALLOWED_DOCS.includes(extname(file.originalname).toLowerCase());
        cb(ok ? null : new BadRequestException("Тек PDF файлдары рұқсат етілген"), ok);
      },
    })
  )
  uploadDoc(@UploadedFile() file: { filename: string }) {
    if (!file) throw new BadRequestException("Файл табылмады");
    return fileUrl(file.filename);
  }
}
