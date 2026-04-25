@echo off
title SGP-FAMAC - Entorno Local de Desarrollo
color 0D
echo.
echo  ====================================================
echo    SGP-FAMAC - Iniciando entorno de desarrollo local
echo  ====================================================
echo.

:: Limpiar cache de Turbopack para evitar el error FATAL de "Next.js package not found"
echo  [0/3] Limpiando cache de Turbopack...
if exist "%~dp0frontend\.next" (
    rmdir /s /q "%~dp0frontend\.next" 2>nul
    echo        Cache .next eliminado correctamente.
) else (
    echo        No habia cache previo.
)
echo.

echo  [1/3] Verificando que PostgreSQL este corriendo...
echo.
netstat -an | findstr "5432" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] ADVERTENCIA: No se detecto PostgreSQL en el puerto 5432
    echo      Asegurate de que PostgreSQL este corriendo antes de continuar.
    echo      La app puede fallar al intentar conectarse a la base de datos.
    echo.
    pause
)

echo  [2/3] Iniciando Backend NestJS en puerto 3005...
echo.
start "FAMAC-Backend" cmd /k "cd /d "%~dp0backend" && set DATABASE_URL=postgresql://postgres:1208fvdq*@localhost:5432/sgp_famac?schema=public && set PORT=3005 && npm run start:dev"

:: Esperar 3 segundos para que el backend arranque primero
timeout /t 3 /nobreak >nul

echo  [3/3] Iniciando Frontend Next.js en puerto 3000...
echo.
start "FAMAC-Frontend" cmd /k "cd /d "%~dp0frontend" && set NEXT_PUBLIC_API_URL=http://localhost:3005 && npm run dev"

echo.
echo  ====================================================
echo    Todo listo! Los servicios estan arrancando...
echo  ====================================================
echo.
echo    Backend:   http://localhost:3005
echo    Swagger:   http://localhost:3005/api/docs
echo    Frontend:  http://localhost:3000
echo.
echo    Login:     admin@famac.com / admin123
echo.
echo  ====================================================
echo    Presiona cualquier tecla para abrir el navegador
echo    o cierra esta ventana si no lo necesitas.
echo  ====================================================
echo.
pause

:: Abrir el navegador con la app
start http://localhost:3000
