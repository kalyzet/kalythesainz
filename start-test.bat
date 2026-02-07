@echo off
cls
echo ========================================
echo   KALYTHESAINZ Framework Test Server
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo [!] Folder dist tidak ditemukan
    echo [*] Building framework...
    call npm run build
    if errorlevel 1 (
        echo [X] Build gagal!
        pause
        exit /b 1
    )
    echo [OK] Build berhasil!
    echo.
)

echo [*] Starting HTTP server...
echo [*] Server akan berjalan di http://localhost:8000
echo.
echo ========================================
echo   File Test yang Tersedia:
echo ========================================
echo.
echo [RECOMMENDED] Ultra Simple Test:
echo   http://localhost:8000/test-ultra-simple.html
echo.
echo [ALTERNATIVE] Working Test:
echo   http://localhost:8000/test-working.html
echo.
echo [DEBUG] Simple Test with Console:
echo   http://localhost:8000/test-simple.html
echo.
echo ========================================
echo.
echo [!] Tekan Ctrl+C untuk stop server
echo ========================================
echo.

REM Try Python 3 first
python -m http.server 8000 2>nul
if errorlevel 1 (
    REM Try Python 2
    python -m SimpleHTTPServer 8000 2>nul
    if errorlevel 1 (
        REM Try npx http-server
        echo [*] Python tidak ditemukan, menggunakan npx...
        npx http-server -p 8000
    )
)
