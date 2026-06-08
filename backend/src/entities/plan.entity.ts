import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Тариф (управляется из админ-панели)
@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Код: standard | premium (используется в логике доступа/цен)
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: "int" })
  priceQuarter: number; // ₸ за 3 месяца

  @Column({ type: "int" })
  priceYear: number; // ₸ за год

  @Column({ type: "jsonb", default: () => "'[]'" })
  features: string[]; // что входит

  @Column({ type: "jsonb", default: () => "'[]'" })
  excluded: string[]; // чего нет

  @Column({ default: false })
  popular: boolean;

  @Column({ type: "int", default: 0 })
  sortOrder: number;

  @Column({ default: true })
  active: boolean;
}
