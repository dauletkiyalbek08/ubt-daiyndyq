import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TestsService } from "./tests.service";
import { CreateTestDto, UpdateTestDto } from "./dto";
import {
  AdminGuard,
  AdminOnly,
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";

@Controller("tests")
export class TestsController {
  constructor(private readonly tests: TestsService) {}

  // Публичный список тестов с фильтрами
  @Get()
  findAll(
    @Query("subject") subjectId?: string,
    @Query("difficulty") difficulty?: string,
    @Query("year") year?: string,
    @Query("q") q?: string
  ) {
    return this.tests.findAll({ subjectId, difficulty, year, q });
  }

  // Тест без правильных ответов (для прохождения)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tests.findOne(id, false);
  }

  // Тест с ответами — только для админа (редактирование)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get(":id/full")
  findFull(@Param("id") id: string) {
    return this.tests.findOne(id, true);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post()
  create(@Body() dto: CreateTestDto) {
    return this.tests.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTestDto) {
    return this.tests.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tests.remove(id);
  }
}
