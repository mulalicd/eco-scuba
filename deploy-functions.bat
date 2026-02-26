@echo off
cd /d "%~dp0"
title ECO SCUBA - Deploy Edge Funkcija

echo.
echo ===========================================================
echo   ECO SCUBA - DEPLOY EDGE FUNKCIJA NA SUPABASE CLOUD
echo ===========================================================
echo.
echo KORAK 1: Provjera Supabase CLI...
npx supabase --version
if %errorlevel% neq 0 (
    echo [INFO] Supabase CLI se instalira...
)

echo.
echo KORAK 2: Provjera login sesije...
npx supabase projects list 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [AKCIJA POTREBNA] Nisi ulogovan u Supabase CLI.
    echo Loguj se sada - otvara se browser...
    npx supabase login
    echo.
)

echo.
echo KORAK 3: Deploying process-form-upload...
echo (Ovo moze potrajati 30-60 sekundi)
echo.
npx supabase functions deploy process-form-upload --project-ref fmqxjqoqtwslhkwddgla
if %errorlevel% neq 0 (
    echo.
    echo [GRESKA] Deploy process-form-upload nije uspio!
    echo Provjeri da li si ulogovan i da imas pristup projektu.
    pause
    exit /b 1
)
echo [OK] process-form-upload deployovan uspjesno!

echo.
echo KORAK 4: Deploying ai-generate-section...
npx supabase functions deploy ai-generate-section --project-ref fmqxjqoqtwslhkwddgla
if %errorlevel% neq 0 (
    echo.
    echo [GRESKA] Deploy ai-generate-section nije uspio!
    pause
    exit /b 1
)
echo [OK] ai-generate-section deployovan uspjesno!

echo.
echo ===========================================================
echo   DEPLOY ZAVRSEN USPJESNO!
echo ===========================================================
echo.
echo Sljedeci koraci:
echo  1. Idi na: https://supabase.com/dashboard/project/fmqxjqoqtwslhkwddgla/functions
echo  2. Provjeri da je deployment status "Active" (zeleni)
echo  3. Hard Reload u browseru: Ctrl+F5
echo  4. Testiraj Korak 1 Wizarda (upload Javnog poziva)
echo.
echo U Supabase Invocation logovima trebas sada vidjeti: status_code 200
echo.
pause
