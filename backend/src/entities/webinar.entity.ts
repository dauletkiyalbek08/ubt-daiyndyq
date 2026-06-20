import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

// Вебинар — онлайн-разбор (нұсқа талдау) от учителя, обычно по пробным ЕНТ.
// Доступ только Premium/Maximum. Ученики видят расписание и заходят по ссылке.
@Entity("webinars")
export class Webinar {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Тема вебинара
  @Column()
  title: string;

  // Преподаватель (необязательно)
  @Column({ type: "varchar", nullable: true })
  speaker: string | null;

  // Описание (необязательно)
  @Column({ type: "text", nullable: true })
  description: string | null;

  // Дата и время начала
  @Column({ type: "timestamp" })
  startsAt: Date;

  // Ссылка на встречу (Zoom / YouTube / Google Meet)
  @Column()
  link: string;

  @CreateDateColumn()
  createdAt: Date;
}
