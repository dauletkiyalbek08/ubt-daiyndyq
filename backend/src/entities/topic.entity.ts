import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tarau } from "./tarau.entity";

// Материал темы (книга/доп. файл): название + ссылка на PDF.
export interface TopicMaterial {
  title: string;
  url: string;
}

// Тема — шаг обучения внутри тарау. Содержит презентацию (PDF), книги (PDF)
// и тест. Тема считается пройденной, если лучший результат теста ≥ passPercent.
// Следующая тема открывается только после прохождения предыдущей.
@Entity("topics")
export class Topic {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Tarau, (t) => t.topics, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tarauId" })
  tarau: Tarau;

  @Column()
  tarauId: string;

  @Column()
  title: string;

  // Порядок темы внутри тарау (1, 2, 3 …)
  @Column({ type: "int", default: 0 })
  order: number;

  // Презентация по теме — ссылка на загруженный PDF (nullable, может ещё не быть)
  @Column({ type: "varchar", nullable: true })
  presentationUrl: string | null;

  // Книги/доп. материалы — массив { title, url } на PDF
  @Column({ type: "jsonb", nullable: true })
  materials: TopicMaterial[] | null;

  // Тест темы — ссылка на обычный Test (nullable, пока тест не привязан)
  @Column({ type: "varchar", nullable: true })
  testId: string | null;

  // Порог прохождения в процентах (по умолчанию 70)
  @Column({ type: "int", default: 70 })
  passPercent: number;

  @CreateDateColumn()
  createdAt: Date;
}
