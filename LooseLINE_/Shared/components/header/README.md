# LOOSELINE Shared Header Component

Единый переиспользуемый компонент Header для всех модулей LOOSELINE.

## Структура

```
Shared/
└── components/
    └── header/
        ├── header.css   # Стили компонента
        ├── header.js    # Vanilla JS реализация
        └── README.md    # Эта документация
```

## Использование

### Vanilla JS / HTML модули (Wallet, Sports)

1. Подключите CSS и JS файлы:

```html
<head>
    <!-- Подключить шрифты -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Shared Header styles -->
    <link rel="stylesheet" href="/shared/components/header/header.css">
</head>
<body>
    <!-- Контейнер для Header -->
    <div id="ll-header"></div>

    <!-- Подключить header.js перед вашим скриптом -->
    <script src="/shared/components/header/header.js"></script>
    <script src="app.js"></script>
</body>
```

2. Инициализируйте компонент:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await LooselineHeader.init({
        activePage: 'wallet',  // 'sports' | 'wallet' | 'dashboard'
        user: currentUser,      // Объект пользователя (опционально)
        onDeposit: () => openModal('depositModal'),
        onWithdraw: () => openModal('withdrawModal'),
        onLogout: handleLogout  // Ваша функция выхода
    });
});
```

### React/Next.js модули (Auth)

Для React модулей используйте существующий компонент `Header.tsx`:

```tsx
import { Header } from '@/components/Header';

export default function Page() {
    return (
        <Header 
            user={user} 
            loading={loading}
            activePage="dashboard"
        />
    );
}
```

## API

### `LooselineHeader.init(options)`

Инициализирует Header компонент.

**Options:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `containerId` | string | `'ll-header'` | ID контейнера для рендеринга |
| `activePage` | string | auto-detect | Активная страница: 'sports', 'wallet', 'dashboard' |
| `showBalance` | boolean | `true` | Показывать ли баланс |
| `user` | object | null | Данные пользователя |
| `onDeposit` | function | null | Callback при нажатии "Пополнить" |
| `onWithdraw` | function | null | Callback при нажатии "Вывести" |
| `onLogout` | function | null | Callback при выходе |
| `balanceApiUrl` | string | '/api/wallet/balance' | URL API баланса |
| `sessionApiUrl` | string | '/api/auth/get-session' | URL API сессии |

### `LooselineHeader.setBalance(balance)`

Обновляет отображаемый баланс.

```javascript
LooselineHeader.setBalance({
    total: 5000.00,
    available: 4750.00,
    inBets: 250.00
});
```

### `LooselineHeader.setUser(user)`

Обновляет данные пользователя.

```javascript
LooselineHeader.setUser({
    name: 'John Doe',
    email: 'john@example.com'
});
```

### `LooselineHeader.closeDropdown()`

Закрывает выпадающее меню баланса.

## Стилизация

Все CSS классы имеют префикс `ll-` для избежания конфликтов:

- `.ll-header` - основной контейнер
- `.ll-header-nav` - навигация
- `.ll-balance-dropdown` - выпадающее меню баланса
- `.ll-user-section` - секция пользователя

### Кастомизация

Переопределите CSS переменные для кастомизации:

```css
.ll-header {
    --ll-primary-color: #27ae60;
    --ll-bg-color: rgba(15, 23, 42, 0.95);
    --ll-text-color: #ffffff;
}
```

## Nginx конфигурация

Добавьте в ваш nginx.conf:

```nginx
# Serve shared components
location /shared/ {
    alias /app/Shared/;
    expires 1h;
    add_header Cache-Control "public, max-age=3600";
}
```
