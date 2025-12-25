#!/usr/bin/env python3
"""Простой скрипт для просмотра ставок в базе данных"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Загружаем настройки из .env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/looseline_db")

# Подключение к базе
engine = create_engine(DATABASE_URL)
conn = engine.connect()

print("=" * 80)
print("СТАВКИ В БАЗЕ ДАННЫХ")
print("=" * 80)

# Получаем все ставки
result = conn.execute(text("""
    SELECT
        bet_id,
        user_id,
        event_id,
        event_name,
        event_date,
        event_end_date,
        bet_type,
        bet_amount,
        coefficient,
        potential_win,
        status,
        placed_at
    FROM bets
    ORDER BY placed_at DESC
    LIMIT 20
"""))

bets = result.fetchall()

if not bets:
    print("\n❌ Ставок пока нет в базе данных")
else:
    print(f"\n📊 Найдено ставок: {len(bets)}\n")
    
    for bet in bets:
        print(f"ID ставки: {bet.bet_id}")
        print(f"  Пользователь: {bet.user_id}")
        print(f"  Событие: {bet.event_name or f'ID {bet.event_id}'}")
        print(f"  Дата матча: {bet.event_date}")
        print(f"  Дата окончания: {bet.event_end_date}")
        print(f"  Тип ставки: {bet.bet_type} ({'П1' if bet.bet_type == '1' else 'X' if bet.bet_type == 'X' else 'П2'})")
        print(f"  Сумма: {bet.bet_amount} ₽")
        print(f"  Коэффициент: {bet.coefficient}")
        print(f"  Потенциальный выигрыш: {bet.potential_win} ₽")
        print(f"  Статус: {bet.status}")
        print(f"  Время: {bet.placed_at}")
        print("-" * 80)

# Статистика
stats_result = conn.execute(text("SELECT COUNT(*) as total, SUM(bet_amount) as total_amount FROM bets"))
stats = stats_result.fetchone()
print(f"\n📈 Статистика:")
print(f"  Всего ставок: {stats.total}")
if stats.total_amount:
    print(f"  Общая сумма: {stats.total_amount} ₽")

conn.close()

