import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../entities/notification.entity";
import { User } from "../entities/user.entity";

export type NotifItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifs: Repository<Notification>,
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) {}

  async create(userId: string, type: string, title: string, message: string) {
    const n = this.notifs.create({ userId, type, title, message });
    return this.notifs.save(n);
  }

  // Уведомление об активации тарифа (вместо/после оплаты)
  async notifyPlanActivated(userId: string, planLabel: string) {
    return this.create(
      userId,
      "payment",
      "Жазылым белсендірілді 🎉",
      `«${planLabel}» тарифі сәтті қосылды. Сәтті дайындық тілейміз!`
    );
  }

  // Новый тест/пробное ҰБТ — рассылаем подходящим пользователям
  async notifyNewTest(title: string, isTrial: boolean) {
    const where = isTrial ? [{ plan: "premium" }, { plan: "max" }] : undefined;
    const recipients = await this.users.find({ where, select: { id: true } });
    if (recipients.length === 0) return;
    const notifTitle = isTrial ? "Жаңа Пробное ҰБТ 🎯" : "Жаңа тест қосылды 📝";
    const message = isTrial
      ? `«${title}» — жаңа апталық пробное ҰБТ қолжетімді. Қазір тапсырыңыз!`
      : `«${title}» — жаңа тест қосылды. Біліміңізді тексеріңіз!`;
    const rows = recipients.map((u) =>
      this.notifs.create({ userId: u.id, type: "new_test", title: notifTitle, message })
    );
    await this.notifs.save(rows);
  }

  // Список уведомлений + динамические предупреждения о подписке
  async list(userId: string): Promise<{ items: NotifItem[]; unread: number }> {
    const stored = await this.notifs.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 50,
    });

    const items: NotifItem[] = stored.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    // Динамические уведомления о подписке (не хранятся в БД)
    const user = await this.users.findOne({ where: { id: userId } });
    if (user?.planEndsAt && user.plan && user.plan !== "free") {
      const end = new Date(user.planEndsAt).getTime();
      const days = Math.ceil((end - Date.now()) / 86400_000);
      if (days < 0) {
        items.unshift({
          id: "dyn-ended",
          type: "sub_ended",
          title: "Жазылым аяқталды ⛔",
          message: "Тарифіңіздің мерзімі бітті. Жалғастыру үшін жаңартыңыз.",
          read: false,
          createdAt: new Date(user.planEndsAt).toISOString(),
        });
      } else if (days <= 3) {
        items.unshift({
          id: "dyn-ending",
          type: "sub_ending",
          title: "Жазылым аяқталуға жақын ⏳",
          message: `Тарифіңіз ${days} күннен кейін аяқталады. Жаңартуды ұмытпаңыз.`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const unread = items.filter((i) => !i.read).length;
    return { items, unread };
  }

  async markAllRead(userId: string) {
    await this.notifs.update({ userId, read: false }, { read: true });
    return { success: true };
  }
}
