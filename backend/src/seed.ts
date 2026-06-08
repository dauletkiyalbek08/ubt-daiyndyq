import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { User } from "./entities/user.entity";
import { Test } from "./entities/test.entity";
import { Question } from "./entities/question.entity";
import { Result } from "./entities/result.entity";
import { Subscription } from "./entities/subscription.entity";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
  entities: [User, Test, Question, Result, Subscription],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log("✓ Базаға қосылды");

  const userRepo = AppDataSource.getRepository(User);
  const testRepo = AppDataSource.getRepository(Test);

  // --- Админ ---
  const adminEmail = "admin@ent.kz";
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = userRepo.create({
      firstName: "Әкімші",
      lastName: "Платформа",
      email: adminEmail,
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    await userRepo.save(admin);
    console.log("✓ Әкімші құрылды: admin@ent.kz / admin123");
  } else {
    console.log("• Әкімші бұрыннан бар");
  }

  // --- Демо-ученик ---
  const studentEmail = "student@ent.kz";
  let student = await userRepo.findOne({ where: { email: studentEmail } });
  if (!student) {
    student = userRepo.create({
      firstName: "Арман",
      lastName: "Қойшыбаев",
      phone: "+77000000000",
      email: studentEmail,
      passwordHash: await bcrypt.hash("student123", 10),
      role: "user",
    });
    await userRepo.save(student);
    console.log("✓ Оқушы құрылды: student@ent.kz / student123");
  }

  // --- Тесты с вопросами ---
  const count = await testRepo.count();
  if (count === 0) {
    const tests: Partial<Test>[] = [
      {
        title: "Алгебра: функциялар мен графиктер",
        subjectId: "math",
        difficulty: "Орташа",
        year: 2024,
        topic: "Алгебра",
        durationMin: 40,
        questions: [
          {
            text: "f(x) = 2x + 3 функциясының x = 4 нүктесіндегі мәні неге тең?",
            options: ["8", "11", "14", "10"],
            correctIndex: 1,
            explanation: "f(4) = 2·4 + 3 = 11.",
          },
          {
            text: "y = x² параболасының төбесі қай нүктеде?",
            options: ["(0; 0)", "(1; 1)", "(0; 1)", "(1; 0)"],
            correctIndex: 0,
            explanation: "y = x² параболасының төбесі координат басында — (0; 0).",
          },
        ] as Question[],
      },
      {
        title: "Қазақ хандығының құрылуы",
        subjectId: "history",
        difficulty: "Жеңіл",
        year: 2024,
        topic: "Орта ғасыр",
        durationMin: 30,
        questions: [
          {
            text: "Қазақ хандығы қай жылы құрылды деп есептеледі?",
            options: ["1456 жыл", "1465 жыл", "1480 жыл", "1511 жыл"],
            correctIndex: 1,
            explanation: "Шамамен 1465 жылы Керей мен Жәнібек хандардың басшылығымен.",
          },
          {
            text: "Қазақ хандығының алғашқы хандары кімдер?",
            options: ["Абылай мен Қасым", "Керей мен Жәнібек", "Тәуке мен Есім", "Абылай мен Тәуке"],
            correctIndex: 1,
            explanation: "Алғашқы хандар — Керей мен Жәнібек.",
          },
        ] as Question[],
      },
      {
        title: "Механика: кинематика негіздері",
        subjectId: "physics",
        difficulty: "Қиын",
        year: 2023,
        topic: "Механика",
        durationMin: 50,
        questions: [
          {
            text: "Дененің бірқалыпты қозғалысында жылдамдық қалай өзгереді?",
            options: ["Артады", "Кемиді", "Өзгермейді", "Әртүрлі"],
            correctIndex: 2,
            explanation: "Бірқалыпты қозғалыста жылдамдық тұрақты.",
          },
        ] as Question[],
      },
    ];

    for (const t of tests) {
      await testRepo.save(testRepo.create(t));
    }
    console.log(`✓ ${tests.length} тест қосылды`);
  } else {
    console.log(`• Базада ${count} тест бар, қосылмады`);
  }

  await AppDataSource.destroy();
  console.log("✅ Дайын!");
}

seed().catch((err) => {
  console.error("❌ Қате:", err);
  process.exit(1);
});
