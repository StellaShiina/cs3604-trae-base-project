@echo off
title 12306 Railway Booking System Launcher

echo Starting 12306 Railway Booking System...
echo ================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found, please install Node.js first
    pause
    exit /b 1
)

REM Check if Go is installed
go version >nul 2>&1
if errorlevel 1 (
    echo Error: Go not found, please install Go first
    pause
    exit /b 1
)

REM Check frontend dependencies
echo Checking frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Start frontend service
echo Starting frontend service...
start "Frontend Service" cmd /k "npm run dev"

REM Wait for frontend service to start
timeout /t 3 /nobreak >nul

REM Return to root directory
cd ..

REM Start backend service
echo Starting backend service...
cd backend
start "Backend Service" cmd /k "go run src/main.go"

REM Return to root directory
cd ..

echo ================================
echo Services started successfully!
echo Frontend URL: http://localhost:5173
echo Backend URL: http://localhost:8080
echo.
echo Instructions:
echo    - Open http://localhost:5173 in your browser to access the system
echo    - Close the corresponding command windows to stop services
echo    - Or press any key to exit this launcher
echo.

pause