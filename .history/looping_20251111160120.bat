@echo off
echo Starting all services...

:: === START WAMP AS ADMINISTRATOR ===
echo Starting WAMP Server as Administrator...
set "WAMP_PATH=C:\wamp64\wampmanager.exe"
powershell -Command "Start-Process '%WAMP_PATH%' -Verb RunAs"
timeout /t 5 /nobreak >nul

:: === START LARAVEL ===
echo Starting Laravel server...
cd looping-server-laravel
start "Laravel Server" php artisan serve
cd ..


:: === START SPRING BOOT ===
::echo Starting Spring Boot server...
::cd looping-server-spring
::start "Spring Boot" mvnw.cmd spring-boot:run -DskipTests
::cd ..

:: === START REACT ===
echo Starting React dev server...
cd looping-client
start "React Server" npm run dev
cd ..

echo.
echo ✅ All services started!
pause
