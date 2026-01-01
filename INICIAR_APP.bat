@echo off
echo ===================================================
echo    INICIADOR DE ANTIPROCAST WEB APP
echo ===================================================
echo.

:: Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js!
    echo.
    echo Para usar esta App, necesitas instalar Node.js primero.
    echo Por favor ve a: https://nodejs.org/ e instalalo.
    echo.
    echo Una vez instalado, cierra este script y vuelve a intentarlo.
    echo.
    pause
    exit
)

echo [OK] Node.js detectado.
echo.

if not exist "node_modules" (
    echo [INFO] Instalando dependencias por primera vez...
    echo Esto puede tardar unos minutos...
    call npm install
)

echo.
echo [INFO] Iniciando servidor de desarrollo...
echo Se abrira tu navegador en breve.
echo.
call npm run dev

pause
