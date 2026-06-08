import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import { Test } from "./entities/test.entity";
import { Question } from "./entities/question.entity";
import { Result } from "./entities/result.entity";
import { Subscription } from "./entities/subscription.entity";
import { Notification } from "./entities/notification.entity";
import { Plan } from "./entities/plan.entity";

dotenv.config();

const ds = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  entities: [User, Test, Question, Result, Subscription, Notification, Plan],
  synchronize: false,
});

async function run() {
  await ds.initialize();
  const userRepo = ds.getRepository(User);

  // 1) Привести админа к логину admin / паролю admin
  let admin =
    (await userRepo.findOne({ where: { role: "admin" } })) ??
    (await userRepo.findOne({ where: { email: "admin@ent.kz" } }));
  if (admin) {
    admin.firstName = "Админ";
    admin.lastName = "";
    admin.email = "admin";
    admin.passwordHash = await bcrypt.hash("admin", 10);
    admin.role = "admin";
    admin.provider = "local";
    await userRepo.save(admin);
    console.log("✓ Админ: логин=admin, пароль=admin, имя=Админ");
  } else {
    console.log("⚠ Админ не найден");
  }

  // 2) Удалить всех пользователей, кроме admin и dauletkiyalbek08 (их результаты удалятся каскадом)
  const del = await ds
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("email NOT IN (:...keep)", { keep: ["admin", "dauletkiyalbek08@gmail.com"] })
    .execute();
  console.log(`✓ Удалено пользователей: ${del.affected ?? 0}`);

  // 3) Очистить все уведомления
  await ds.createQueryBuilder().delete().from(Notification).execute();
  console.log("✓ Уведомления очищены");

  // Показать кто остался
  const left = await userRepo.find();
  left.forEach((u) => console.log(`   • ${u.email} (${u.firstName}) — ${u.role}/${u.plan}`));

  await ds.destroy();
  console.log("✅ Дайын!");
}

run().catch((e) => {
  console.error("❌ Қате:", e);
  process.exit(1);
});
