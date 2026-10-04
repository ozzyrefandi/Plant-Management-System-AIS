@echo off
title Plant Management System - Offline Launcher
color 0E

echo ========================================================
echo   PLANT MANAGEMENT SYSTEM - LAUNCHER OFFLINE
echo ========================================================
echo Memeriksa file build dist...

if not exist dist (
    echo Direktori dist belum ada, melakukan build terlebih dahulu...
    call npm run build
)

echo.
echo Menjalankan local offline web server...
echo.

node serve-offline.js

if %errorlevel% neq 0 (
    echo.
    echo Node.js tidak merespons, mencoba alternatif python...
    cd dist
    python -m http.server 3000
)

pause
