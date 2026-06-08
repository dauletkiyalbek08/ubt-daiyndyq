import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Result } from "./result.entity";
import { Subscription } from "./subscription.entity";

export type UserRole = "user" | "admin";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  // Для OAuth-пользователей пароля нет
  @Column({ type: "varchar", nullable: true })
  passwordHash: string | null;

  @Column({ type: "varchar", default: "user" })
  role: UserRole;

  // Способ регистрации: local | google | telegram
  @Column({ type: "varchar", default: "local" })
  provider: string;

  @Column({ type: "text", nullable: true })
  avatarUrl: string | null;

  // Тариф: free | standard | premium. Premium даёт доступ к пробным ҰБТ и рейтингу.
  @Column({ type: "varchar", default: "free" })
  plan: string;

  // Период подписки: quarter (3 месяца) | year (год)
  @Column({ type: "varchar", nullable: true })
  planPeriod: string | null;

  @Column({ type: "timestamp", nullable: true })
  planEndsAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Result, (result) => result.user)
  results: Result[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];
}
