$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'

$PayloadRaw='https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/9673ab74457914ff42be7b41ed2c02f97f52309e/'
$ControlRaw='https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/'
$ReqUrl=$ControlRaw+'sidehustle-autopublish/note/worldsim/rebuild_request.json'
$PublisherRel='sidehustle-autopublish/note/worldsim/windows/worldsim-note-publisher.mjs'
$WipeRel='sidehustle-autopublish/note/windows/worldsim_wipe_rebuild_20261016.mjs'
$RetryTask='NOTE_WorldSimMigration_15min'
$PublishTask='NOTE_WorldSimPublish_1905'
$LegacyTasks=@('NOTE_RemoteQueue_30min','NOTE_FreePublish_0805','NOTE_FreePublish_1705')

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
  if((Test-Path $c) -and (Test-Path (Join-Path $c 'config.json'))){$Target=$c;break}
}
if(-not $Target){throw 'Authenticated NOTE publisher folder not found'}

$LogDir=Join-Path $Target 'logs'
New-Item -ItemType Directory -Force -Path $LogDir|Out-Null
$Log=Join-Path $LogDir 'worldsim_bootstrap.log'
function Log([string]$s){
  $line='['+(Get-Date -Format o)+'] '+$s
  Write-Host $line
  Add-Content -Path $Log -Value $line -Encoding UTF8
}
function Download([string]$rel,[string]$out){
  Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='WORLDSIM-BOOTSTRAP/3.1'} -Uri ($PayloadRaw+$rel+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -OutFile $out
}
function RemoteRequest(){
  Invoke-RestMethod -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='WORLDSIM-BOOTSTRAP/3.0'} -Uri ($ReqUrl+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
}
function StopLegacy(){
  try{
    $legacyTaskObjects=Get-ScheduledTask -ErrorAction SilentlyContinue|Where-Object{
      $name=[string]$_.TaskName
      $actionText=(($_.Actions|ForEach-Object{([string]$_.Execute)+' '+([string]$_.Arguments)}) -join ' ')
      ($LegacyTasks -contains $name) -or (
        $name -match '(?i)^note' -and
        $name -notmatch '(?i)^NOTE_WorldSim' -and
        $actionText -match '(?i)note-business|note_auto_publisher|publish_guarded|publish_once|run_note|note-remote|note-free'
      )
    }
    foreach($task in $legacyTaskObjects){
      try{Stop-ScheduledTask -TaskName $task.TaskName -ErrorAction SilentlyContinue}catch{}
      try{Disable-ScheduledTask -TaskName $task.TaskName -ErrorAction SilentlyContinue|Out-Null}catch{}
    }
  }catch{}
  try{
    Get-CimInstance Win32_Process|ForEach-Object{
      $cmd=[string]$_.CommandLine
      if($_.ProcessId-ne$PID -and $cmd -match '(?i)note-remote-publisher|note-free-bot|run_note_v8|run_note_remote|pipeline-guardian'){
        try{taskkill /PID $_.ProcessId /T /F *> $null}catch{}
      }
    }
  }catch{}
  Log 'legacy NOTE publishers stopped and disabled'
}
function EnsurePlaywright(){
  if(Test-Path (Join-Path $Target 'node_modules\playwright')){return}
  Push-Location $Target
  try{
    Log 'installing playwright runtime'
    & npm.cmd install playwright@1.55.0 --no-save
    if($LASTEXITCODE-ne0){throw 'playwright install failed'}
  }finally{Pop-Location}
}
function InstallRetryTask(){
  $SelfLocal=Join-Path $Target 'worldsim-bootstrap.ps1'
  Copy-Item -LiteralPath $PSCommandPath -Destination $SelfLocal -Force
  $cmd="powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$SelfLocal`""
  schtasks /Create /F /SC MINUTE /MO 15 /TN $RetryTask /TR $cmd | Out-Null
  Log "retry task installed: $RetryTask"
}
function InstallPublisherTask([string]$Publisher){
  $wrapper=Join-Path $Target 'publish_worldsim_once.cmd'
  @"
@echo off
setlocal
cd /d "$Target"
"$Node" "$Publisher" >> "logs\worldsim_scheduled.log" 2>&1
exit /b %ERRORLEVEL%
"@ | Set-Content -Encoding ASCII $wrapper
  schtasks /Create /F /SC DAILY /ST 19:05 /TN $PublishTask /TR "cmd.exe /c `"$wrapper`"" | Out-Null
  Log "publisher task installed: $PublishTask"
}
function RemoveRetryTask(){
  try{schtasks /Delete /F /TN $RetryTask *> $null}catch{}
  Log "retry task removed: $RetryTask"
}

StopLegacy
$req=RemoteRequest
if($req.status -eq 'completed'){
  Log 'public rebuild already completed; keeping only worldsim publisher'
  RemoveRetryTask
  exit 0
}
if($req.status -ne 'requested'){
  Log "remote rebuild gate not requested: $($req.status)"
  InstallRetryTask
  exit 2
}

EnsurePlaywright
$Publisher=Join-Path $Target 'worldsim-note-publisher.mjs'
$Wipe=Join-Path $Target 'worldsim_wipe_rebuild_20261016.mjs'
Download $PublisherRel $Publisher
Download $WipeRel $Wipe
& $Node --check $Publisher
if($LASTEXITCODE-ne0){throw 'worldsim publisher syntax failed'}
& $Node --check $Wipe
if($LASTEXITCODE-ne0){throw 'worldsim wipe syntax failed'}

InstallRetryTask

Push-Location $Target
try{
  for($i=1;$i-le8;$i++){
    Log "launch reconciliation attempt $i/8"
    & $Node $Publisher
    $rc=$LASTEXITCODE
    if($rc-ne0){Log "publisher exit=$rc; continuing idempotent reconciliation"}
    Start-Sleep -Seconds 3
  }

  Log 'starting gated profile update + full legacy wipe'
  & $Node $Wipe
  $wipeRc=$LASTEXITCODE
  if($wipeRc-ne0){
    Log "wipe exit=$wipeRc; retry task remains armed"
    exit $wipeRc
  }

  InstallPublisherTask $Publisher

  # Re-check public completion through remote request. GitHub verifier may lag,
  # so local success never deletes the retry task until the public verifier marks completed.
  $req2=RemoteRequest
  if($req2.status -eq 'completed'){
    RemoveRetryTask
    Log 'WORLDSIM_REBUILD_OK_AND_PUBLICLY_VERIFIED'
  }else{
    Log "local rebuild completed; waiting for public verifier status=$($req2.status); retry task remains armed"
  }
}finally{
  Pop-Location
}
