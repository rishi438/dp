@echo off
cd /d "%~dp0dp-simulator"
call npm run build
if errorlevel 1 exit /b 1
echo Open http://127.0.0.1:4173
call npm start
