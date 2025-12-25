#!/bin/bash
set -e

echo "🔧 Initializing LooseLINE databases..."

# Function to create database if it doesn't exist
create_db_if_not_exists() {
    local db_name=$1
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        SELECT 'CREATE DATABASE $db_name'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db_name')\gexec
EOSQL
    echo "✅ Database '$db_name' ready"
}

# Create individual databases for each module
create_db_if_not_exists "looseline_auth"
create_db_if_not_exists "looseline_finance"
create_db_if_not_exists "looseline_sports"
create_db_if_not_exists "looseline_betting"

echo "🎉 All databases initialized successfully!"

# ===============================================
# SPORTS MODULE - FULL SCHEMA & TEST DATA
# ===============================================
echo ""
echo "⚽ Initializing Sports Events module..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "looseline_sports" <<-EOSQL
    -- ===============================================
    -- CREATE ALL TABLES
    -- ===============================================

    -- Sports types table
    CREATE TABLE IF NOT EXISTS sports_types (
        sport_id SERIAL PRIMARY KEY,
        sport_name VARCHAR(50) UNIQUE NOT NULL,
        icon_emoji VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- Leagues table
    CREATE TABLE IF NOT EXISTS leagues (
        league_id SERIAL PRIMARY KEY,
        league_name VARCHAR(100) NOT NULL,
        sport_id INTEGER REFERENCES sports_types(sport_id),
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- Events table (new structure)
    CREATE TABLE IF NOT EXISTS events (
        event_id SERIAL PRIMARY KEY,
        sport_id INTEGER REFERENCES sports_types(sport_id),
        league_id INTEGER REFERENCES leagues(league_id),
        home_team VARCHAR(100),
        away_team VARCHAR(100),
        event_datetime TIMESTAMP,
        status VARCHAR(20) DEFAULT 'scheduled',
        home_score INTEGER,
        away_score INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Odds table
    CREATE TABLE IF NOT EXISTS odds (
        odds_id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(event_id),
        bet_type VARCHAR(10) NOT NULL,
        coefficient DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Odds history table
    CREATE TABLE IF NOT EXISTS odds_history (
        history_id SERIAL PRIMARY KEY,
        odds_id INTEGER REFERENCES odds(odds_id),
        old_coefficient DECIMAL(10, 2),
        new_coefficient DECIMAL(10, 2),
        changed_by VARCHAR(50),
        reason TEXT,
        changed_at TIMESTAMP DEFAULT NOW()
    );

    -- ===============================================
    -- INSERT TEST DATA
    -- ===============================================

    -- Insert sports types
    INSERT INTO sports_types (sport_name, icon_emoji) VALUES
        ('football', '⚽'),
        ('basketball', '🏀'),
        ('hockey', '🏒'),
        ('tennis', '🎾')
    ON CONFLICT (sport_name) DO NOTHING;

    -- Insert leagues
    INSERT INTO leagues (league_name, sport_id) VALUES
        ('Премьер-лига', (SELECT sport_id FROM sports_types WHERE sport_name = 'football')),
        ('Ла Лига', (SELECT sport_id FROM sports_types WHERE sport_name = 'football')),
        ('Бундеслига', (SELECT sport_id FROM sports_types WHERE sport_name = 'football')),
        ('NBA', (SELECT sport_id FROM sports_types WHERE sport_name = 'basketball')),
        ('Евролига', (SELECT sport_id FROM sports_types WHERE sport_name = 'basketball')),
        ('КХЛ', (SELECT sport_id FROM sports_types WHERE sport_name = 'hockey')),
        ('NHL', (SELECT sport_id FROM sports_types WHERE sport_name = 'hockey'))
    ON CONFLICT DO NOTHING;

    -- Insert test events (только если таблица пустая)
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM events) THEN
            -- Football events
            INSERT INTO events (sport_id, league_id, home_team, away_team, event_datetime, status) VALUES
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'football'),
                 (SELECT league_id FROM leagues WHERE league_name = 'Премьер-лига'),
                 'Манчестер Юнайтед', 'Ливерпуль', NOW() + INTERVAL '2 days 14:00', 'scheduled'),
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'football'),
                 (SELECT league_id FROM leagues WHERE league_name = 'Ла Лига'),
                 'Реал Мадрид', 'Барселона', NOW() + INTERVAL '1 day 20:00', 'scheduled'),
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'football'),
                 (SELECT league_id FROM leagues WHERE league_name = 'Бундеслига'),
                 'Бавария', 'Боруссия Дортмунд', NOW() + INTERVAL '3 days 18:30', 'scheduled');

            -- Basketball events
            INSERT INTO events (sport_id, league_id, home_team, away_team, event_datetime, status) VALUES
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'basketball'),
                 (SELECT league_id FROM leagues WHERE league_name = 'NBA'),
                 'Lakers', 'Warriors', NOW() + INTERVAL '1 day 22:00', 'scheduled'),
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'basketball'),
                 (SELECT league_id FROM leagues WHERE league_name = 'NBA'),
                 'Celtics', 'Heat', NOW() + INTERVAL '2 days 19:00', 'scheduled');

            -- Hockey events
            INSERT INTO events (sport_id, league_id, home_team, away_team, event_datetime, status) VALUES
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'hockey'),
                 (SELECT league_id FROM leagues WHERE league_name = 'КХЛ'),
                 'ЦСКА', 'Спартак', NOW() + INTERVAL '1 day 17:00', 'scheduled'),
                ((SELECT sport_id FROM sports_types WHERE sport_name = 'hockey'),
                 (SELECT league_id FROM leagues WHERE league_name = 'КХЛ'),
                 'СКА', 'Динамо Москва', NOW() + INTERVAL '2 days 19:30', 'scheduled');

            -- Insert odds for events
            INSERT INTO odds (event_id, bet_type, coefficient) VALUES
                -- Manchester vs Liverpool
                (1, '1', 2.45), (1, 'X', 3.20), (1, '2', 2.80),
                -- Real vs Barca
                (2, '1', 2.10), (2, 'X', 3.50), (2, '2', 3.00),
                -- Bayern vs Dortmund
                (3, '1', 1.85), (3, 'X', 3.80), (3, '2', 3.60),
                -- Lakers vs Warriors
                (4, '1', 1.95), (4, 'X', 15.00), (4, '2', 2.10),
                -- Celtics vs Heat
                (5, '1', 1.75), (5, 'X', 14.00), (5, '2', 2.30),
                -- CSKA vs Spartak
                (6, '1', 2.00), (6, 'X', 4.00), (6, '2', 2.50),
                -- SKA vs Dynamo
                (7, '1', 1.90), (7, 'X', 4.20), (7, '2', 2.60);
        END IF;
    END \$\$;

    -- Show summary
    SELECT
        s.sport_name,
        COUNT(DISTINCT e.event_id) as event_count,
        COUNT(DISTINCT l.league_id) as league_count
    FROM sports_types s
    LEFT JOIN events e ON s.sport_id = e.sport_id
    LEFT JOIN leagues l ON s.sport_id = l.sport_id
    GROUP BY s.sport_name;
EOSQL

echo "✅ Sports Events module initialized with full schema!"

echo ""
echo "🎉 All initialization complete!"
