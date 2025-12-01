@echo off
title Development Server - MongoDB, Laravel, React
color 0A

echo ========================================
echo    STARTING DEVELOPMENT ENVIRONMENT
echo ========================================
echo.

:: Kill any existing processes
echo [1/4] Stopping existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im php.exe 2>nul
taskkill /f /im mongod.exe 2>nul
timeout /t 2 /nobreak >nul

:: Start MongoDB
echo [2/4] Starting MongoDB...
start "MongoDB" /D "C:\Program Files\MongoDB\Server\6.0\bin\" mongod --dbpath "C:\data\db"
timeout /t 3 /nobreak >nul

:: Start Laravel Backend
echo [3/4] Starting Laravel Backend...
cd /d "C:\path\to\your\laravel\backend"
start "Laravel Backend" php artisan serve --host=127.0.0.1 --port=8000
timeout /t 5 /nobreak >nul

:: Start React Frontend
echo [4/4] Starting React Frontend...
cd /d "C:\path\to\your\react\frontend"
start "React Frontend" npm start

echo.
echo ========================================
echo    ALL SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo MongoDB: http://localhost:27017
echo Laravel: http://127.0.0.1:8000
echo React: http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

:: Cleanup
taskkill /f /im node.exe 2>nul
taskkill /f /im php.exe 2>nul
taskkill /f /im mongod.exe 2>nul
echo All services stopped.