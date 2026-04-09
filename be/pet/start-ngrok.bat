@echo off
echo Starting ngrok client...
echo Mapping localhost:3000 to jesson.tech
echo.

REM 找到 ngrok 可执行文件
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using ngrok from PATH
    ngrok -config=ngrok.yml start http
) else (
    REM 尝试常见位置
    if exist "ngrok.exe" (
        echo Using ngrok.exe in current directory
        .\ngrok.exe -config=ngrok.yml start http
    ) else if exist "..\ngrok.exe" (
        echo Using ngrok.exe in parent directory
        ..\ngrok.exe -config=ngrok.yml start http
    ) else (
        echo ERROR: ngrok executable not found!
        echo Please download ngrok client or specify the path.
        pause
        exit /b 1
    )
)
