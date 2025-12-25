"""Initial schema - Create all wallet tables (IDEMPOTENT)

Revision ID: 20251216_000001
Revises: 
Create Date: 2025-12-16

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20251216_000001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # === TABLE 1: users ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(100) UNIQUE,
            password_hash VARCHAR(255),
            stripe_customer_id VARCHAR(100) UNIQUE,
            is_active BOOLEAN DEFAULT true,
            is_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users (stripe_customer_id)')

    # === TABLE 2: users_balance ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS users_balance (
            id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE NOT NULL,
            balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
            locked_in_bets NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
            total_deposited NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
            total_withdrawn NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
            total_bet NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
            total_won NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
            last_transaction_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_balance_positive CHECK (balance >= 0),
            CONSTRAINT check_locked_positive CHECK (locked_in_bets >= 0)
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_users_balance_user_id ON users_balance (user_id)')

    # === TABLE 3: balance_transactions ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS balance_transactions (
            id SERIAL PRIMARY KEY,
            uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            transaction_type VARCHAR(20) NOT NULL,
            amount NUMERIC(15, 2) NOT NULL,
            balance_before NUMERIC(15, 2) NOT NULL,
            balance_after NUMERIC(15, 2) NOT NULL,
            reference_type VARCHAR(50),
            reference_id VARCHAR(100),
            description TEXT,
            metadata JSONB DEFAULT '{}',
            status VARCHAR(20) DEFAULT 'completed',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_transaction_type CHECK (transaction_type IN ('deposit', 'withdrawal', 'bet', 'win', 'refund', 'bonus', 'adjustment')),
            CONSTRAINT check_transaction_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions (user_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions (transaction_type)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_balance_transactions_status ON balance_transactions (status)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions (created_at)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_balance_transactions_reference ON balance_transactions (reference_type, reference_id)')

    # === TABLE 4: wallet_operations ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS wallet_operations (
            id SERIAL PRIMARY KEY,
            uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            operation_type VARCHAR(20) NOT NULL,
            amount NUMERIC(15, 2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            stripe_payment_intent_id VARCHAR(100),
            stripe_payment_method_id VARCHAR(100),
            stripe_charge_id VARCHAR(100),
            withdrawal_method_id INTEGER,
            processor VARCHAR(50),
            processor_reference VARCHAR(100),
            fee_amount NUMERIC(15, 2) DEFAULT 0.00,
            net_amount NUMERIC(15, 2),
            error_code VARCHAR(50),
            error_message TEXT,
            initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_operation_type CHECK (operation_type IN ('deposit', 'withdrawal')),
            CONSTRAINT check_operation_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
            CONSTRAINT check_amount_positive CHECK (amount > 0)
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_wallet_operations_user_id ON wallet_operations (user_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_wallet_operations_type ON wallet_operations (operation_type)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_wallet_operations_status ON wallet_operations (status)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_wallet_operations_stripe_pi ON wallet_operations (stripe_payment_intent_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_wallet_operations_created_at ON wallet_operations (created_at)')

    # === TABLE 5: payment_methods ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS payment_methods (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            stripe_payment_method_id VARCHAR(100) UNIQUE NOT NULL,
            type VARCHAR(20) NOT NULL,
            card_brand VARCHAR(20),
            card_last4 VARCHAR(4),
            card_exp_month INTEGER,
            card_exp_year INTEGER,
            cardholder_name VARCHAR(100),
            is_default BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            billing_address JSONB DEFAULT '{}',
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_payment_method_type CHECK (type IN ('card', 'bank_account', 'wallet'))
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods (user_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods (stripe_payment_method_id)')

    # === TABLE 6: withdrawal_methods ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS withdrawal_methods (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL,
            bank_name VARCHAR(100),
            account_holder_name VARCHAR(100),
            account_last4 VARCHAR(4),
            routing_number_last4 VARCHAR(4),
            crypto_currency VARCHAR(10),
            crypto_address VARCHAR(100),
            is_verified BOOLEAN DEFAULT false,
            is_default BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            verified_at TIMESTAMP WITH TIME ZONE,
            verification_method VARCHAR(50),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_withdrawal_method_type CHECK (type IN ('bank_account', 'card', 'crypto', 'ewallet'))
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_withdrawal_methods_user_id ON withdrawal_methods (user_id)')

    # === TABLE 7: bets ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS bets (
            id SERIAL PRIMARY KEY,
            uuid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            event_id VARCHAR(100) NOT NULL,
            event_name VARCHAR(255),
            market_type VARCHAR(100),
            selection VARCHAR(255),
            odds NUMERIC(10, 4) NOT NULL,
            stake NUMERIC(15, 2) NOT NULL,
            potential_win NUMERIC(15, 2) NOT NULL,
            actual_win NUMERIC(15, 2),
            status VARCHAR(20) DEFAULT 'pending',
            placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            settled_at TIMESTAMP WITH TIME ZONE,
            stake_transaction_id INTEGER REFERENCES balance_transactions(id),
            win_transaction_id INTEGER REFERENCES balance_transactions(id),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_bet_status CHECK (status IN ('pending', 'active', 'won', 'lost', 'void', 'cashout')),
            CONSTRAINT check_stake_positive CHECK (stake > 0)
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets (user_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_bets_status ON bets (status)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_bets_event_id ON bets (event_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_bets_placed_at ON bets (placed_at)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_bets_user_status ON bets (user_id, status)')

    # === TABLE 8: monthly_statements ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS monthly_statements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            opening_balance NUMERIC(15, 2) NOT NULL,
            closing_balance NUMERIC(15, 2) NOT NULL,
            total_deposits NUMERIC(15, 2) DEFAULT 0.00,
            total_withdrawals NUMERIC(15, 2) DEFAULT 0.00,
            total_bets NUMERIC(15, 2) DEFAULT 0.00,
            total_wins NUMERIC(15, 2) DEFAULT 0.00,
            total_losses NUMERIC(15, 2) DEFAULT 0.00,
            net_profit NUMERIC(15, 2) DEFAULT 0.00,
            num_bets INTEGER DEFAULT 0,
            num_wins INTEGER DEFAULT 0,
            num_losses INTEGER DEFAULT 0,
            win_rate NUMERIC(5, 2) DEFAULT 0.00,
            report_url VARCHAR(255),
            generated_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_monthly_statement UNIQUE (user_id, year, month),
            CONSTRAINT check_month_valid CHECK (month >= 1 AND month <= 12)
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_monthly_statements_user_id ON monthly_statements (user_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_monthly_statements_period ON monthly_statements (year, month)')

    # === TABLE 9: audit_log ===
    op.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50),
            entity_id VARCHAR(100),
            ip_address INET,
            user_agent TEXT,
            request_id VARCHAR(100),
            old_values JSONB,
            new_values JSONB,
            status VARCHAR(20) DEFAULT 'success',
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_audit_status CHECK (status IN ('success', 'failure', 'warning'))
        )
    """)
    op.execute('CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log (user_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id)')
    op.execute('CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at)')

    # === Create updated_at trigger function ===
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    # Apply trigger to tables with updated_at (ignore errors if already exists)
    tables_with_updated_at = [
        'users', 'users_balance', 'wallet_operations', 
        'payment_methods', 'withdrawal_methods', 'bets'
    ]
    for table in tables_with_updated_at:
        op.execute(f"""
            DO $$ 
            BEGIN
                CREATE TRIGGER update_{table}_updated_at
                BEFORE UPDATE ON {table}
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END $$;
        """)

    # === Create user balance trigger ===
    op.execute("""
        CREATE OR REPLACE FUNCTION create_user_balance()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO users_balance (user_id) VALUES (NEW.id)
            ON CONFLICT (user_id) DO NOTHING;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    op.execute("""
        DO $$ 
        BEGIN
            CREATE TRIGGER create_user_balance_trigger
            AFTER INSERT ON users
            FOR EACH ROW
            EXECUTE FUNCTION create_user_balance();
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END $$;
    """)


def downgrade() -> None:
    # Drop triggers
    op.execute('DROP TRIGGER IF EXISTS create_user_balance_trigger ON users')
    op.execute('DROP FUNCTION IF EXISTS create_user_balance()')
    
    tables_with_updated_at = [
        'users', 'users_balance', 'wallet_operations', 
        'payment_methods', 'withdrawal_methods', 'bets'
    ]
    for table in tables_with_updated_at:
        op.execute(f'DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table}')
    
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column()')

    # Drop tables in reverse order
    op.execute('DROP TABLE IF EXISTS audit_log CASCADE')
    op.execute('DROP TABLE IF EXISTS monthly_statements CASCADE')
    op.execute('DROP TABLE IF EXISTS bets CASCADE')
    op.execute('DROP TABLE IF EXISTS withdrawal_methods CASCADE')
    op.execute('DROP TABLE IF EXISTS payment_methods CASCADE')
    op.execute('DROP TABLE IF EXISTS wallet_operations CASCADE')
    op.execute('DROP TABLE IF EXISTS balance_transactions CASCADE')
    op.execute('DROP TABLE IF EXISTS users_balance CASCADE')
    op.execute('DROP TABLE IF EXISTS users CASCADE')
