import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("results")
export class Result {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.results, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column()
  testId: string;

  @Column()
  testTitle: string;

  // Предмет теста (денормализовано для аналитики по предметам)
  @Column({ type: "varchar", nullable: true })
  subjectId: string | null;

  // Разбивка результата по предметам (для пробного ҰБТ — анализ в кабинете)
  @Column({ type: "jsonb", nullable: true })
  bySubject:
    | { subjectId: string; score: number; max: number; correct: number; total: number }[]
    | null;

  @Column({ type: "int" })
  score: number;

  @Column({ type: "int" })
  total: number;

  // Результат пробного ҰБТ? (для рейтинга учитываются только они)
  @Column({ default: false })
  isTrial: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
