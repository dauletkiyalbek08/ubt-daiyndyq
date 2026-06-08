import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Test } from "./test.entity";

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  text: string;

  // Тип вопроса: single | context | matching | multiple
  @Column({ type: "varchar", default: "single" })
  type: string;

  @Column({ type: "jsonb", default: () => "'[]'" })
  options: string[];

  // Для single/context — индекс правильного ответа
  @Column({ type: "int", default: 0 })
  correctIndex: number;

  // Для multiple — индексы правильных ответов
  @Column({ type: "jsonb", nullable: true })
  correctIndexes: number[] | null;

  // Для context — текст/таблица/график (описание)
  @Column({ type: "text", nullable: true })
  context: string | null;

  // Для matching — левая и правая колонки (в правильном соответствии left[i]↔right[i])
  @Column({ type: "jsonb", nullable: true })
  matchLeft: string[] | null;

  @Column({ type: "jsonb", nullable: true })
  matchRight: string[] | null;

  // Баллы за вопрос (1 — обычный, 3 — задание с несколькими ответами)
  @Column({ type: "int", default: 1 })
  points: number;

  @Column({ type: "text", default: "" })
  explanation: string;

  // Необязательная картинка к вопросу (URL загруженного файла)
  @Column({ type: "text", nullable: true })
  imageUrl: string | null;

  // Предмет вопроса (для пробного ҰБТ: history | mathlit | readlit | math | physics | ...)
  @Column({ type: "varchar", nullable: true })
  subject: string | null;

  @ManyToOne(() => Test, (test) => test.questions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "testId" })
  test: Test;

  @Column()
  testId: string;
}
