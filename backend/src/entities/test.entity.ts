import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Question } from "./question.entity";

export type Difficulty = "Жеңіл" | "Орташа" | "Қиын";

@Entity("tests")
export class Test {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  subjectId: string;

  @Column({ type: "varchar", default: "Орташа" })
  difficulty: Difficulty;

  @Column({ type: "int" })
  year: number;

  @Column()
  topic: string;

  @Column({ type: "int", default: 30 })
  durationMin: number;

  // Пробное ҰБТ (еженедельный экзамен). Доступно только Premium/Maximum.
  @Column({ default: false })
  isTrial: boolean;

  // Метка недели, напр. "2026-W23" — для еженедельных вариантов
  @Column({ type: "varchar", nullable: true })
  weekLabel: string | null;

  // Опубликован ли тест (для запланированной авто-публикации пробных)
  @Column({ default: true })
  published: boolean;

  // Дата запланированной публикации (если в будущем — тест скрыт до неё)
  @Column({ type: "timestamp", nullable: true })
  publishAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Question, (q) => q.test, { cascade: true })
  questions: Question[];
}
