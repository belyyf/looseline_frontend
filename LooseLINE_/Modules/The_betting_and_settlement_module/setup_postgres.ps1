# Автоматическая установка и настройка PostgreSQL для looseline
# Запусти этот скрипт от имени администратора: правый клик -> "Запустить с PowerShell"

Write-Host "=== Установка PostgreSQL для looseline ===" -ForegroundColor Green

# Проверка прав администратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ОШИБКА: Скрипт нужно запустить от имени администратора!" -ForegroundColor Red
    Write-Host "Правый клик по файлу -> 'Запустить с PowerShell'" -ForegroundColor Yellow
    pause
    exit 1
}

# URL для скачивания PostgreSQL (последняя версия)
$postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

Write-Host "`n1. Скачивание установщика PostgreSQL..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $postgresUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "   ✓ Установщик скачан" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Ошибка скачивания: $_" -ForegroundColor Red
    Write-Host "`n   Скачай вручную: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`n2. Запуск установщика..." -ForegroundColor Cyan
Write-Host "   ⚠ ВНИМАНИЕ: В установщике укажи:" -ForegroundColor Yellow
Write-Host "      - Порт: 5432" -ForegroundColor Yellow
Write-Host "      - Пользователь: postgres" -ForegroundColor Yellow
Write-Host "      - Пароль: postgres" -ForegroundColor Yellow
Write-Host "      - База данных: postgres (по умолчанию)" -ForegroundColor Yellow
Write-Host "`n   Нажми Enter когда установишь PostgreSQL..." -ForegroundColor Cyan
pause

Start-Process -FilePath $installerPath -Wait

Write-Host "`n3. Проверка установки PostgreSQL..." -ForegroundColor Cyan

# Проверка, установлен ли PostgreSQL
$pgPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $pgPath)) {
    Write-Host "   ✗ PostgreSQL не найден. Проверь установку вручную." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "   ✓ PostgreSQL установлен" -ForegroundColor Green

Write-Host "`n4. Создание базы данных looseline_db..." -ForegroundColor Cyan

# Создание базы данных
$createDbScript = @"
CREATE DATABASE looseline_db;
"@

try {
    & $pgPath -U postgres -c $createDbScript
    Write-Host "   ✓ База данных создана" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Возможно база уже существует или нужен пароль" -ForegroundColor Yellow
    Write-Host "   Создай базу вручную в DBeaver или выполни:" -ForegroundColor Yellow
    Write-Host "   psql -U postgres -c 'CREATE DATABASE looseline_db;'" -ForegroundColor Yellow
}

Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host "`nСледующие шаги:" -ForegroundColor Cyan
Write-Host "1. Открой DBeaver" -ForegroundColor White
Write-Host "2. Подключись к PostgreSQL:" -ForegroundColor White
Write-Host "   Host: localhost" -ForegroundColor Gray
Write-Host "   Port: 5432" -ForegroundColor Gray
Write-Host "   Database: looseline_db" -ForegroundColor Gray
Write-Host "   Username: postgres" -ForegroundColor Gray
Write-Host "   Password: postgres" -ForegroundColor Gray
Write-Host "3. Выполни SQL-скрипты:" -ForegroundColor White
Write-Host "   - init.sql (создание таблиц)" -ForegroundColor Gray
Write-Host "   - init-scripts/postgres/seed_data.sql (тестовые данные)" -ForegroundColor Gray

pause

