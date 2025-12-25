#!/usr/bin/env python3
"""
Init script для заполнения базы данных тестовыми данными
Запуск: python init_test_data.py
"""

import psycopg2

# Конфигурация подключения к БД
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "looseline",
    "user": "postgres",
    "password": "postgres"
}

# Тестовые данные
FOOTBALL_EVENTS = [
    "Манчестер Юнайтед vs Ливерпуль",
    "Реал Мадрид vs Барселона",
    "Бавария vs Боруссия Дортмунд",
    "ПСЖ vs Марсель",
    "Милан vs Интер",
    "Ювентус vs Наполи",
    "Арсенал vs Челси",
    "Манчестер Сити vs Тоттенхэм",
    "Атлетико Мадрид vs Севилья",
    "Порту vs Бенфика",
]

BASKETBALL_EVENTS = [
    "Lakers vs Warriors",
    "Celtics vs Heat",
    "Bulls vs Knicks",
    "Nets vs 76ers",
    "Suns vs Clippers",
    "Mavericks vs Nuggets",
    "Bucks vs Cavaliers",
    "Grizzlies vs Pelicans",
]

HOCKEY_EVENTS = [
    "СКА vs ЦСКА",
    "Динамо Москва vs Спартак",
    "Ак Барс vs Салават Юлаев",
    "Магнитогорск vs Авангард",
    "Трактор vs Автомобилист",
    "Локомотив vs Торпедо",
    "Сочи vs Динамо Минск",
    "Йокерит vs Барыс",
]

def main():
    print("🔄 Подключение к базе данных...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Создаем таблицу если не существует
        print("📋 Создание таблицы events...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                sport VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Очищаем существующие данные
        print("🗑️  Очистка существующих данных...")
        cur.execute("TRUNCATE TABLE events RESTART IDENTITY CASCADE")
        
        # Вставляем футбольные события
        print("⚽ Добавление футбольных событий...")
        for title in FOOTBALL_EVENTS:
            cur.execute(
                "INSERT INTO events (sport, title) VALUES (%s, %s)",
                ("football", title)
            )
        
        # Вставляем баскетбольные события
        print("🏀 Добавление баскетбольных событий...")
        for title in BASKETBALL_EVENTS:
            cur.execute(
                "INSERT INTO events (sport, title) VALUES (%s, %s)",
                ("basketball", title)
            )
        
        # Вставляем хоккейные события
        print("🏒 Добавление хоккейных событий...")
        for title in HOCKEY_EVENTS:
            cur.execute(
                "INSERT INTO events (sport, title) VALUES (%s, %s)",
                ("hockey", title)
            )
        
        conn.commit()
        
        # Проверяем результат
        cur.execute("""
            SELECT sport, COUNT(*) as count 
            FROM events 
            GROUP BY sport 
            ORDER BY sport
        """)
        
        print("\n✅ Данные успешно загружены:")
        print("-" * 30)
        for row in cur.fetchall():
            print(f"  {row[0]}: {row[1]} событий")
        
        cur.execute("SELECT COUNT(*) FROM events")
        total = cur.fetchone()[0]
        print("-" * 30)
        print(f"  Всего: {total} событий")
        
        cur.close()
        conn.close()
        
        print("\n🎉 Инициализация завершена!")
        
    except psycopg2.OperationalError as e:
        print(f"❌ Ошибка подключения к БД: {e}")
        print("\nУбедитесь что:")
        print("  1. PostgreSQL запущен")
        print("  2. База данных 'looseline' существует")
        print("  3. Пользователь 'postgres' имеет доступ")
        return 1
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
