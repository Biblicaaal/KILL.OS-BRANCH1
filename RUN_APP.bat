@echo off
setlocal

cd /d "%~dp0"

echo.
echo Starting Cyberpunk Productivity Dashboard...
echo Project: %CD%
echo.

where node >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
  ) else (
    echo Node.js was not found.
    echo.
    echo This app needs Node.js LTS to run.
    echo I can try to install it now using winget.
    echo.
    choice /C YN /M "Install Node.js LTS now"
    if errorlevel 2 (
      echo.
      echo Install Node.js LTS from https://nodejs.org/ and run this file again.
      pause
      exit /b 1
    )

    where winget >nul 2>nul
    if errorlevel 1 (
      echo.
      echo winget was not found on this Windows install.
      echo Install Node.js LTS from https://nodejs.org/ and run this file again.
      pause
      exit /b 1
    )

    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
      echo.
      echo Node.js install failed.
      echo Install Node.js LTS from https://nodejs.org/ and run this file again.
      pause
      exit /b 1
    )

    set "PATH=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%PATH%"
  )
)

where npm >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\npm.cmd" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  ) else if exist "C:\Program Files (x86)\nodejs\npm.cmd" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
  )
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found even after checking common install paths.
  echo Reinstall Node.js LTS and make sure "Add to PATH" is enabled.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency install failed.
    pause
    exit /b 1
  )
)

echo.
echo Launching dev server...
echo Open the local URL Vite prints below, usually http://localhost:5173/
echo.

call npm run dev -- --host 127.0.0.1

echo.
echo App stopped.
pause
