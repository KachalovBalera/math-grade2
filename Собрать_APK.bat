@echo off
chcp 65001 > nul
echo ====================================================
echo   Сборка автономного Android APK (Математика — 2 класс)
echo ====================================================
echo.
set EAS_NO_VCS=1
cd /d "%~dp0"
npx eas-cli build -p android --profile preview
pause
