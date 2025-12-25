-- Init script для тестовых данных Sports Event Management
-- Автоматически применяется при запуске docker-compose
-- Подключаемся к базе данных looseline_sports
\ connect looseline_sports;
-- Создаем таблицу events если не существует
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Вставляем данные только если таблица пустая
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM events
    LIMIT 1
) THEN -- Футбольные события
INSERT INTO events (sport, title)
VALUES ('football', 'Манчестер Юнайтед vs Ливерпуль'),
    ('football', 'Реал Мадрид vs Барселона'),
    ('football', 'Бавария vs Боруссия Дортмунд'),
    ('football', 'ПСЖ vs Марсель'),
    ('football', 'Милан vs Интер'),
    ('football', 'Ювентус vs Наполи'),
    ('football', 'Арсенал vs Челси'),
    ('football', 'Манчестер Сити vs Тоттенхэм'),
    ('football', 'Атлетико Мадрид vs Севилья'),
    ('football', 'Порту vs Бенфика');
-- Баскетбольные события
INSERT INTO events (sport, title)
VALUES ('basketball', 'Lakers vs Warriors'),
    ('basketball', 'Celtics vs Heat'),
    ('basketball', 'Bulls vs Knicks'),
    ('basketball', 'Nets vs 76ers'),
    ('basketball', 'Suns vs Clippers'),
    ('basketball', 'Mavericks vs Nuggets'),
    ('basketball', 'Bucks vs Cavaliers'),
    ('basketball', 'Grizzlies vs Pelicans');
-- Хоккейные события
INSERT INTO events (sport, title)
VALUES ('hockey', 'СКА vs ЦСКА'),
    ('hockey', 'Динамо Москва vs Спартак'),
    ('hockey', 'Ак Барс vs Салават Юлаев'),
    ('hockey', 'Магнитогорск vs Авангард'),
    ('hockey', 'Трактор vs Автомобилист'),
    ('hockey', 'Локомотив vs Торпедо'),
    ('hockey', 'Сочи vs Динамо Минск'),
    ('hockey', 'Йокерит vs Барыс');
RAISE NOTICE '✅ Тестовые данные Sports Events загружены (26 событий)';
ELSE RAISE NOTICE '⏭️ Тестовые данные уже существуют, пропускаем';
END IF;
END $$;