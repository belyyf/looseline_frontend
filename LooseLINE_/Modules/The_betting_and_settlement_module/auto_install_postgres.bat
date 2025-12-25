@echo off
chcp 65001 >nul
echo ========================================
echo Автоматическая установка PostgreSQL
echo ========================================
echo.

:: Проверка прав администратора
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ОШИБКА] Нужны права администратора!
    echo Правый клик по файлу -^> "Запуск от имени администратора"
    pause
    exit /b 1
)

echo [1/4] Проверка Chocolatey...
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo       Chocolatey не найден. Устанавливаю...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorLevel% neq 0 (
        echo [ОШИБКА] Не удалось установить Chocolatey
        pause
        exit /b 1
    )
    echo       ✓ Chocolatey установлен
) else (
    echo       ✓ Chocolatey уже установлен
)

echo.
echo [2/4] Установка PostgreSQL...
choco install postgresql15 --params '/Password:postgres' -y
if %errorLevel% neq 0 (
    echo [ОШИБКА] Не удалось установить PostgreSQL
    pause
    exit /b 1
)
echo       ✓ PostgreSQL установлен

echo.
echo [3/4] Ожидание запуска службы PostgreSQL...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Создание базы данных looseline_db...
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE looseline_db;" 2>nul
if %errorLevel% equ 0 (
    echo       ✓ База данных создана
) else (
    echo       ⚠ База может уже существовать или нужен пароль
    echo       Создай базу вручную в DBeaver: CREATE DATABASE looseline_db;
)

echo.
echo ========================================
echo ГОТОВО!
echo ========================================
echo.
echo Данные для подключения в DBeaver:
echo   Host: localhost
echo   Port: 5432
echo   Database: looseline_db
echo   Username: postgres
echo   Password: postgres
echo.
echo Следующий шаг:
echo   1. Открой DBeaver
echo   2. Подключись к базе looseline_db
echo   3. Выполни файл create_all_tables.sql
echo.
pause

