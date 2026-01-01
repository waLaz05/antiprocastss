@echo off
echo ===================================================
echo    REPARADOR DE ANTIPROCAST
echo ===================================================
echo.
echo [1/3] Limpiando instalacion corrupta...
if exist "node_modules" (
    rmdir /s /q "node_modules"
)
if exist "package-lock.json" (
    del "package-lock.json"
)

echo.
echo [2/3] Reinstalando librerias (esto tardara un poco)...
call npm install

echo.
echo [3/3] Iniciando App...
echo.
call npm run dev

pause
