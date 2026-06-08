import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class QuestionDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  type?: string; // single | context | matching | multiple

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  correctIndex?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  correctIndexes?: number[];

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matchLeft?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matchRight?: string[];

  @IsOptional()
  @IsInt()
  points?: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  subject?: string;
}

export class CreateTestDto {
  @IsString()
  title: string;

  @IsString()
  subjectId: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsInt()
  year: number;

  @IsString()
  topic: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number;

  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;

  @IsOptional()
  @IsString()
  weekLabel?: string;

  @IsOptional()
  @IsString()
  publishAt?: string; // ISO-дата запланированной публикации

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];
}

export class UpdateTestDto extends CreateTestDto {}
