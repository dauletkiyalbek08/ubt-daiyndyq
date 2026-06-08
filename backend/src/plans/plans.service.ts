import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Plan } from "../entities/plan.entity";

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private readonly plans: Repository<Plan>
  ) {}

  // При старте: если тарифов нет — создаём дефолтные
  async onModuleInit() {
    const count = await this.plans.count();
    if (count > 0) return;
    await this.plans.save([
      this.plans.create({
        code: "standard",
        name: "Стандарт",
        priceQuarter: 5000,
        priceYear: 14000,
        sortOrder: 1,
        features: ["Барлық пәндер бойынша тесттер", "Нәтижелер статистикасы", "Қателерді негізгі талдау"],
        excluded: ["Апта сайынғы Пробное ҰБТ", "Рейтинг пен жетістіктер"],
      }),
      this.plans.create({
        code: "premium",
        name: "Премиум",
        priceQuarter: 9990,
        priceYear: 27990,
        popular: true,
        sortOrder: 2,
        features: [
          "Стандарт мүмкіндіктерінің барлығы",
          "Апта сайынғы Пробное ҰБТ",
          "Рейтинг пен жетістіктер",
          "Пробное ҰБТ-ны шектеусіз тапсыру",
          "Қателерді толық талдау",
        ],
        excluded: [],
      }),
    ]);
  }

  findPublic() {
    return this.plans.find({ where: { active: true }, order: { sortOrder: "ASC" } });
  }

  findAll() {
    return this.plans.find({ order: { sortOrder: "ASC" } });
  }

  async update(id: string, data: Partial<Plan>) {
    const plan = await this.plans.findOne({ where: { id } });
    if (!plan) throw new NotFoundException("Тариф табылмады");
    // код менять нельзя (на него завязана логика), остальное — можно
    const { code, id: _id, ...rest } = data as any;
    Object.assign(plan, rest);
    return this.plans.save(plan);
  }

  // Карта цен для подсчёта дохода: { code: { quarter, year } }
  async priceMap() {
    const all = await this.plans.find();
    const map: Record<string, { quarter: number; year: number }> = {};
    for (const p of all) map[p.code] = { quarter: p.priceQuarter, year: p.priceYear };
    return map;
  }
}
