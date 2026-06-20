import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

// Тип: payment (оплата/активация) | sub_ending | sub_ended | new_test
@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: "varchar" })
  type: string;

  @Column()
  title: string;

  @Column({ type: "text" })
  message: string;

  // Куда вести по клику (внутренний путь, напр. "/learn?tab=webinars"). Может быть пустым.
  @Column({ type: "varchar", nullable: true })
  link: string | null;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
