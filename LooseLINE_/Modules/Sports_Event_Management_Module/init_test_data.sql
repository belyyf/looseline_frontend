-- Init script для тестовых данных модуля Sports Event Management
-- Создает таблицу events и заполняет тестовыми данными
-- Создаем таблицу events если не существует
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Очищаем существующие данные
TRUNCATE TABLE events RESTART IDENTITY CASCADE;
-- Вставляем тестовые футбольные события
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
-- Вставляем тестовые баскетбольные события
INSERT INTO events (sport, title)
VALUES ('basketball', 'Lakers vs Warriors'),
    ('basketball', 'Celtics vs Heat'),
    ('basketball', 'Bulls vs Knicks'),
    ('basketball', 'Nets vs 76ers'),
    ('basketball', 'Suns vs Clippers'),
    ('basketball', 'Mavericks vs Nuggets'),
    ('basketball', 'Bucks vs Cavaliers'),
    ('basketball', 'Grizzlies vs Pelicans');
-- Вставляем тестовые хоккейные события
INSERT INTO events (sport, title)
VALUES ('hockey', 'СКА vs ЦСКА'),
    ('hockey', 'Динамо Москва vs Спартак'),
    ('hockey', 'Ак Барс vs Салават Юлаев'),
    ('hockey', 'Магнитогорск vs Авангард'),
    ('hockey', 'Трактор vs Автомобилист'),
    ('hockey', 'Локомотив vs Торпедо'),
    ('hockey', 'Сочи vs Динамо Минск'),
    ('hockey', 'Йокерит vs Барыс');
-- Подтверждаем данные
SELECT sport,
    COUNT(*) as count
FROM events
GROUP BY sport
ORDER BY sport;