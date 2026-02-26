@echo off
SETLOCAL EnableDelayedExpansion

:: Set colors for the console
color 0A

title ECO SCUBA - GitHub Backup

echo.
echo  ==========================================================
echo            ECO SCUBA - GITHUB PUSH UTILITY
echo  ==========================================================
echo.

:: Check if .git directory exists
if not exist ".git\" (
    echo  [!] Git nije inicijalizovan u ovom folderu.
    set /p init=" Zelite li inicijalizovati Git sada? (d/n): "
    if /i "!init!"=="d" (
        git init
        echo  [OK] Git inicijalizovan.
    ) else (
        echo  [INFO] Prekidam operaciju.
        pause
        exit /b
    )
)

:: Check for remote
git remote -v | findstr "push" > nul
if %errorlevel% neq 0 (
    echo  [UPOZORENJE] Remote repozitorij nije podesen.
    echo  [HELP] Koristite: git remote add origin URL_REPOZITORIJA
    set /p remote_url=" Unesite GitHub URL (ili ostavite prazno za prekid): "
    if "!remote_url!"=="" (
        pause
        exit /b
    ) else (
        git remote add origin !remote_url!
        echo  [OK] Remote 'origin' je dodan.
    )
)

echo.
echo  [SYSTEM] Skeniranje promjena...
git status -s

echo.
set /p msg=" Unesite commit poruku (prazno za 'Backup [timestamp]'): "
if "!msg!"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
    set msg=Backup !mydate! !mytime!
)

echo.
echo  [1/3] Dodavanje fajlova...
git add .

echo  [2/3] Kreiranje commit-a: "!msg!"...
git commit -m "!msg!"

echo  [3/3] Sinhronizacija s remote repozitorijem...
git pull origin main --rebase
if %errorlevel% neq 0 (
    echo  [INFO] Pull/rebase nije uspio, pokusavam bez rebase...
    git pull origin main --no-rebase
)

echo  [3/3] Slanje na GitHub (push)...
git push origin main
if %errorlevel% neq 0 (
    echo  [INFO] Pokusavam push na 'master' granu...
    git push origin master
)

if %errorlevel% equ 0 (
    echo.
    echo  ==========================================================
    echo  [USPJEH] Projekat je uspjesno poslan na GitHub!
    echo  ==========================================================
) else (
    echo.
    echo  [GRESKA] Slanje na GitHub nije uspjelo.
    echo  Provjerite internet konekciju i dozvole za repozitorij.
)

pause
ENDLOCAL