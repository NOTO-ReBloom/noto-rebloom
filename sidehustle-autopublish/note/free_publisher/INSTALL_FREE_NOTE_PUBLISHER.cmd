@echo off
setlocal
chcp 65001 >nul
set "PS1URL=https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/sidehustle-autopublish/note/free_publisher/INSTALL_FREE_NOTE_PUBLISHER.ps1"
set "TMPPS=%TEMP%\INSTALL_FREE_NOTE_PUBLISHER.ps1"
echo Installing and immediately publishing ready free NOTE articles...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing -Uri '%PS1URL%' -OutFile '%TMPPS%'"
if errorlevel 1 goto :fail
powershell -NoProfile -ExecutionPolicy Bypass -File "%TMPPS%"
set "RC=%ERRORLEVEL%"
del /q "%TMPPS%" >nul 2>&1
if not "%RC%"=="0" goto :failcode
exit /b 0
:fail
echo Download failed.
pause
exit /b 1
:failcode
echo Installer/catch-up exited with code %RC%.
echo The scheduled retry tasks remain installed when installation reached that step.
pause
exit /b %RC%
