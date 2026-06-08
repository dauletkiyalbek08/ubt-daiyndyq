import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Не блокирует гостей: если токена нет — req.user будет null, но запрос пройдёт.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
