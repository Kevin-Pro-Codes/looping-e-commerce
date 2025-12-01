@echo off
echo Starting all services...

REM Start Laravel
echo Starting Laravel server...
cd finito-server-laravel
start "Laravel Server" php artisan serve
cd ..

REM Start Spring Boot
echo Starting Spring Boot server...
cd finito-server-spring
start "Spring Boot" .\mvnw.cmd spring-boot:run -DskipTests
cd ..

REM Start React
echo Starting React dev server...
cd finito-client
start "React Server" npm run dev
cd ..

echo All services started!
pause