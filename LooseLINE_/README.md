# LooseLINE Monorepo

Платформа для ставок на спортивные события, построенная на микросервисной архитектуре.

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Port 80)                         │
│                       API Gateway / Proxy                        │
└─────────────────┬───────────────┬───────────────┬───────────────┘
                  │               │               │
    ┌─────────────▼───┐     ┌─────▼─────┐   ┌─────▼─────┐
    │   Auth Module   │     │  Finance  │   │  Sports   │
    │   (Next.js)     │     │  (FastAPI)│   │ (FastAPI) │
    │   Port: 3000    │     │ Port: 8000│   │ Port: 8001│
    └─────────────────┘     └───────────┘   └───────────┘
                  │               │               │
    ┌─────────────▼───────────────▼───────────────▼───────────────┐
    │                     PostgreSQL (Port 5432)                   │
    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
    │  │auth_db   │ │finance_db│ │sports_db │ │betting_db│        │
    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
    └─────────────────────────────────────────────────────────────┘
```

## 📦 Модули

| Модуль | Описание | Технологии |
|--------|----------|------------|
| **Auth** | Аутентификация и управление пользователями | Next.js, Better-auth, PostgreSQL |
| **Finance** | Кошелёк, пополнение, вывод, история | FastAPI, Stripe, Redis |
| **Sports** | Управление спортивными событиями | FastAPI, React |
| **Betting** | Ставки и расчёты | FastAPI, React |

## 🚀 Быстрый старт

### Требования
- Docker 20.10+
- Docker Compose 2.0+

### 1. Клонирование и настройка

```bash
# Клонировать репозиторий
git clone https://github.com/your-org/LooseLINE.git
cd LooseLINE

# Скопировать и заполнить переменные окружения
cp .env.example .env
# Отредактировать .env и заполнить секреты
```

### 2. Запуск всех сервисов

```bash
# Сборка и запуск всех контейнеров
docker compose up -d --build

# Посмотреть логи
docker compose logs -f

# Проверить статус
docker compose ps
```

### 3. Запуск миграций (первый раз)

```bash
# Auth модуль (Better-auth миграции)
docker compose --profile migrations run --rm auth-migrations

# Finance модуль (Alembic миграции)
docker compose --profile migrations run --rm finance-migrations
```

## 🌐 Доступ к сервисам

| Сервис | URL | Описание |
|--------|-----|----------|
| Главная | http://localhost | Auth модуль (Landing + Auth) |
| Wallet API | http://localhost/api/wallet | Finance API |
| Events API | http://localhost/api/events | Sports API |
| Bets API | http://localhost/api/bets | Betting API |

### Прямой доступ (для разработки)

| Сервис | URL |
|--------|-----|
| Auth | http://localhost:3000 |
| Finance Backend | http://localhost:8000 |
| Finance Frontend | http://localhost:3001 |
| Sports Backend | http://localhost:8001 |
| Sports Frontend | http://localhost:3002 |
| Betting Frontend | http://localhost:3003 |

## 📂 Структура проекта

```
LooseLINE/
├── docker-compose.yml          # Главный Docker Compose
├── .env.example                # Шаблон переменных окружения
├── nginx/
│   ├── nginx.conf              # Конфигурация reverse proxy
│   └── conf.d/                 # Дополнительные конфиги
├── scripts/
│   └── init-db.sh              # Инициализация БД
├── Modules/
│   ├── Authentication_and_User_Management_Module/
│   ├── Finance_and_History_Module/
│   ├── Sports_Event_Management_Module/
│   └── The_betting_and_settlement_module/
├── Shared/                     # Общие утилиты
└── LooseLINE_Documents/        # Документация
```

## 🛠️ Разработка

### Запуск отдельного модуля

```bash
# Только Auth модуль
docker compose up -d postgres auth-app

# Только Finance модуль
docker compose up -d postgres redis finance-backend finance-frontend
```

### Пересборка конкретного сервиса

```bash
docker compose build auth-app
docker compose up -d auth-app
```

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f auth-app
```

## 🧪 Тестирование

```bash
# Health check всех сервисов
curl http://localhost/health

# Auth API
curl http://localhost/api/auth/session

# Finance API
curl http://localhost/api/wallet/health

# Sports API
curl http://localhost/api/events/health
```

## 🔧 Управление

### Остановка всех сервисов

```bash
docker compose down
```

### Полная очистка (включая volumes)

```bash
docker compose down -v
```

### Просмотр баз данных

```bash
docker compose exec postgres psql -U looseline -c "\l"
```

## 📝 Переменные окружения

См. [.env.example](.env.example) для полного списка.

| Переменная | Описание | Обязательно |
|------------|----------|-------------|
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | ✅ |
| `BETTER_AUTH_SECRET` | Секрет для JWT | ✅ |
| `STRIPE_SECRET_KEY` | Ключ Stripe API | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Секрет для Stripe webhooks | ✅ |

## 📄 Лицензия

MIT
