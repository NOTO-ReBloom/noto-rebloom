$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Raw='https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/'
$NodeCandidates=@(
  'C:\Program Files\nodejs\node.exe',
  (Get-Command node.exe -ErrorAction SilentlyContinue).Source
)|Where-Object{$_ -and (Test-Path $_)}
if(-not $NodeCandidates){throw 'node.exe not found'}
$Node=$NodeCandidates[0]

$Candidates=@(
  'C:\SIDEHUSTLE_AUTO\app\note',
  'C:\note-business\note_auto_publisher_windows\note_auto_publisher'
)
$Target=$null
foreach($c in $Candidates){
  if((Test-Path $c) -and (Test-Path (Join-Path $c 'config.json'))){
    $Target=$c;break
  }
}
if(-not $Target){throw 'Authenticated NOTE publisher folder not found'}
if(-not(Test-Path (Join-Path $Target 'node_modules\playwright'))){
  Push-Location $Target
  try{npm install playwright@1.55.0 --no-save}
  finally{Pop-Location}
}

$PublisherRel='sidehustle-autopublish/note/worldsim/windows/worldsim-note-publisher.mjs'
$WipeRel='sidehustle-autopublish/note/windows/worldsim_wipe_rebuild_20261016.mjs'
$Publisher=Join-Path $Target 'worldsim-note-publisher.mjs'
$Wipe=Join-Path $Target 'worldsim_wipe_rebuild_20261016.mjs'

function Download([string]$rel,[string]$out){
  Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='WORLDSIM-BOOTSTRAP/1.0'} -Uri ($Raw+$rel+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -OutFile $out
}
Download $PublisherRel $Publisher
Download $WipeRel $Wipe

& $Node --check $Publisher
if($LASTEXITCODE-ne0){throw 'worldsim publisher syntax failed'}
& $Node --check $Wipe
if($LASTEXITCODE-ne0){throw 'worldsim wipe syntax failed'}

Push-Location $Target
try{
  for($i=1;$i-le6;$i++){
    Write-Host "[worldsim] launch publish attempt $i/6"
    & $Node $Publisher
    Start-Sleep -Seconds 3
  }

  Write-Host '[worldsim] launch reconciliation complete; starting gated profile+wiping phase'
  & $Node $Wipe
  if($LASTEXITCODE-ne0){throw "worldsim rebuild failed exit=$LASTEXITCODE"}

  $Wrapper=Join-Path $Target 'publish_worldsim_once.cmd'
  @"
@echo off
setlocal
cd /d "$Target"
"$Node" "$Publisher" >> "logs\worldsim_scheduled.log" 2>&1
exit /b %ERRORLEVEL%
"@ | Set-Content -Encoding ASCII $Wrapper

  try{Disable-ScheduledTask -TaskName 'NOTE_FreePublish_0805' -ErrorAction SilentlyContinue|Out-Null}catch{}
  try{Disable-ScheduledTask -TaskName 'NOTE_FreePublish_1705' -ErrorAction SilentlyContinue|Out-Null}catch{}
  schtasks /Create /F /SC DAILY /ST 19:05 /TN 'NOTE_WorldSimPublish_1905' /TR "cmd.exe /c `"$Wrapper`"" | Out-Null
  Write-Host 'WORLDSIM_REBUILD_OK'
}finally{
  Pop-Location
}
