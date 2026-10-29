@echo off
chcp 65001 > nul
echo ====================================================
echo   Локальная сборка Android APK (Считайка)
echo ====================================================
echo.
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot
set ANDROID_HOME=C:\Android
set PATH=%JAVA_HOME%\bin;C:\Android\platform-tools;%PATH%
set GRADLE_OPTS=-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8
cd /d "%~dp0\android"
call gradlew.bat assembleRelease
cd /d "%~dp0"
copy /y android\app\build\outputs\apk\release\app-release.apk Schitayka_v1.0.6.apk
echo.
echo ====================================================
echo   Сборка завершена! Файл: Schitayka_v1.0.6.apk
echo ====================================================
pause
