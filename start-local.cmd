@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org then reopen this file.
  pause
  exit /b 1
)
node scripts\start-local.mjs
if errorlevel 1 (
  echo.
  echo Rosace could not start. Read the message above.
  pause
  exit /b 1
)
