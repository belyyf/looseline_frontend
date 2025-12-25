<https://github.com/skywaJlker192/looseline1>

#### **Что сделано**

**1\. Метод 3: createCoupon(betIds, totalAmount)**

-  Создаёт купон из нескольких ставок

-  Генерирует уникальный код купона (формат: CPN20251215_ABC123)

-  Возвращает couponId, couponCode, totalBetAmount, numberOfBets

-  Валидация: проверяет, что betIds -- непустой массив, а totalAmount -- положительное число

**2\. Метод 4: updateBetStatus(betId, newStatus, reason)**

-  Обновляет статус ставки (open, cancelled, resolved)

-  При отмене возвращает информацию о возврате (refundAmount, transactionType)

-  Валидация статусов и обязательных параметров

**3\. Метод 5: calculatePotentialWinCoupon(amount, coefficients\[\])**

-  Расчёт потенциального выигрыша для купона (экспресса)

-  Общий коэффициент = произведение всех коэффициентов

-  Автоматически фильтрует невалидные коэффициенты (\< 1.01)

-  Возвращает totalCoefficient, potentialWin, profit



<img width="1565" height="672" alt="image" src="https://github.com/user-attachments/assets/064826a5-c436-43d8-8406-837111d00c05" />


**Скрин 1 -- Страница размещения ставок (список событий + купон)**

<img width="1695" height="605" alt="image" src="https://github.com/user-attachments/assets/e55f91c8-61db-41ae-a0bd-059029e3eea3" />

**Скрин 2 -- Заполненный купон с расчётом потенциального выигрыша**

<img width="777" height="490" alt="image" src="https://github.com/user-attachments/assets/81402ee7-2fba-4013-9556-66583b89cae0" />


**Скрин 3 -- Уведомление «Ставка принята» с номером ставки**

## Тестирование

Все реализованные методы покрыты тестами:

-  `betService.test.js` -- юнит-тесты для `calculatePotentialWin` и `placeBet`

-  `BetFlow.test.jsx` -- интеграционные UI-тесты для полного флоу размещения ставки

<img width="760" height="251" alt="image" src="https://github.com/user-attachments/assets/396f7c2b-abcf-4fd4-8079-6c881d835621" />

**Все  успешно прошли**

# Таблица методов модуля ставок и расчётов

| № | Название метода                                       | Назначение                                                                                                                                                                                                                                                                          | Статус                     |
|---|-------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------|
| 1 | `calculatePotentialWin(amount, coefficient)`          | Рассчитывает потенциальный выигрыш и прибыль для одиночной ставки. Формула: `payout = amount * coefficient`, `profit = payout - amount`. Используется в реальном времени при вводе суммы ставки для отображения в блоке "Потенциальный выигрыш".                                    | Реализован (frontend)      |
| 2 | `placeBet(payload)`                                   | Размещает ставку пользователя. Принимает объект с `eventId`, `outcome`, `coefficient`, `amount`. Имитирует сетевой запрос с задержкой 400ms и возвращает объект с `betId`. В реальном приложении должен вызывать backend API `POST /api/bets/place`.                                | Реализован (frontend mock) |
| 3 | `createCoupon(betIds, totalAmount)`                   | Создаёт купон (экспресс) из нескольких ставок. Генерирует уникальный код купона (формат: `CPN20251215_ABC123`). Возвращает `couponId`, `couponCode`, `totalBetAmount`, `numberOfBets`. В реальном приложении должен вызывать backend API `POST /api/coupons/create`.                | Реализован (frontend mock) |
| 4 | `updateBetStatus(betId, newStatus, reason)`           | Обновляет статус ставки (open -> cancelled/resolved). При отмене возвращает информацию о возврате денег (`refundAmount`, `transactionType: 'bet_cancelled'`). В реальном приложении должен вызывать backend API `PATCH /api/bets/:betId/status`.                                    | Реализован (frontend mock) |
| 5 | `calculatePotentialWinCoupon(amount, coefficients[])` | Расчёт потенциального выигрыша для купона (экспресса). Принимает массив коэффициентов, вычисляет общий коэффициент как произведение всех коэффициентов, затем рассчитывает `potential_win = amount * total_coefficient`. Автоматически фильтрует невалидные коэффициенты (\< 1.01). | Реализован (frontend)      |

---

## Детали реализации

### Метод 1: `calculatePotentialWin`

**Файл:** `src/bets/services/betService.js`\
**Использование:** Вызывается автоматически через `useMemo` в `BetSlipContext` при изменении суммы или коэффициента.\
**Пример:**

```javascript
const { payout, profit } = calculatePotentialWin(100, 1.85)
// payout = 185.00, profit = 85.00
```

### Метод 2: `placeBet`

**Файл:** `src/bets/services/betService.js`\
**Использование:** Вызывается при клике на кнопку "Подтвердить" в модальном окне подтверждения ставки (`BetConfirmationModal`).\
**Пример:**

```javascript
const result = await placeBet({
  eventId: '1',
  outcome: 'HOME',
  coefficient: 1.85,
  amount: 100
})
// result = { betId: 'ABC123XYZ' }
```

### Метод 3: `createCoupon`

**Файл:** `src/bets/services/betService.js`\
**Использование:** Вызывается для создания купона из нескольких уже размещённых ставок.\
**Пример:**

```javascript
const result = await createCoupon(['bet1', 'bet2', 'bet3'], 150)
// result = {
//   couponId: 'ABC123',
//   couponCode: 'CPN20251215_XYZ789',
//   totalBetAmount: 150,
//   numberOfBets: 3
// }
```

### Метод 4: `updateBetStatus`

**Файл:** `src/bets/services/betService.js`\
**Использование:** Вызывается при отмене ставки пользователем или при отмене события администратором.\
**Пример:**

```javascript
// Отмена ставки
const result = await updateBetStatus('bet123', 'cancelled', 'Передумал')
// result = {
//   success: true,
//   betId: 'bet123',
//   status: 'cancelled',
//   refundAmount: null, // На backend будет реальная сумма
//   transactionType: 'bet_cancelled'
// }

// Повторное открытие ставки
await updateBetStatus('bet123', 'open', 'Ставка открыта заново')
```

### Метод 5: `calculatePotentialWinCoupon`

**Файл:** `src/bets/services/betService.js`\
**Использование:** Вызывается для расчёта потенциального выигрыша купона перед его созданием.\
**Пример:**

```javascript
const result = calculatePotentialWinCoupon(150, [1.85, 2.1, 3.4])
// result = {
//   betAmount: 150,
//   coefficients: [1.85, 2.1, 3.4],
//   totalCoefficient: 13.21,
//   potentialWin: 1981.35,
//   profit: 1831.35
// }
```

---

## Тестирование

Все реализованные методы покрыты тестами:

-  `betService.test.js` -- юнит-тесты для всех 5 методов:

-  `calculatePotentialWin` -- 3 теста (валидные данные, граничные случаи, NaN)

-  `placeBet` -- 1 тест (возврат betId, проверка задержки)

-  `calculatePotentialWinCoupon` -- 4 теста (расчёт для 3 ставок, пустой массив, фильтрация невалидных коэффициентов, одна ставка)

-  `createCoupon` -- 4 теста (создание купона, валидация пустого массива, валидация суммы, уникальность кодов)

-  `updateBetStatus` -- 5 тестов (отмена, открытие, невалидный статус, отсутствие betId, без reason)

-  `BetFlow.test.jsx` -- интеграционные UI-тесты для полного флоу размещения ставки



### **1\. Какие 3 теста я написал**

#### Тест 1: calculatePotentialWin (бизнес‑логика расчёта ставки)

-  **Что проверяет**: при ставке 100 и коэффициенте 1.85 функция должна вернуть выплату 185 и прибыль 85.

-  **Почему важен**: это базовая формула из ТЗ по модулю ставок; если тут ошибка – всё приложение врёт пользователю по выигрышу.

-  **Как реализован**: юнит‑тест в betService.test.js:

-  вход: amount = 100, coefficient = 1.85

-  ожидаем: \{ payout: 185, profit: 85 }

#### Тест 2: calculatePotentialWinCoupon (экспресс‑купоны)

-  **Что проверяет**: расчёт экспресса из 3 ставок: 1.85, 2.10, 3.40 и суммы 150.

-  **Почему важен**: это отдельный бизнес‑кейс из «Модуля ставок и расчётов» – экспресс‑купоны. Нужно убедиться, что общий коэффициент считается как произведение и правильно считаются выплата и прибыль.

-  **Как реализован**:

-  вход: amount = 150, coeffs = \[1.85, 2.1, 3.4\]

-  ожидаем:

-  totalCoefficient ≈ 13.21

-  potentialWin ≈ 1981.35

-  profit ≈ 1831.35

-  в массиве коэффициентов нет мусора (фильтрация \< 1.01).

#### Тест 3: UI‑флоу «разместить ставку» (BetFlow.test.jsx)

-  **Что проверяет**:

1. Пользователь выбирает матч Man Utd vs Liverpool, исход П1, вводит сумму 100.

2. В блоке «Потенциальный выигрыш» появляются правильные числа (185.00 ₽ и 85.00 ₽).

3. При клике по кнопке «Подтвердить ставку» открывается модалка и вызывается placeBet.

-  **Почему важен**: это end‑to‑end слой для фронта; тест защищает от поломок связки «контекст -> компоненты -> сервис».

-  **Как реализован**:

-  рендерится BetsPage;

-  клики по кнопкам исходов и ввод суммы через Testing Library;

-  проверка data-testid="payout-display" и "profit-display";

-  мок betService.placeBet + проверка вызова.

---

### **2\. Какие были проблемы и как я их решил**

#### Проблема 1: Некорректный расчёт / NaN в calculatePotentialWin

-  **Симптом**: при невалидных числах (NaN, Infinity, 0) тесты начинали падать или возвращалось отрицательное значение.

-  **Решение**:

-  ввёл «безопасные» значения:

-  safeAmount = Number.isFinite(amount) ? amount : 0

-  safeCoeff = Number.isFinite(coefficient) ? coefficient : 0

-  обрезка отрицательных результатов: payout > 0 ? payout : 0, profit > 0 ? profit : 0.

-  **Итог**: функция стала устойчива к любым входам, тест is resilient to NaN / invalid numbers проходит.

#### Проблема 2: UI‑тест не находил нужные кнопки (несколько «Подтвердить»)

-  **Симптом**: Testing Library ругался на getByRole('button', \{ name: /Подтвердить/i }): находилось две кнопки -- в купоне и в модалке.

-  **Решение**:

-  добавил data-testid:

-  на кнопку исхода: data-testid="outcome-HOME" и т.п.

-  на кнопку подтверждения в модалке: data-testid="confirm-bet-button".

-  в тесте стал использовать getByTestId('outcome-HOME') и getByTestId('confirm-bet-button').

-  **Итог**: тест однозначно кликает по нужным элементам, ошибка «Found multiple elements…» исчезла.

#### Проблема 3: placeBet и таймер в тестах

-  **Симптом**: нужно проверить, что функция имитирует сетевую задержку, но при обычном вызове тест идёт слишком быстро и setTimeout не отлавливается.

-  **Решение**:

-  использовал vi.spyOn(global, 'setTimeout') в тесте;

-  дождался промиса await placeBet(payload) и затем проверил, что setTimeout был вызван;

-  в конце делаю spy.mockRestore(), чтобы не ломать другие тесты.

-  **Итог**: тест фиксирует, что placeBet действительно ведёт себя как «сетевой» вызов.



Таблицы в БД

<img width="1863" height="894" alt="image" src="https://github.com/user-attachments/assets/ea1fe21b-2d97-4bac-95ba-dd2fd1239049" />



Всё работает с бэкендом

<img width="808" height="600" alt="image" src="https://github.com/user-attachments/assets/39e3dc04-7f6c-438d-91bc-540a05304254" />
