---
order: 1
title: ДИЗАЙН-СИСТЕМА
---

## 🌈 ЦВЕТОВАЯ ПАЛИТРА

### **Основные цвета (Primary Colors)**

```css
/* Основной зеленый - для кнопок действий, активных элементов */
--color-primary: #27ae60;           /* RGB: 39, 174, 96 */
--color-primary-light: #2ecc71;     /* RGB: 46, 204, 113 */
--color-primary-dark: #229954;      /* RGB: 34, 153, 84 */
--color-primary-very-dark: #1e8449; /* RGB: 30, 132, 73 */

/* Примеры использования:
   - Кнопка "Сделать ставку"
   - Активные фильтры
   - Успешные операции
   - Активная навигация
*/
```

### **Вторичные цвета (Secondary Colors)**

```css
/* Информационный синий - для информационных сообщений, ссылок */
--color-info: #3498db;              /* RGB: 52, 152, 219 */
--color-info-light: #5dade2;        /* RGB: 93, 173, 226 */
--color-info-dark: #2980b9;         /* RGB: 41, 128, 185 */

/* Примеры использования:
   - Коэффициенты (цена)
   - Информационные уведомления
   - Ссылки
   - Live статус
*/
```

### **Цвета состояний (Status Colors)**

```css
/* УСПЕХ - для выигрышных ставок, подтверждения */
--color-success: #27ae60;           /* RGB: 39, 174, 96 */
--color-success-bg: #d5f4e6;        /* Светлый зелёный фон */
--color-success-border: #a3e4d7;    /* Зелёная граница */

/* ОШИБКА - для проигрышных ставок, ошибок */
--color-error: #e74c3c;             /* RGB: 231, 76, 60 */
--color-error-bg: #fadbd8;          /* Светлый красный фон */
--color-error-border: #f5b7b1;      /* Красная граница */

/* ПРЕДУПРЕЖДЕНИЕ - для осторожности, ограничений */
--color-warning: #f39c12;           /* RGB: 243, 156, 18 */
--color-warning-bg: #fef5e7;        /* Светлый жёлтый фон */
--color-warning-border: #fad7a0;    /* Жёлтая граница */

/* ИНФОРМАЦИЯ - для нейтральной информации */
--color-info: #3498db;              /* RGB: 52, 152, 219 */
--color-info-bg: #d6eaf8;           /* Светлый синий фон */
--color-info-border: #aed6f1;       /* Синяя граница */

/* LIVE - специальный цвет для live-событий */
--color-live: #c0392b;              /* RGB: 192, 57, 43 */
--color-live-bg: #fadbd8;           /* Светлый красный фон */
--color-live-pulse: #e74c3c;        /* Мигающий цвет */
```

### **Нейтральные цвета (Neutrals)**

```css
/* ОСНОВНОЙ ТЕКСТ */
--color-text-primary: #2c3e50;      /* RGB: 44, 62, 80 */
--color-text-secondary: #7f8c8d;    /* RGB: 127, 140, 141 */
--color-text-tertiary: #95a5a6;     /* RGB: 149, 165, 166 */
--color-text-disabled: #bdc3c7;     /* RGB: 189, 195, 199 */

/* ФОНЫ */
--color-bg-primary: #ffffff;        /* Основной фон (белый) */
--color-bg-secondary: #f8f9fa;      /* Вторичный фон (светло-серый) */
--color-bg-tertiary: #ecf0f1;       /* Третичный фон (средне-серый) */
--color-bg-dark: #34495e;           /* Тёмный фон (для модальных окон) */

/* ГРАНИЦЫ */
--color-border-light: #ecf0f1;      /* Светлая граница */
--color-border-default: #bdc3c7;    /* Обычная граница */
--color-border-dark: #95a5a6;       /* Тёмная граница */

/* ТЕНИ */
--color-shadow: rgba(0, 0, 0, 0.1); /* Обычная тень */
--color-shadow-dark: rgba(0, 0, 0, 0.2);  /* Тёмная тень */
```

---

## 📚 ТИПОГРАФИЯ (ШРИФТЫ)

### **Основной шрифт (Body Text)**

```css
	/* System Font Stack - быстрый, нативный */
	--font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", 
	                    Roboto, "Helvetica Neue", Arial, sans-serif;
	
	/* Запасной вариант с Google Fonts */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
	--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### **Моноширинный шрифт (Code, Numbers)**

```css
--font-family-mono: 'Berkeley Mono', 'JetBrains Mono', 'Courier New', monospace;

@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
--font-family-mono: 'JetBrains Mono', monospace;
```

### **Размеры шрифтов (Font Sizes)**

```css
/* XS - для маленьких меток */
--font-size-xs: 11px;               /* 0.688rem */
--line-height-xs: 1.4;

/* SM - для маленького текста */
--font-size-sm: 12px;               /* 0.75rem */
--line-height-sm: 1.5;

/* BASE - основной размер текста */
--font-size-base: 14px;             /* 0.875rem */
--line-height-base: 1.5;

/* MD - средний размер */
--font-size-md: 14px;               /* 0.875rem */
--line-height-md: 1.5;

/* LG - большой текст */
--font-size-lg: 16px;               /* 1rem */
--line-height-lg: 1.6;

/* XL - для заголовков */
--font-size-xl: 18px;               /* 1.125rem */
--line-height-xl: 1.3;

/* 2XL - для больших заголовков */
--font-size-2xl: 20px;              /* 1.25rem */
--line-height-2xl: 1.3;

/* 3XL - для страничных заголовков */
--font-size-3xl: 24px;              /* 1.5rem */
--line-height-3xl: 1.2;

/* 4XL - для главных заголовков */
--font-size-4xl: 30px;              /* 1.875rem */
--line-height-4xl: 1.2;
```

### **Толщина шрифтов (Font Weights)**

```css
--font-weight-normal: 400;          /* Обычный текст */
--font-weight-medium: 500;          /* Чуть жирнее */
--font-weight-semibold: 600;        /* Полужирный */
--font-weight-bold: 700;            /* Жирный */

/* Примеры использования:
   400 - основной текст, описания
   500 - заголовки в таблицах, метки
   600 - заголовки компонентов, кнопки
   700 - главные заголовки страниц
*/
```

### **Примеры комбинаций шрифтов**

```css
/* Заголовок уровня 1 (главный заголовок) */
.h1 {
  font-family: var(--font-family-base);
  font-size: var(--font-size-4xl);      /* 30px */
  font-weight: var(--font-weight-bold);  /* 700 */
  line-height: 1.2;
  letter-spacing: -0.01em;              /* Плотнее */
  color: var(--color-text-primary);
}

/* Заголовок уровня 2 (раздел) */
.h2 {
  font-family: var(--font-family-base);
  font-size: var(--font-size-3xl);      /* 24px */
  font-weight: var(--font-weight-bold);  /* 700 */
  line-height: 1.2;
  color: var(--color-text-primary);
}

/* Заголовок уровня 3 (подраздел) */
.h3 {
  font-family: var(--font-family-base);
  font-size: var(--font-size-2xl);      /* 20px */
  font-weight: var(--font-weight-semibold); /* 600 */
  line-height: 1.3;
  color: var(--color-text-primary);
}

/* Основной текст */
.body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);     /* 14px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: 1.5;
  color: var(--color-text-primary);
}

/* Маленький текст */
.caption {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);       /* 12px */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: 1.4;
  color: var(--color-text-secondary);
}

/* Код / Числа */
.code {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);       /* 12px */
  font-weight: var(--font-weight-normal); /* 400 */
  letter-spacing: 0.01em;
  color: var(--color-text-primary);
}

/* Коэффициент (большой и выделенный) */
.coefficient {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-lg);       /* 16px */
  font-weight: var(--font-weight-bold);  /* 700 */
  color: var(--color-info);
}
```

---

## 🔲 ИНТЕРВАЛЫ И РАССТОЯНИЯ (Spacing)

```css
--space-0: 0;
--space-1: 1px;
--space-2: 2px;
--space-4: 4px;
--space-6: 6px;
--space-8: 8px;
--space-10: 10px;
--space-12: 12px;
--space-16: 16px;
--space-20: 20px;
--space-24: 24px;
--space-32: 32px;
--space-40: 40px;
--space-48: 48px;
--space-56: 56px;
--space-64: 64px;

/* Примеры использования:
   padding: var(--space-16);           /* 16px внутри */
   margin-bottom: var(--space-20);     /* 20px снизу */
   gap: var(--space-12);               /* 12px между элементами */
*/
```

---

## 🎯 РАДИУСЫ УГЛОВ (Border Radius)

```css
--radius-sm: 4px;     /* Маленький радиус (для иконок кнопок) */
--radius-base: 6px;   /* Основной радиус (для кнопок, карточек) */
--radius-md: 8px;     /* Средний радиус (для более крупных элементов) */
--radius-lg: 12px;    /* Большой радиус (для модальных окон) */
--radius-full: 9999px; /* Полностью скруглённые (для аватаров, пилюль) */

/* Примеры:
   border-radius: var(--radius-base);  /* 6px для кнопок */
   border-radius: var(--radius-lg);    /* 12px для модальных окон */
*/
```

---

## 💫 ТЕНИ (Shadows)

```css
/* XS - едва заметная тень */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);

/* SM - маленькая тень (для карточек) */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 
             0 1px 2px rgba(0, 0, 0, 0.06);

/* BASE - обычная тень (по умолчанию) */
--shadow-base: 0 4px 6px rgba(0, 0, 0, 0.1);

/* MD - средняя тень (для модальных окон) */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 
             0 2px 4px rgba(0, 0, 0, 0.04);

/* LG - большая тень (для выпадающих меню) */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 
             0 4px 6px rgba(0, 0, 0, 0.05);

/* XL - очень большая тень (для floating элементов) */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 
             0 10px 10px rgba(0, 0, 0, 0.04);

/* Примеры использования:
   box-shadow: var(--shadow-sm);
   box-shadow: var(--shadow-lg);
*/
```

---

## 🎬 АНИМАЦИИ И ПЕРЕХОДЫ (Animations)

```css
/* ДЛИТЕЛЬНОСТЬ */
--duration-fast: 150ms;   /* Быстрые переходы (hover) */
--duration-normal: 250ms; /* Обычные переходы (open/close) */
--duration-slow: 350ms;   /* Медленные переходы (important) */

/* ТИПЫ УСКОРЕНИЯ */
--ease-linear: linear;
--ease-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-standard: cubic-bezier(0.16, 1, 0.3, 1); /* Рекомендуемая */

/* Примеры использования:
   transition: all var(--duration-normal) var(--ease-standard);
   transition: background-color var(--duration-fast) var(--ease-ease-out);
*/

/* Стандартные анимации */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { 
    transform: translateY(-10px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 🔌 ПОЛНЫЙ CSS ПЕРЕМЕННЫХ (Root)

```css
:root {
  /* === ЦВЕТА: PRIMARY === */
  --color-primary: #27ae60;
  --color-primary-light: #2ecc71;
  --color-primary-dark: #229954;
  --color-primary-very-dark: #1e8449;

  /* === ЦВЕТА: SECONDARY === */
  --color-info: #3498db;
  --color-info-light: #5dade2;
  --color-info-dark: #2980b9;

  /* === ЦВЕТА: STATUS === */
  --color-success: #27ae60;
  --color-success-bg: #d5f4e6;
  --color-success-border: #a3e4d7;

  --color-error: #e74c3c;
  --color-error-bg: #fadbd8;
  --color-error-border: #f5b7b1;

  --color-warning: #f39c12;
  --color-warning-bg: #fef5e7;
  --color-warning-border: #fad7a0;

  --color-info-bg: #d6eaf8;
  --color-info-border: #aed6f1;

  --color-live: #c0392b;
  --color-live-bg: #fadbd8;
  --color-live-pulse: #e74c3c;

  /* === ЦВЕТА: TEXT === */
  --color-text-primary: #2c3e50;
  --color-text-secondary: #7f8c8d;
  --color-text-tertiary: #95a5a6;
  --color-text-disabled: #bdc3c7;

  /* === ЦВЕТА: BACKGROUNDS === */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #ecf0f1;
  --color-bg-dark: #34495e;

  /* === ЦВЕТА: BORDERS === */
  --color-border-light: #ecf0f1;
  --color-border-default: #bdc3c7;
  --color-border-dark: #95a5a6;

  /* === ЦВЕТА: SHADOWS === */
  --color-shadow: rgba(0, 0, 0, 0.1);
  --color-shadow-dark: rgba(0, 0, 0, 0.2);

  /* === ШРИФТЫ === */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                      Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: "JetBrains Mono", "Courier New", monospace;

  /* === РАЗМЕРЫ ШРИФТОВ === */
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-size-4xl: 30px;

  /* === ТОЛЩИНА ШРИФТОВ === */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* === ИНТЕРВАЛЫ === */
  --space-0: 0;
  --space-1: 1px;
  --space-2: 2px;
  --space-4: 4px;
  --space-6: 6px;
  --space-8: 8px;
  --space-10: 10px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;
  --space-56: 56px;
  --space-64: 64px;

  /* === РАДИУСЫ === */
  --radius-sm: 4px;
  --radius-base: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* === ТЕНИ === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 
               0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-base: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 
               0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 
               0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 
               0 10px 10px rgba(0, 0, 0, 0.04);

  /* === АНИМАЦИИ === */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --ease-linear: linear;
  --ease-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);
}

/* DARK MODE (опционально) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #ecf0f1;
    --color-text-secondary: #bdc3c7;
    --color-bg-primary: #2c3e50;
    --color-bg-secondary: #34495e;
    --color-bg-tertiary: #1a252f;
    --color-border-default: #444;
  }
}
```

---

## 📋 ГЛОБАЛЬНЫЕ СТИЛИ

```css
/**
 * Глобальные стили для всего приложения LOOSELINE
 */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  margin: 0 0 var(--space-16) 0;
}

a {
  color: var(--color-info);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-standard);
}

a:hover {
  color: var(--color-info-dark);
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: inherit;
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

/* Фокус для keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## 🎨 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### **Кнопка "Сделать ставку"**

```css
.btn-primary {
  padding: var(--space-12) var(--space-20);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  transition: all var(--duration-fast) var(--ease-standard);
}

.btn-primary:hover {
  background-color: var(--color-primary-light);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  background-color: var(--color-primary-dark);
}
```

### **Карточка события**

```css
.event-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-20);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-standard);
}

.event-card:hover {
  border-color: var(--color-info);
  box-shadow: var(--shadow-lg);
}
```

### **Live статус**

```css
.badge-live {
  background-color: var(--color-live);
  color: white;
  padding: var(--space-6) var(--space-12);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  animation: pulse var(--duration-slow) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### **Таблица коэффициентов**

```css
.odds-table {
  width: 100%;
  border-collapse: collapse;
}

.odds-table thead {
  background-color: var(--color-bg-secondary);
  border-bottom: 2px solid var(--color-border-default);
}

.odds-table th {
  padding: var(--space-12);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.odds-table td {
  padding: var(--space-12);
  border-bottom: 1px solid var(--color-border-light);
}

.coefficient {
  color: var(--color-info);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}
```

---

## 📱 АДАПТИВНЫЕ ТОЧКИ РАЗРЫВА (Breakpoints)

```css
/* Mobile First Approach */

/* Маленькие экраны (по умолчанию) */
/* 320px - 767px */

/* Планшеты */
@media (min-width: 768px) {
  :root {
    --font-size-base: 15px;
  }
}

/* Большие экраны */
@media (min-width: 1024px) {
  :root {
    --font-size-base: 16px;
  }
}

/* Очень большие экраны */
@media (min-width: 1280px) {
  :root {
    --font-size-base: 16px;
  }
}

/* 4K и больше */
@media (min-width: 1920px) {
  :root {
    --space-16: 20px;
    --space-20: 24px;
    --font-size-base: 17px;
  }
}
```

---

## 📊 ЦВЕТОВАЯ ПАЛИТРА: ШПАРГАЛКА

```
🟢 ЗЕЛЁНЫЙ (Primary/Success)
   #27ae60 — основной
   #2ecc71 — светлый
   #229954 — тёмный
   Использование: кнопки, успешные операции

🔵 СИНИЙ (Info)
   #3498db — основной
   #5dade2 — светлый
   #2980b9 — тёмный
   Использование: коэффициенты, информация, ссылки

🔴 КРАСНЫЙ (Error/Live)
   #e74c3c — ошибка (светлая)
   #c0392b — live (тёмная)
   Использование: ошибки, live события

🟡 ЖЁЛТЫЙ (Warning)
   #f39c12 — основной
   Использование: предупреждения, ограничения

⚫ ЧЁРНЫЙ/БЕЛЫЙ (Text/Background)
   #2c3e50 — основной текст
   #ffffff — основной фон
   #f8f9fa — вторичный фон
   Использование: базовые элементы
```