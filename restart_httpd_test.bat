@echo off
REM =========================================================================
REM Restart httpd-test Docker Container
REM =========================================================================

echo =========================================================================
echo Restarting httpd-test Docker Container
echo =========================================================================
echo.

docker ps -a | findstr httpd-test >nul 2>&1
if %errorlevel% equ 0 (
    echo Restarting container...
    docker restart httpd-test
    
    if %errorlevel% equ 0 (
        echo Container restarted successfully!
        echo.
        
        REM Wait for services to start
        timeout /t 3 /nobreak >nul
        
        echo Container Status:
        docker ps --filter name=httpd-test
        echo.
        echo Recent logs:
        docker logs --tail 20 httpd-test
    ) else (
        echo ERROR: Failed to restart container!
        exit /b 1
    )
) else (
    echo Container httpd-test does not exist.
    echo Run start_httpd_test.bat to create and start the container.
    exit /b 1
)

echo.
echo =========================================================================
echo Restart Complete
echo =========================================================================
