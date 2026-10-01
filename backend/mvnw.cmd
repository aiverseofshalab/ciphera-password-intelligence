@echo off
where mvn >nul 2>nul
if %ERRORLEVEL% EQU 0 (mvn -f "%~dp0pom.xml" %*) else (echo Maven is required. Install Maven, or add the standard Maven Wrapper distribution. 1>&2 & exit /b 127)
