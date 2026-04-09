@echo off
REM =========================================================================
REM Build httpd-nodejs Docker Image
REM =========================================================================

echo =========================================================================
echo Building httpd-nodejs Docker Image
echo =========================================================================
echo.

docker build --no-cache -t httpd-nodejs .

if %errorlevel% equ 0 (
    echo.
    echo =========================================================================
    echo Build Complete!
    echo =========================================================================
    echo.
    echo Image: httpd-nodejs
    docker images httpd-nodejs
    echo.
    echo Next step: Run start_httpd_test.bat to start the container
) else (
    echo.
    echo =========================================================================
    echo Build Failed!
    echo =========================================================================
    exit /b 1
)
