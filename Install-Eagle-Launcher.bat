@echo off
title Eagle Launcher Downloader ^& Setup
color 0b
echo ============================================================
echo           EAGLE LAUNCHER - INSTALLER ^& SETUP
echo ============================================================
echo.
echo Installing Eagle Launcher to your computer...
echo.

set "TARGET_DIR=%LOCALAPPDATA%\EagleLauncher"
set "EXE_NAME=Eagle Launcher.exe"
set "DEST_EXE=%TARGET_DIR%\%EXE_NAME%"

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

if exist "%~dp0Eagle-Launcher-Setup.exe" (
    echo Launching Eagle Launcher Setup Wizard...
    start "" "%~dp0Eagle-Launcher-Setup.exe"
    exit /b 0
)

if exist "%~dp0Eagle Launcher.exe" (
    echo [1/3] Copying Eagle Launcher...
    copy /Y "%~dp0Eagle Launcher.exe" "%DEST_EXE%" >nul
)

echo [2/3] Creating Windows Start Menu shortcut...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Eagle Launcher.lnk')); $s.TargetPath = '%DEST_EXE%'; $s.WorkingDirectory = '%TARGET_DIR%'; $s.Description = 'Eagle Launcher - Unified PC Gaming Hub'; $s.IconLocation = '%DEST_EXE%,0'; $s.Save();"

echo [3/3] Creating Desktop shortcut...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'Eagle Launcher.lnk')); $s.TargetPath = '%DEST_EXE%'; $s.WorkingDirectory = '%TARGET_DIR%'; $s.Description = 'Eagle Launcher - Unified PC Gaming Hub'; $s.IconLocation = '%DEST_EXE%,0'; $s.Save();"

echo.
echo ============================================================
echo    Installation Complete! 
echo    Search 'Eagle Launcher' in Windows Search or check Desktop.
echo ============================================================
echo.
echo Launching Eagle Launcher...
start "" "%DEST_EXE%"
timeout /t 2 >nul
