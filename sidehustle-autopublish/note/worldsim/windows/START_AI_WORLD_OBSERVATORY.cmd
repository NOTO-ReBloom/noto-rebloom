@echo off
setlocal
set "URL=https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/sidehustle-autopublish/note/worldsim/windows/INSTALL_WORLDSIM_REBUILD.ps1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $u='%URL%?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); $p=Join-Path $env:TEMP 'INSTALL_WORLDSIM_REBUILD.ps1'; Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache'} -Uri $u -OutFile $p; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $p; exit $LASTEXITCODE"
set "RC=%ERRORLEVEL%"
echo.
if "%RC%"=="0" (
  echo AI_WORLD_OBSERVATORY_BOOTSTRAP_OK
) else (
  echo AI_WORLD_OBSERVATORY_BOOTSTRAP_EXIT=%RC%
  echo The self-retry task remains installed unless public completion was verified.
)
exit /b %RC%
