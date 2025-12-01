@echo off
echo Starting all services...

REM Start Laravel
echo Starting Laravel server...
cd laravel-app
start "Laravel Server" php artisan serve --port=8000

REM Start Spring Boot
echo Starting Spring Boot server...
cd ..\spring-app
start "Spring Boot" mvn spring-boot:run

REM Start React
echo Starting React dev server...
cd ..\react-app
start "React Server" npm start

echo All services started!
pause