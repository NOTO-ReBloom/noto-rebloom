
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'

$PayloadCommit='5447b450da2ec064d0c126549306d1a9435ee4bb'
$Raw='https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/'+$PayloadCommit+'/'
$CleanupRel='sidehustle-autopublish/note/worldsim/windows/worldsim-final-public-cleanup.mjs'
$PublisherRel='sidehustle-autopublish/note/worldsim/windows/worldsim-note-publisher.mjs'

$Candidates=@(
  'C:\SIDEHUSTLE_AUTO\app\note',
  'C:\note-business\note_auto_publisher_windows\note_auto_publisher'
)
$Target=$null
foreach($c in $Candidates){
  if((Test-Path $c) -and (Test-Path (Join-Path $c 'config.json'))){$Target=$c;break}
}
if(-not $Target){throw 'Authenticated NOTE publisher folder not found'}

$NodeCandidates=@(
  'C:\Program Files\nodejs\node.exe',
  (Get-Command node.exe -ErrorAction SilentlyContinue).Source
)|Where-Object{$_ -and (Test-Path $_)}
if(-not $NodeCandidates){throw 'node.exe not found'}
$Node=$NodeCandidates[0]

$LogDir=Join-Path $Target 'logs'
New-Item -ItemType Directory -Force -Path $LogDir|Out-Null
$Audit=Join-Path $LogDir 'worldsim_finalize_runtime_audit.txt'

function Download([string]$rel,[string]$out){
  $u=$Raw+$rel+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='WORLDSIM-FINALIZE/1.0'} -Uri $u -OutFile $out
}

Write-Host '[1/6] Stopping old NOTE automation...'
try{schtasks /End /TN 'NOTE_WorldSimMigration_15min' *> $null}catch{}
try{schtasks /Delete /F /TN 'NOTE_WorldSimMigration_15min' *> $null}catch{}

try{
  Get-ScheduledTask -ErrorAction SilentlyContinue|ForEach-Object{
    $name=[string]$_.TaskName
    $actionText=(($_.Actions|ForEach-Object{([string]$_.Execute)+' '+([string]$_.Arguments)}) -join ' ')
    if($name -match '(?i)^note' -and $name -notmatch '(?i)^NOTE_WorldSim' -and $actionText -match '(?i)note-business|note_auto_publisher|publish_guarded|publish_once|run_note|note-remote|note-free|pipeline-guardian'){
      try{Stop-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue}catch{}
      try{Disable-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue|Out-Null}catch{}
    }
  }
}catch{}

try{
  Get-CimInstance Win32_Process|ForEach-Object{
    $cmd=[string]$_.CommandLine
    if($_.ProcessId-ne$PID -and $cmd -match '(?i)note-remote-publisher|note-free-bot|run_note_v8|run_note_remote|pipeline-guardian|worldsim-fixed8|worldsim-fixed9'){
      try{taskkill /PID $_.ProcessId /T /F *> $null}catch{}
    }
  }
}catch{}

Write-Host '[2/6] Downloading protected final-cleanup script...'
$Cleanup=Join-Path $Target 'worldsim-final-public-cleanup.mjs'
$Publisher=Join-Path $Target 'worldsim-note-publisher.mjs'
Download $CleanupRel $Cleanup
Download $PublisherRel $Publisher

& $Node --check $Cleanup
if($LASTEXITCODE-ne0){throw 'cleanup syntax check failed'}
& $Node --check $Publisher
if($LASTEXITCODE-ne0){throw 'publisher syntax check failed'}

Write-Host '[3/6] Removing remaining PUBLIC legacy articles...'
Push-Location $Target
try{
  & $Node $Cleanup
  $rc=$LASTEXITCODE
}finally{Pop-Location}
if($rc-ne0){throw "protected cleanup failed with exit code $rc"}

Write-Host '[4/6] Verifying the publisher has no accidental pending launch duplicate...'
Push-Location $Target
try{
  & $Node $Publisher
  $pubRc=$LASTEXITCODE
}finally{Pop-Location}
if($pubRc-ne0){throw "publisher verification run failed with exit code $pubRc"}

Write-Host '[5/6] Installing daily WorldSim publisher at 19:05...'
$Wrapper=Join-Path $Target 'publish_worldsim_once.cmd'
$nl=[Environment]::NewLine
$wrapperText='@echo off'+$nl+'setlocal'+$nl+'cd /d "'+$Target+'"'+$nl+'"'+$Node+'" "'+$Publisher+'" >> "logs\worldsim_scheduled.log" 2>&1'+$nl+'exit /b %ERRORLEVEL%'+$nl
[System.IO.File]::WriteAllText($Wrapper,$wrapperText,[System.Text.Encoding]::ASCII)

$taskCommand='cmd.exe /c "'+$Wrapper+'"'
schtasks /Create /F /SC DAILY /ST 19:05 /TN 'NOTE_WorldSimPublish_1905' /TR $taskCommand | Out-Null
if($LASTEXITCODE-ne0){throw 'failed to install NOTE_WorldSimPublish_1905'}

Write-Host '[6/6] Writing runtime audit...'
$lines=@()
$lines+='CompletedAt='+([DateTimeOffset]::Now.ToString('o'))
$lines+='Target='+$Target
$lines+='Node='+$Node
$lines+='ProtectedLaunchPosts=4'
$lines+='MigrationRetryTask=deleted'
$lines+='DailyPublisherTask=NOTE_WorldSimPublish_1905 at 19:05'
try{
  $task=Get-ScheduledTask -TaskName 'NOTE_WorldSimPublish_1905' -ErrorAction Stop
  $lines+='DailyPublisherTaskState='+$task.State
}catch{
  $lines+='DailyPublisherTaskState=NOT_FOUND'
}
$lines|Set-Content -Path $Audit -Encoding UTF8

Write-Host ''
Write-Host '============================================'
Write-Host 'FINALIZE_COMPLETED'
Write-Host 'Public NOTE profile is now limited to the four protected LYRA launch posts.'
Write-Host 'Old NOTE automation is disabled.'
Write-Host 'Daily WorldSim publishing is installed for 19:05.'
Write-Host 'GitHub public verifier will unlock the 7-day turn engine after it confirms the four-post public state.'
Write-Host '============================================'
