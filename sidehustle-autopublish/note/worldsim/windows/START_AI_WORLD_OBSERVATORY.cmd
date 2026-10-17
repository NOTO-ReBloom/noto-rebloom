@echo off
setlocal EnableExtensions
set "SELF=%~f0"

if /I "%~1"=="__ADMIN__" goto ADMIN

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$f=$env:SELF; $q=[char]34; $a=$q+$f+$q+' __ADMIN__'; try { $p=Start-Process -FilePath $env:ComSpec -ArgumentList @('/d','/c',$a) -Verb RunAs -Wait -PassThru; exit $p.ExitCode } catch { exit 1223 }"
set "RC=%ERRORLEVEL%"
if "%RC%"=="1223" (
  echo.
  echo Administrator permission was cancelled.
  echo Run this file again and click Yes in the Windows permission dialog.
  pause
)
exit /b %RC%

:ADMIN
title AI World Observatory Setup
echo ============================================
echo AI World Observatory final setup
echo ============================================
echo.
echo This window is running as Administrator.
echo Legacy NOTE automation will be stopped first.
echo Do not close this window until it finishes.
echo.

set "URL=https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/ae990e82ef9ab1bb4d9a72064c39bc9647a33170/sidehustle-autopublish/note/worldsim/windows/INSTALL_WORLDSIM_REBUILD.ps1"
set "PSFILE=%TEMP%\INSTALL_WORLDSIM_REBUILD.ps1"

echo [1/2] Downloading the latest installer...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $u=$env:URL+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache'} -Uri $u -OutFile $env:PSFILE"
if errorlevel 1 (
  echo.
  echo ERROR: Could not download the installer.
  echo Check the internet connection and run this file again.
  echo.
  pause
  exit /b 1
)

echo [2/2] Running migration...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PSFILE%"
set "RC=%ERRORLEVEL%"

echo.
echo ============================================
if "%RC%"=="0" (
  echo Bootstrap finished successfully.
  echo Public verification may continue automatically.
) else (
  echo Migration did not finish. Exit code: %RC%
  echo The safety gate prevents forced deletion if verification fails.
  echo Please send ChatGPT a screenshot of this whole window.
)
echo ============================================
echo.
pause
exit /b %RC%
