-- Тестовые данные для демонстрации структуры таблиц
-- Этот файл можно запустить в DBeaver после создания таблиц

-- 1. Пользователи
INSERT INTO users (id, username, email) VALUES
    ('user_123', 'test_user_1', 'user1@test.com'),
    ('user_456', 'test_user_2', 'user2@test.com'),
    ('user_789', 'test_user_3', 'user3@test.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Балансы пользователей
INSERT INTO users_balance (user_id, balance, total_deposited, total_withdrawn, currency) VALUES
    ('user_123', 5000.00, 10000.00, 5000.00, 'USD'),
    ('user_456', 250.50, 1000.00, 749.50, 'USD'),
    ('user_789', 12500.00, 50000.00, 37500.00, 'USD')
ON CONFLICT (user_id) DO NOTHING;

-- 3. События
INSERT INTO events (event_id, event_name, event_date, status) VALUES
    (1, 'Man Utd vs Liverpool', '2025-12-15 18:00:00', 'finished'),
    (2, 'Real Madrid vs Barcelona', '2025-12-15 19:45:00', 'finished'),
    (3, 'Arsenal vs Chelsea', '2025-12-16 20:00:00', 'scheduled'),
    (4, 'PSG vs Marseille', '2025-12-17 21:00:00', 'scheduled')
ON CONFLICT (event_id) DO NOTHING;

-- 4. Коэффициенты
INSERT INTO odds (odds_id, event_id, bet_type, coefficient) VALUES
    -- Man Utd vs Liverpool
    (1, 1, '1', 1.85),
    (2, 1, 'X', 3.40),
    (3, 1, '2', 2.20),
    -- Real Madrid vs Barcelona
    (4, 2, '1', 2.10),
    (5, 2, 'X', 3.30),
    (6, 2, '2', 2.60),
    -- Arsenal vs Chelsea
    (7, 3, '1', 1.75),
    (8, 3, 'X', 3.50),
    (9, 3, '2', 2.40),
    -- PSG vs Marseille
    (10, 4, '1', 1.90),
    (11, 4, 'X', 3.20),
    (12, 4, '2', 2.30)
ON CONFLICT (odds_id) DO NOTHING;

-- 5. Ставки
INSERT INTO bets (bet_id, user_id, event_id, odds_id, bet_type, bet_amount, coefficient, potential_win, status, result, actual_win, placed_at, event_name, event_date, event_end_date, expected_result) VALUES
    (1, 'user_123', 1, 1, '1', 100.00, 1.85, 185.00, 'resolved', 'win', 185.00, '2025-12-15 10:30:00', 'Man Utd vs Liverpool', '2025-12-15 18:00:00', '2025-12-15 20:00:00', 'П1'),
    (2, 'user_123', 2, 4, '1', 50.00, 2.10, 105.00, 'resolved', 'win', 105.00, '2025-12-15 11:00:00', 'Real Madrid vs Barcelona', '2025-12-15 19:45:00', '2025-12-15 21:45:00', 'П1'),
    (3, 'user_456', 1, 2, 'X', 200.00, 3.40, 680.00, 'resolved', 'loss', 0.00, '2025-12-15 10:45:00', 'Man Utd vs Liverpool', '2025-12-15 18:00:00', '2025-12-15 20:00:00', 'X'),
    (4, 'user_789', 3, 7, '1', 1000.00, 1.75, 1750.00, 'open', NULL, NULL, '2025-12-16 12:00:00', 'Arsenal vs Chelsea', '2025-12-16 20:00:00', '2025-12-16 22:00:00', 'П1'),
    (5, 'user_123', 3, 8, 'X', 150.00, 3.50, 525.00, 'open', NULL, NULL, '2025-12-16 13:00:00', 'Arsenal vs Chelsea', '2025-12-16 20:00:00', '2025-12-16 22:00:00', 'X'),
    (6, 'user_456', 4, 10, '1', 75.00, 1.90, 142.50, 'open', NULL, NULL, '2025-12-17 09:00:00', 'PSG vs Marseille', '2025-12-17 21:00:00', '2025-12-17 23:00:00', 'П1')
ON CONFLICT (bet_id) DO NOTHING;

-- 6. Результаты событий
INSERT INTO bet_results (result_id, event_id, winning_bet_type, home_score, away_score, resolved_at) VALUES
    (1, 1, '1', 2, 1, '2025-12-15 20:45:00'),
    (2, 2, 'X', 1, 1, '2025-12-15 21:30:00')
ON CONFLICT (result_id) DO NOTHING;

-- 7. Купоны
INSERT INTO coupons (coupon_id, user_id, coupon_code, total_bet_amount, total_potential_win, status, result, actual_win, number_of_bets, created_at) VALUES
    (1, 'user_123', 'CPN20251215_ABC123', 150.00, 290.00, 'resolved', 'win', 290.00, 2, '2025-12-15 10:00:00'),
    (2, 'user_456', 'CPN20251216_XYZ789', 300.00, 1200.00, 'resolved', 'loss', 0.00, 3, '2025-12-16 11:00:00'),
    (3, 'user_789', 'CPN20251217_DEF456', 2000.00, 5500.00, 'open', NULL, NULL, 5, '2025-12-17 10:00:00')
ON CONFLICT (coupon_id) DO NOTHING;

-- 8. Связь купонов и ставок
INSERT INTO coupon_bets (coupon_bet_id, coupon_id, bet_id) VALUES
    -- Купон 1: ставки 1 и 2 (обе выиграли)
    (1, 1, 1),
    (2, 1, 2),
    -- Купон 2: ставки 3, 4, 5 (одна проиграла)
    (3, 2, 3),
    (4, 2, 4),
    (5, 2, 5),
    -- Купон 3: ставки 4, 5, 6 (все открыты)
    (6, 3, 4),
    (7, 3, 5),
    (8, 3, 6)
ON CONFLICT (coupon_bet_id) DO NOTHING;

-- 9. Транзакции
INSERT INTO bet_transactions (transaction_id, user_id, bet_id, transaction_type, amount, balance_before, balance_after, description, created_at) VALUES
    -- user_123: ставка на Man Utd
    (1, 'user_123', 1, 'bet_placed', -100.00, 5100.00, 5000.00, 'Ставка на Man Utd (1.85)', '2025-12-15 10:30:00'),
    (2, 'user_123', 1, 'bet_won', 185.00, 5000.00, 5185.00, 'Выигрыш ставки #1', '2025-12-15 20:45:00'),
    -- user_123: ставка на Real Madrid
    (3, 'user_123', 2, 'bet_placed', -50.00, 5185.00, 5135.00, 'Ставка на Real Madrid (2.10)', '2025-12-15 11:00:00'),
    (4, 'user_123', 2, 'bet_won', 105.00, 5135.00, 5240.00, 'Выигрыш ставки #2', '2025-12-15 21:30:00'),
    -- user_456: ставка на ничью
    (5, 'user_456', 3, 'bet_placed', -200.00, 450.50, 250.50, 'Ставка на ничью Man Utd vs Liverpool (3.40)', '2025-12-15 10:45:00'),
    (6, 'user_456', 3, 'bet_lost', 0.00, 250.50, 250.50, 'Проигрыш ставки #3', '2025-12-15 20:45:00'),
    -- user_789: ставка на Arsenal
    (7, 'user_789', 4, 'bet_placed', -1000.00, 13500.00, 12500.00, 'Ставка на Arsenal (1.75)', '2025-12-16 12:00:00'),
    -- user_123: пополнение счета
    (8, 'user_123', NULL, 'deposit', 1000.00, 5240.00, 6240.00, 'Пополнение счета', '2025-12-16 14:00:00'),
    -- user_123: ставка на ничью Arsenal vs Chelsea
    (9, 'user_123', 5, 'bet_placed', -150.00, 6240.00, 6090.00, 'Ставка на ничью Arsenal vs Chelsea (3.50)', '2025-12-16 13:00:00'),
    -- user_456: ставка на PSG
    (10, 'user_456', 6, 'bet_placed', -75.00, 250.50, 175.50, 'Ставка на PSG (1.90)', '2025-12-17 09:00:00')
ON CONFLICT (transaction_id) DO NOTHING;

