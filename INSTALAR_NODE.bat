@echo off
title Instalador Automatico de Node.js
echo =================================================
echo   DESCARGANDO E INSTALANDO NODE.JS
echo =================================================
echo.
echo 1. Descargando el instalador oficial (esto puede tardar un poco)...

:: Usar PowerShell para descargar el archivo MSI de la versión LTS estable
powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi -OutFile node_installer.msi"

echo.
echo 2. Ejecutando instalador...
echo    [IMPORTANTE]: Se abrira una ventana de instalacion.
echo    Por favor dale a "Next", acepta los terminos, y "Install".
echo    Si pide permisos de Administrador, dile que SI.

:: Ejecutar el instalador y esperar a que termine
start /wait node_installer.msi

echo.
echo 3. Limpiando archivos temporales...
del node_installer.msi

echo.
echo =================================================
echo   INSTALACION FINALIZADA
echo =================================================
echo.
echo [MUY IMPORTANTE]:
echo Para que VS Code reconozca la instalacion, DEBES:
echo 1. CERRAR COMPLETAMENTE este VS Code.
echo 2. Volverlo a abrir.
echo 3. Ejecutar el archivo "INICIAR_APP.bat" que esta en esta carpeta.
echo.
pause
