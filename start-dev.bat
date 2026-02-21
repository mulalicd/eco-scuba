@echo off
:: Navigacija u folder skripte
cd /d "%~dp0"
title ECO SCUBA DEBUG STARTUP

echo ==========================================
echo    ECO SCUBA - DEBUGGING STARTUP
echo ==========================================
echo [INFO] Trenutni direktorij: %cd%

:: 1. Provjera Node.js
echo [INFO] Provjera Node.js verzije...
node -v
if %errorlevel% neq 0 (
    echo [GRESKA] Node.js NIJE pronadjen! Molimo instalirajte Node.js sa nodejs.org
    pause
    exit /b
)

:: 2. Provjera package.json
if not exist "package.json" (
    echo [GRESKA] package.json nije pronadjen u ovom folderu!
    echo Provjerite da li ste pokrenuli .bat fajl iz tacnog foldera projekta.
    pause
    exit /b
)

:: 3. Instalacija zavisnosti
if not exist "node_modules\" (
    echo [INFO] node_modules ne postoji. Pokrecem npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [GRESKA] 'npm install' nije uspio.
        pause
        exit /b
    )
)

:: 4. Pokretanje dev servera
echo [INFO] Pokusavam pokrenuti: npm run dev
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [GRESKA] 'npm run dev' je vratio error code: %errorlevel%
    echo Ako vidite "port already in use", pokusajte zatvoriti druge programe.
)

echo.
echo Skripta je zavrsila sa radom.
pause
