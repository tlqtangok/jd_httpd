@echo off
REM =========================================================================
REM View httpd-test Container Logs
REM =========================================================================

if "%1"=="" (
    docker logs --tail 50 -f httpd-test
) else (
    docker logs --tail %1 -f httpd-test
)
