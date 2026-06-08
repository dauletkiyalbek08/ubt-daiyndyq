import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: "Құпиясөз кемінде 6 таңбадан тұруы керек" })
  password: string;
}

export class LoginDto {
  // Логин: email или имя пользователя (напр. "admin")
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsString()
  @MinLength(6, { message: "Жаңа құпиясөз кемінде 6 таңбадан тұруы керек" })
  newPassword: string;
}
