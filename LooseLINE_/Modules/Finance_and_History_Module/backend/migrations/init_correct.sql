-- LOOSELINE Finance Database Schema
-- Синхронизировано с ORM моделями

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABLE 1: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- TABLE 2: users_balance
CREATE TABLE IF NOT EXISTS users_balance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    locked_in_bets DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (locked_in_bets >= 0),
    total_deposited DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_bet DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_won DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_lost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    last_transaction TIMESTAMP WITH TIME ZONE,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_balance_user_id ON users_balance(user_id);
CREATE TRIGGER update_users_balance_updated_at 
    BEFORE UPDATE ON users_balance FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- TABLE 3: balance_transactions
CREATE TABLE IF NOT EXISTS balance_transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX idx_balance_transactions_created_at ON balance_transactions(created_at DESC);

-- TABLE 4: wallet_operations
CREATE TABLE IF NOT EXISTS wallet_operations (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('deposit', 'withdrawal')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    stripe_payment_intent_id VARCHAR(100),
    stripe_payment_method_id VARCHAR(100),
    stripe_charge_id VARCHAR(100),
    withdrawal_method_id INTEGER,
    processor VARCHAR(50),
    processor_reference VARCHAR(100),
    fee_amount DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2),
    error_code VARCHAR(50),
    error_message TEXT,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_operations_user_id ON wallet_operations(user_id);
CREATE INDEX idx_wallet_operations_type ON wallet_operations(operation_type);
CREATE INDEX idx_wallet_operations_status ON wallet_operations(status);
CREATE INDEX idx_wallet_operations_stripe_pi ON wallet_operations(stripe_payment_intent_id);
CREATE INDEX idx_wallet_operations_created_at ON wallet_operations(created_at DESC);
CREATE TRIGGER update_wallet_operations_updated_at 
    BEFORE UPDATE ON wallet_operations FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- TABLE 5: payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(100) UNIQUE NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- TABLE 6: withdrawal_methods
CREATE TABLE IF NOT EXISTS withdrawal_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL,
    account_details JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_withdrawal_methods_user_id ON withdrawal_methods(user_id);
CREATE TRIGGER update_withdrawal_methods_updated_at 
    BEFORE UPDATE ON withdrawal_methods FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- TABLE 7: monthly_statements
CREATE TABLE IF NOT EXISTS monthly_statements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'generated',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monthly_statements_user_id ON monthly_statements(user_id);
CREATE INDEX idx_monthly_statements_period ON monthly_statements(period_date);

-- TABLE 8: audit_log
CREATE TABLE IF NOT EXISTS audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2),
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- TABLE 9: bets (MAIN TABLE FOR STAKES)
CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id VARCHAR(100) NOT NULL,
    event_name VARCHAR(255),
    market_type VARCHAR(100),
    selection VARCHAR(255),
    odds DECIMAL(10, 4) NOT NULL,
    stake DECIMAL(15, 2) NOT NULL CHECK (stake > 0),
    potential_win DECIMAL(15, 2) NOT NULL,
    actual_win DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'won', 'lost', 'void', 'cashout')),
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP WITH TIME ZONE,
    stake_transaction_id INTEGER,
    win_transaction_id INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_result_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_event_id ON bets(event_id);
CREATE INDEX idx_bets_placed_at ON bets(placed_at DESC);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE TRIGGER update_bets_updated_at 
    BEFORE UPDATE ON bets FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Демо пользователь
INSERT INTO users (id, uuid, email, username, password_hash, stripe_customer_id, is_active, is_verified) 
VALUES (1, uuid_generate_v4(), 'demo@looseline.com', 'demo_user', '$2b$12$demo_password_hash_for_demo_user', 'cus_demo123', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users_balance (user_id, balance, locked_in_bets, total_deposited, total_withdrawn, total_bet, total_won, total_lost, currency) 
VALUES (1, 5000.00, 0.00, 5000.00, 0.00, 0.00, 0.00, 0.00, 'USD')
ON CONFLICT (user_id) DO NOTHING;

-- Демо ставки с expected_result_date
INSERT INTO bets (user_id, event_id, event_name, market_type, selection, odds, stake, potential_win, status, expected_result_date)
VALUES 
    (1, 'EVT001', 'Манчестер Сити vs Челси', '1X2', 'П1', 1.85, 100.00, 185.00, 'pending', '2025-12-31 20:00:00+00'),
    (1, 'EVT002', 'Реал Мадрид vs Барселона', '1X2', 'X', 3.20, 50.00, 160.00, 'active', '2025-12-30 19:30:00+00'),
    (1, 'EVT003', 'Ливерпуль vs Арсенал', 'Total', 'Over 2.5', 2.10, 75.00, 157.50, 'won', '2025-12-20 15:00:00+00')
ON CONFLICT DO NOTHING;

COMMIT;
