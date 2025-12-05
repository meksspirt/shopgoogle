# Скрипт для копіювання OG зображення психологічного посібника
# Виконайте цей скрипт в PowerShell

$sourcePath = "C:\Users\Mlyub\.gemini\antigravity\brain\a0e28d8c-91ee-435c-b5c8-d7b6ed627159\psychology_book_og_image_1764946403800.png"
$destinationPath = ".\public\og-image.png"

if (Test-Path $sourcePath) {
    Copy-Item $sourcePath -Destination $destinationPath -Force
    Write-Host "✅ OG зображення успішно скопійовано у public/og-image.png" -ForegroundColor Green
    Write-Host "Зображення оптимізоване для психологічного контенту" -ForegroundColor Cyan
}
else {
    Write-Host "❌ Вихідний файл не знайдено: $sourcePath" -ForegroundColor Red
    Write-Host "Будь ласка, знайдіть файл psychology_book_og_image_*.png і скопіюйте його вручну в public/og-image.png" -ForegroundColor Yellow
}

# Перевірка, чи файл скопійовано
if (Test-Path $destinationPath) {
    $fileInfo = Get-Item $destinationPath
    Write-Host ""
    Write-Host "📊 Інформація про файл:" -ForegroundColor Green
    Write-Host "  Розмір: $($fileInfo.Length) байт" -ForegroundColor White
    Write-Host "  Шлях: $($fileInfo.FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Готово! Тепер ви можете запустити проект:" -ForegroundColor Green
    Write-Host "  npm run dev" -ForegroundColor Cyan
}
