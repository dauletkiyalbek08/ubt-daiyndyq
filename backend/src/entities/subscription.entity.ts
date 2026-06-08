import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

export type SubscriptionStatus = "active" | "expired" | "pending";

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column()
  plan: string;

  @Column({ type: "int" })
  price: number;

  @Column({ type: "timestamp", default: () => "now()" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ type: "varchar", default: "pending" })
  status: SubscriptionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
