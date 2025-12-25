# Мониторинг загрузки PostgreSQL в реальном времени

Write-Host "=== МОНИТОРИНГ ЗАГРУЗКИ POSTGRESQL ===" -ForegroundColor Cyan
Write-Host "Нажми Ctrl+C чтобы остановить`n" -ForegroundColor Yellow

$expectedSize = 361  # МБ
$checkInterval = 2   # секунды

while ($true) {
    Clear-Host
    Write-Host "=== МОНИТОРИНГ ЗАГРУЗКИ ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Ищем файл в разных местах
    $downloadPaths = @(
        "$env:TEMP\chocolatey\*postgresql*.exe",
        "$env:TEMP\*postgresql*.exe",
        "$env:USERPROFILE\AppData\Local\Temp\*postgresql*.exe",
        "C:\ProgramData\chocolatey\lib-bad\postgresql15\tools\*postgresql*.exe",
        "C:\ProgramData\chocolatey\lib\postgresql15\tools\*postgresql*.exe"
    )
    
    $found = $false
    foreach ($path in $downloadPaths) {
        $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
        if ($files) {
            foreach ($file in $files) {
                $sizeMB = [math]::Round($file.Length / 1MB, 2)
                $percent = [math]::Round(($file.Length / ($expectedSize * 1MB)) * 100, 1)
                $age = (Get-Date) - $file.LastWriteTime
                
                Write-Host "✓ Файл найден!" -ForegroundColor Green
                Write-Host "  Путь: $($file.FullName)" -ForegroundColor White
                Write-Host "  Размер: $sizeMB МБ / $expectedSize МБ ($percent%)" -ForegroundColor Cyan
                Write-Host "  Обновлён: $($age.TotalSeconds) секунд назад" -ForegroundColor Yellow
                
                if ($age.TotalSeconds -lt 10) {
                    Write-Host "  ⬇ СКАЧИВАЕТСЯ..." -ForegroundColor Green
                } elseif ($age.TotalSeconds -gt 60) {
                    Write-Host "  ⚠ ЗАВИСЛО (не обновлялось больше минуты)" -ForegroundColor Red
                } else {
                    Write-Host "  ⏸ ПАУЗА" -ForegroundColor Yellow
                }
                
                $found = $true
            }
        }
    }
    
    if (-not $found) {
        Write-Host "✗ Файл не найден" -ForegroundColor Red
        Write-Host "  Возможно загрузка ещё не началась или идёт в другое место" -ForegroundColor Yellow
    }
    
    # Проверяем процессы Chocolatey
    Write-Host ""
    Write-Host "Процессы Chocolatey:" -ForegroundColor Cyan
    $choco = Get-Process -Name "choco" -ErrorAction SilentlyContinue
    if ($choco) {
        foreach ($p in $choco) {
            $cpu = [math]::Round($p.CPU, 2)
            $mem = [math]::Round($p.WorkingSet / 1MB, 2)
            Write-Host "  PID $($p.Id): CPU=$cpu, RAM=$mem МБ" -ForegroundColor White
        }
    } else {
        Write-Host "  ✗ Процессы не найдены" -ForegroundColor Red
    }
    
    # Проверяем сетевую активность
    Write-Host ""
    Write-Host "Сетевая активность:" -ForegroundColor Cyan
    $connections = Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue | 
        Where-Object {$_.RemoteAddress -notlike "127.*" -and $_.RemoteAddress -notlike "::1"} |
        Measure-Object
    Write-Host "  Активных соединений: $($connections.Count)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Обновление через $checkInterval сек... (Ctrl+C для выхода)" -ForegroundColor Gray
    Start-Sleep -Seconds $checkInterval
}

