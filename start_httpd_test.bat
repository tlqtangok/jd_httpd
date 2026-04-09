@echo off
REM =========================================================================
REM httpd-test Docker Container Startup Script
REM =========================================================================
REM Description: Starts httpd-nodejs container in daemon mode
REM Ports: 10248:80 (HTTP), 10247:443 (HTTPS)
REM Container: httpd-test
REM Volumes: Bind mounts to local folders
REM =========================================================================

echo =========================================================================
echo Starting httpd-test Docker Container
echo =========================================================================
echo.

REM Check if container exists
docker ps -a | findstr httpd-test >nul 2>&1
if %errorlevel% equ 0 (
    echo Container httpd-test already exists. Stopping and removing...
    docker stop httpd-test >nul 2>&1
    docker rm httpd-test >nul 2>&1
    echo Container removed.
    echo.
)

REM Start container in daemon mode with bind mounts
echo Starting container with:
echo   - HTTP Port:  10248 -^> 80
echo   - HTTPS Port: 10247 -^> 443
echo   - Name:       httpd-test
echo   - Mode:       Daemon (background)
echo   - Bind Mounts:
echo     * %CD%\html -^> /usr/local/apache2/htdocs
echo     * %CD%\be -^> /usr/local/apache2/be
echo     * %CD%\ssl -^> /usr/local/apache2/ssl
echo     * %CD%\uploads -^> /usr/local/apache2/uploads
echo.

REM Create uploads folder if not exists
if not exist "%CD%\uploads" mkdir "%CD%\uploads"

docker run -d ^
  -p 10248:80 ^
  -p 10247:443 ^
  -v "%CD%\html:/usr/local/apache2/htdocs" ^
  -v "%CD%\be:/usr/local/apache2/be" ^
  -v "%CD%\ssl:/usr/local/apache2/ssl" ^
  -v "%CD%\uploads:/usr/local/apache2/uploads" ^
  --name httpd-test ^
  httpd-nodejs

if %errorlevel% equ 0 (
    echo.
    echo =========================================================================
    echo Container started successfully!
    echo =========================================================================
    echo.
    echo Container Name: httpd-test
    echo Container ID:   
    docker ps --filter name=httpd-test --format "{{.ID}}"
    echo.
    echo Access URLs:
    echo   - HTTP:       http://localhost:10248
    echo   - HTTPS:      https://localhost:10247
    echo.
    echo Web Pages:
    echo   - Unified Test:     http://localhost:10248/httpd_be_test.html
    echo   - CGI Version:      http://localhost:10248/inputtest_cgi.html
    echo   - ProxyPass:        http://localhost:10248/inputtest_proxypass_reverse.html
    echo.
    echo WebDAV:
    echo   - URL:              https://localhost:10247/uploads/
    echo   - Username:         jd
    echo   - Password:         pw
    echo   - Upload:           curl -u 'jd:pw' "http://localhost:10248/uploads/file.txt" -T file.txt
    echo.
    echo Bind Mounts (Live Editing):
    echo   - html:     Edit files in %CD%\html
    echo   - be:       Edit files in %CD%\be
    echo   - ssl:      Edit files in %CD%\ssl
    echo   - uploads:  Files saved in %CD%\uploads
    echo.
    echo To apply changes:
    echo   docker restart httpd-test
    echo.
    echo Container Logs:
    echo   docker logs httpd-test
    echo.
    echo Stop Container:
    echo   docker stop httpd-test
    echo.
    echo Remove Container:
    echo   docker rm httpd-test
    echo.
    echo =========================================================================
    
    REM Wait a moment for services to start
    timeout /t 3 /nobreak >nul
    
    REM Show container status
    echo.
    echo Container Status:
    docker ps --filter name=httpd-test
    echo.
    
    REM Show logs
    echo Recent logs:
    docker logs --tail 20 httpd-test
    
) else (
    echo.
    echo =========================================================================
    echo ERROR: Failed to start container!
    echo =========================================================================
    echo.
    echo Please check:
    echo   1. Docker is running
    echo   2. Image httpd-nodejs exists: docker images httpd-nodejs
    echo   3. Ports 10247 and 10248 are not in use
    echo   4. Folders exist: html, be, ssl
    echo.
    exit /b 1
)

echo.
echo =========================================================================
echo Startup Complete
echo =========================================================================
echo.
echo TIP: Edit files in html/, be/, ssl/ folders
echo Then run: docker restart httpd-test to apply changes!
