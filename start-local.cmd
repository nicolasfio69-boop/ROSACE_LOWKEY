@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org then reopen this file.
  pause
  exit /b 1
)
echo Installing the locked dependencies...
call npm.cmd ci
if errorlevel 1 (
  echo Installation failed. Read the error above before retrying.
  pause
  exit /b 1
)
echo Open http://localhost:3001 when the server says Ready.
call npm.cmd run dev -- --hostname 127.0.0.1 --port 3001
pause
