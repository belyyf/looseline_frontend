-- Инициализация базы данных looseline
-- Создание таблиц для модуля ставок и расчётов

-- Таблица пользователей (базовая, для foreign keys)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица 1: users_balance (Баланс пользователя)
CREATE TABLE IF NOT EXISTS users_balance (
    user_id VARCHAR(20) PRIMARY KEY,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_deposited DECIMAL(15,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица событий (для foreign keys)
CREATE TABLE IF NOT EXISTS events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, finished, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица коэффициентов (для foreign keys)
CREATE TABLE IF NOT EXISTS odds (
    odds_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    bet_type VARCHAR(10) NOT NULL, -- '1', 'X', '2'
    coefficient DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- Таблица 2: bets (Ставки)
CREATE TABLE IF NOT EXISTS bets (
    bet_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    event_id INTEGER NOT NULL,
    odds_id INTEGER NOT NULL,
    bet_type VARCHAR(10),
    bet_amount DECIMAL(15,2) NOT NULL,
    coefficient DECIMAL(10,2) NOT NULL,
    potential_win DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, resolved, cancelled
    result VARCHAR(20), -- win, loss, void
    actual_win DECIMAL(15,2),
    placed_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (odds_id) REFERENCES odds(odds_id)
);

-- Таблица 3: coupons (Купоны ставок)
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    coupon_code VARCHAR(20) UNIQUE NOT NULL,
    total_bet_amount DECIMAL(15,2) NOT NULL,
    total_potential_win DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, resolved, cancelled, void
    result VARCHAR(20), -- win, loss, void
    actual_win DECIMAL(15,2),
    number_of_bets INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица 4: coupon_bets (Связь купонов и ставок)
CREATE TABLE IF NOT EXISTS coupon_bets (
    coupon_bet_id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL,
    bet_id INTEGER NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id),
    FOREIGN KEY (bet_id) REFERENCES bets(bet_id)
);

-- Таблица 5: bet_transactions (История транзакций)
CREATE TABLE IF NOT EXISTS bet_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    bet_id INTEGER,
    transaction_type VARCHAR(20) NOT NULL, -- bet_placed, bet_won, bet_lost, bet_cancelled, deposit, withdrawal, bet_reopened
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (bet_id) REFERENCES bets(bet_id)
);

-- Таблица 6: bet_results (Результаты событий)
CREATE TABLE IF NOT EXISTS bet_results (
    result_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    winning_bet_type VARCHAR(10), -- '1', 'X', '2'
    home_score INTEGER,
    away_score INTEGER,
    resolved_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_event_id ON bets(event_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_bets_coupon_id ON coupon_bets(coupon_id);
CREATE INDEX IF NOT EXISTS idx_bet_transactions_user_id ON bet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bet_transactions_bet_id ON bet_transactions(bet_id);

-- Вставка тестовых данных (опционально)
INSERT INTO users (id, username, email) VALUES
    ('user_123', 'test_user_1', 'user1@test.com'),
    ('user_456', 'test_user_2', 'user2@test.com'),
    ('user_789', 'test_user_3', 'user3@test.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_balance (user_id, balance, total_deposited, total_withdrawn, currency) VALUES
    ('user_123', 5000.00, 10000.00, 5000.00, 'USD'),
    ('user_456', 250.50, 1000.00, 749.50, 'USD'),
    ('user_789', 12500.00, 50000.00, 37500.00, 'USD')
ON CONFLICT (user_id) DO NOTHING;

