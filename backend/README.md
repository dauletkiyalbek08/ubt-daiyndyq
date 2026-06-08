# ЕНТ Дайындық — Backend (NestJS + PostgreSQL)

API для платформы подготовки к ЕНТ. Стек: **NestJS 10 + TypeORM + PostgreSQL + JWT**.

## Запуск

Требуется установленный и запущенный **PostgreSQL** и созданная база `ent_platform`.

```bash
npm install           # установить зависимости (один раз)
npm run seed          # создать таблицы + админа + демо-тесты (один раз)
npm run dev           # запустить с автоперезагрузкой (разработка)
# или
npm run build && npm run start:prod   # production
```

API поднимется на **http://localhost:4000/api**

## Настройки (`.env`)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=6363        # пароль PostgreSQL
DB_NAME=ent_platform
JWT_SECRET=...          # сменить в продакшене!
PORT=4000
FRONTEND_URL=http://localhost:3000
```

## Демо-аккаунты (создаются `npm run seed`)

| Роль | Email | Пароль |
|---|---|---|
| Админ | `admin@ent.kz` | `admin123` |
| Ученик | `student@ent.kz` | `student123` |

## Эндпоинты

### Авторизация (`/api/auth`)
| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/auth/register` | публично | Регистрация |
| POST | `/auth/login` | публично | Вход (возвращает JWT) |
| GET | `/auth/me` | JWT | Текущий пользователь |

### Тесты (`/api/tests`)
| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/tests?subject=&difficulty=&year=&q=` | публично | Список с фильтрами |
| GET | `/tests/:id` | публично | Тест **без** правильных ответов |
| GET | `/tests/:id/full` | админ | Тест с ответами (для редактирования) |
| POST | `/tests` | админ | Создать тест с вопросами |
| PUT | `/tests/:id` | админ | Изменить тест |
| DELETE | `/tests/:id` | админ | Удалить тест |

### Результаты (`/api/results`)
| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/results/submit` | JWT | Отправить ответы (баллы считаются на сервере) |
| GET | `/results/my` | JWT | История результатов |
| GET | `/results/stats` | JWT | Сводная статистика |

### Пользователи (`/api/users`)
| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/users` | админ | Список пользователей |
| GET | `/users/stats` | админ | Статистика |

## Структура

```
src/
├── main.ts              Точка входа (CORS, валидация, префикс /api)
├── app.module.ts        Корневой модуль + подключение к БД
├── seed.ts              Заполнение БД (npm run seed)
├── entities/            Таблицы: User, Test, Question, Result, Subscription
├── auth/                Регистрация, вход, JWT, гарды (JwtAuthGuard, AdminGuard)
├── tests/               CRUD тестов и вопросов
├── results/             Отправка ответов, подсчёт баллов, статистика
└── users/               Управление пользователями (админ)
```

## Что дальше

- Подключить фронтенд к этому API (заменить мок-данные реальными запросами)
- Подписки и оплата Kaspi (entity Subscription уже есть)
- Рейтинг, достижения, уведомления
- Миграции вместо `synchronize: true` (для продакшена)
