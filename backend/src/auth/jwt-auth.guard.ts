import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

// Декоратор для пометки маршрутов, доступных только администратору
export const ADMIN_ONLY = "admin_only";
export const AdminOnly = () => SetMetadata(ADMIN_ONLY, true);

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const adminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!adminOnly) return true;

    const request = context.switchToHttp().getRequest();
    if (request.user?.role !== "admin") {
      throw new ForbiddenException("Тек әкімші үшін");
    }
    return true;
  }
}

// Декоратор для извлечения текущего пользователя из запроса
import { createParamDecorator } from "@nestjs/common";
export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
);
