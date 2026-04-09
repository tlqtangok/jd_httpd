@echo off
REM =========================================================================
REM Stop httpd-test Docker Container
REM =========================================================================

echo =========================================================================
echo Stopping httpd-test Docker Container
echo =========================================================================
echo.

docker ps | findstr httpd-test >nul 2>&1
if %errorlevel% equ 0 (
    echo Stopping container...
    docker stop httpd-test
    echo Container stopped.
) else (
    echo Container httpd-test is not running.
)

echo.
echo =========================================================================
echo Stop Complete
echo =========================================================================
