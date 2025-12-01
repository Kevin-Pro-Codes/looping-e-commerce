@echo off
echo Starting all services...

REM === START WAMP ===
echo Starting WAMP Server...
REM Adjust the path below to your actual WAMP installation directory.
REM Default path for WAMP64:
start "" "C:\wamp64\wampmanager.exe"
timeout /t 5 /nobreak >nul

REM === START LARAVEL ===
echo Starting Laravel server...
cd finito-server-laravel
start "Laravel Server" php artisan serve
cd ..

REM === START SPRING BOOT ===
echo Starting Spring Boot server...
cd finito-server-spring
start "Spring Boot" mvnw.cmd spring-boot:run -DskipTests
cd ..

REM === START REACT ===
echo Starting React dev server...
cd finito-client
start "React Server" npm run dev
cd ..

echo.
echo ✅ All services started!
pause
