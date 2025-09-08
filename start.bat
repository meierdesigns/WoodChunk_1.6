@echo off
title WoodChunk 1.6.1 Server
echo.
echo ========================================
echo    WoodChunk 1.6.1 Server Starter
echo ========================================
echo.

echo [1/5] Checking if port 8080 is available...
netstat -an | findstr ":8080" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 8080 is already in use. Terminating existing processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
        if not "%%a"=="0" (
            echo Terminating process PID: %%a
            taskkill /f /pid %%a >nul 2>&1
        )
    )
    timeout /t 3 >nul
    
    REM Double-check if port is now free
    netstat -an | findstr ":8080" >nul 2>&1
    if not errorlevel 1 (
        echo ERROR: Port 8080 still in use. Trying alternative termination...
        taskkill /f /im python.exe >nul 2>&1
        taskkill /f /im py.exe >nul 2>&1
        timeout /t 2 >nul
    )
    echo Port cleanup completed.
) else (
    echo Port 8080 is available.
)

echo.
echo [2/5] Checking Python installation...
set PYTHON_CMD=py
py --version >nul 2>&1
if errorlevel 1 (
    python --version >nul 2>&1
    if errorlevel 1 (
        echo Python not found! Please install Python 3.6+ first.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python
    )
)

echo.
echo [3/5] Verifying server.py exists...
if not exist "modules\core\server.py" (
    echo server.py not found in modules\core!
    pause
    exit /b 1
)

echo.
echo [4/5] Running cache buster...
if exist "modules\core\cache_buster.py" (
    %PYTHON_CMD% modules\core\cache_buster.py
)

echo.
echo [5/5] Starting HTTP server on port 8080...
echo Server will be available at: http://localhost:8080
echo.
%PYTHON_CMD% modules\core\server.py
pause