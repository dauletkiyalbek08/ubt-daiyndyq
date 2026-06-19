import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Topic } from "./topic.entity";

// Тарау — глава (раздел) внутри предмета. Напр. предмет «Математика» → тарау «Интегралы».
// Внутри тарау идут темы по порядку (order).
@Entity("tarau")
export class Tarau {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Предмет — тот же строковый id, что и у тестов (Test.subjectId)
  @Column()
  subjectId: string;

  @Column()
  title: string;

  // Порядок главы внутри предмета (1, 2, 3 …)
  @Column({ type: "int", default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Topic, (t) => t.tarau, { cascade: true })
  topics: Topic[];
}
