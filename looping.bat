@echo off
echo Starting all services...

:: === START WAMP AS ADMINISTRATOR ===
echo Starting WAMP Server as Administrator...
set "WAMP_PATH=C:\wamp64\wampmanager.exe"
powershell -Command "Start-Process '%WAMP_PATH%' -Verb RunAs"
timeout /t 5 /nobreak >nul

:: === START MONGOSH ===
echo Starting Mongo Shell...
cd /d "C:\Users\Kevin\AppData\Local\Programs\mongosh\bin"
start "MongoDB Shell" mongosh.exe "mongodb://admin:6bhcct53@127.0.0.1:27017/looping?authSource=admin"

:: === START LARAVEL ===
echo Starting Laravel server...
cd /d "%~dp0looping-server"
start "Laravel Server" php artisan serve

:: === START REACT ===
echo Starting React dev server...
cd /d "%~dp0looping-client"
start "React Server" npm run dev

echo.
echo ✅ All services started!
pause