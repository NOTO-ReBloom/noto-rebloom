$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Root = 'C:\SIDEHUSTLE_AUTO'
$LogDir = Join-Path $Root 'logs'
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Force -Path $LogDir | Out-Null }
$Log = Join-Path $LogDir 'run_current_debt.log'
$RawBase = 'https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/'
$Node = 'C:\Program Files\nodejs\node.exe'
$Npm = 'C:\Program Files\nodejs\npm.cmd'
$NoteTask = 'NOTE_RemoteQueue_30min'
$BoothTask = 'BOOTH_RemoteQueue_30min'

function Say([string]$s) {
  $line = ('[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $s)
  Write-Host $line
  Add-Content -LiteralPath $Log -Value $line -Encoding UTF8
}

function Get-RemoteJson([string]$relative) {
  $u = $RawBase + $relative + '?t=' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  return Invoke-RestMethod -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='SIDEHUSTLE-CURRENT-DEBT/1.0'} -Uri $u
}

function Stop-PublisherProcesses {
  try {
    Get-CimInstance Win32_Process | ForEach-Object {
      $c = [string]$_.CommandLine
      if ($_.ProcessId -ne $PID -and ($c -match '(?i)run_note_v8|run_booth_v8|pipeline-guardian\.mjs\s+(note|booth)|note-remote-publisher\.mjs|note-free-bot\.mjs|booth-bot\.mjs')) {
        try {
          & taskkill.exe /PID $_.ProcessId /T /F *> $null
          Say ('stopped stale publisher pid=' + $_.ProcessId)
        } catch {}
      }
    }
  } catch {}
}

function Set-TaskSafe([string]$name, [bool]$enable) {
  try {
    $t = Get-ScheduledTask -TaskName $name -ErrorAction Stop
    try { Stop-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue } catch {}
    $s = $t.Settings
    $s.DisallowStartIfOnBatteries = $false
    $s.StopIfGoingOnBatteries = $false
    $s.StartWhenAvailable = $true
    Set-ScheduledTask -TaskName $name -Settings $s | Out-Null
    if ($enable) { Enable-ScheduledTask -TaskName $name | Out-Null } else { Disable-ScheduledTask -TaskName $name | Out-Null }
    Say ("task $name enabled=$enable AC_ONLY=false STOP_ON_BATTERY=false")
  } catch {
    Say ("task $name update warning: " + $_.Exception.Message)
  }
}

function Invoke-External([string]$File, [string[]]$Args, [string]$WorkDir, [int]$TimeoutSec) {
  $tag = [Guid]::NewGuid().ToString('N')
  $out = Join-Path $env:TEMP ("sidehustle_${tag}.out.txt")
  $err = Join-Path $env:TEMP ("sidehustle_${tag}.err.txt")
  try {
    $p = Start-Process -FilePath $File -ArgumentList $Args -WorkingDirectory $WorkDir -NoNewWindow -PassThru -RedirectStandardOutput $out -RedirectStandardError $err
    if (-not $p.WaitForExit($TimeoutSec * 1000)) {
      Say ("timeout ${TimeoutSec}s: $File " + ($Args -join ' '))
      try { & taskkill.exe /PID $p.Id /T /F *> $null } catch {}
      Start-Sleep -Seconds 1
      $rc = 124
    } else {
      $rc = $p.ExitCode
    }
    $text = ''
    if (Test-Path $out) { $text += [IO.File]::ReadAllText($out) }
    if (Test-Path $err) { $text += [IO.File]::ReadAllText($err) }
    if ($text) {
      Write-Host $text.TrimEnd()
      Add-Content -LiteralPath $Log -Value $text -Encoding UTF8
    }
    Say ("exit=$rc command=$File " + ($Args -join ' '))
    return [pscustomobject]@{ ExitCode=$rc; Text=$text }
  } finally {
    Remove-Item -Force -ErrorAction SilentlyContinue $out,$err
  }
}

Set-Content -LiteralPath $Log -Value ('=== CURRENT DEBT RUN ' + (Get-Date -Format o) + ' ===') -Encoding UTF8
Say 'loading canonical publication request'
$req = Get-RemoteJson 'sidehustle-autopublish/windows_publication_request.json'
$paidIds = @($req.paidNote.ids)
$freeIds = @($req.freeNote.ids)
$boothIds = @($req.BOOTH.ids)
if ($paidIds.Count -eq 0 -and $freeIds.Count -eq 0 -and $boothIds.Count -eq 0) { throw 'No outstanding IDs in windows_publication_request.json' }
Say ("request date=$($req.date) paid=$($paidIds.Count) free=$($freeIds.Count) booth=$($boothIds.Count)")

# Confirm remote queues really expose every requested ID as active or already verified.
$paidQ = Get-RemoteJson 'sidehustle-autopublish/note/queue/index.json'
$freeQ = Get-RemoteJson 'sidehustle-autopublish/note/free_queue/index.json'
$boothQ = Get-RemoteJson 'booth-autopublish/queue/index.json'
foreach ($pair in @(@($paidIds,$paidQ,'paid'),@($freeIds,$freeQ,'free'),@($boothIds,$boothQ,'booth'))) {
  $ids = @($pair[0]); $q = $pair[1]; $kind = [string]$pair[2]
  foreach ($id in $ids) {
    $e = @($q.entries | Where-Object { $_.id -eq $id -or $_.queueId -eq $id }) | Select-Object -First 1
    if (-not $e) { throw "$kind queue missing $id" }
    if (-not $e.publicUrlVerified -and -not $e.enabled) { throw "$kind queue disabled $id" }
  }
}
Say 'remote queue contract OK'

if (-not (Test-Path -LiteralPath $Node)) { throw "node not found: $Node" }
Stop-PublisherProcesses
Set-TaskSafe $NoteTask $false
Set-TaskSafe $BoothTask $false

$NoteDir = Join-Path $Root 'app\note'
if (-not (Test-Path -LiteralPath (Join-Path $NoteDir 'note-remote-publisher.mjs'))) { $NoteDir = 'C:\note-business\note_auto_publisher_windows\note_auto_publisher' }
if (-not (Test-Path -LiteralPath (Join-Path $NoteDir 'note-remote-publisher.mjs'))) { throw 'NOTE publisher not found' }
Say ("NOTE_DIR=$NoteDir")

$paidEvidence = ''
for ($i=1; $i -le 10; $i++) {
  Say ("PAID NOTE attempt $i/10")
  $r = Invoke-External $Node @('note-remote-publisher.mjs','publish-next') $NoteDir 240
  $paidEvidence += "`n" + $r.Text
  $allDone = $true
  foreach ($id in $paidIds) {
    if ($paidEvidence -notmatch ('(?m)(?:PUBLISH_SUCCESS_VERIFIED|EXISTING_PUBLIC_RECONCILED|PAID_EXISTING_PUBLIC_RECONCILED)\s+' + [regex]::Escape($id) + '\b')) { $allDone = $false; break }
  }
  if ($allDone) { Say 'paid NOTE strict markers complete'; break }
  Start-Sleep -Seconds 3
}

if ($freeIds.Count -gt 0) {
  $FreeBot = Join-Path $NoteDir 'note-free-bot.mjs'
  if (-not (Test-Path -LiteralPath $FreeBot)) { throw 'note-free-bot.mjs not found' }
  $env:NOTE_FREE_BATCH = [string]$freeIds.Count
  try {
    for ($i=1; $i -le 4; $i++) {
      Say ("FREE NOTE attempt $i/4")
      [void](Invoke-External $Node @('note-free-bot.mjs','publish-batch') $NoteDir 360)
      Start-Sleep -Seconds 3
    }
  } finally { Remove-Item Env:NOTE_FREE_BATCH -ErrorAction SilentlyContinue }
}

$BoothDir = Join-Path $Root 'app\booth'
if (-not (Test-Path -LiteralPath (Join-Path $BoothDir 'booth-bot.mjs'))) { $BoothDir = Join-Path $env:USERPROFILE 'Downloads\BOOTH_AUTO_PUBLISHER_v3_ASCII' }
if (-not (Test-Path -LiteralPath (Join-Path $BoothDir 'booth-bot.mjs'))) { throw 'BOOTH publisher not found' }
$BoothBot = Join-Path $BoothDir 'booth-bot.mjs'
Say ("BOOTH_DIR=$BoothDir")

# The proven BOOTH bot keeps a five-ID local recovery target set. Align its newest local set to the current canonical request.
$src = [IO.File]::ReadAllText($BoothBot)
$missingCurrent = @($boothIds | Where-Object { -not $src.Contains([string]$_) })
if ($missingCurrent.Count -gt 0) {
  $matches = [regex]::Matches($src, '\b\d{3}_[a-z0-9_]+_os_\d{8}\b') | ForEach-Object { $_.Value } | Select-Object -Unique
  $candidates = @($matches | ForEach-Object {
    if ($_ -match '^(\d{3})_') { [pscustomobject]@{Id=$_;N=[int]$Matches[1]} }
  } | Sort-Object N -Descending)
  $old = @($candidates | Where-Object { $boothIds -notcontains $_.Id } | Select-Object -First $boothIds.Count | Sort-Object N)
  if ($old.Count -ne $boothIds.Count) { throw ('Cannot safely align BOOTH local targets; found old=' + ($old.Id -join ',')) }
  $newSorted = @($boothIds | Sort-Object { if ($_ -match '^(\d{3})_') { [int]$Matches[1] } else { 0 } })
  $backup = $BoothBot + '.before_current_debt.bak'
  if (-not (Test-Path -LiteralPath $backup)) { Copy-Item -LiteralPath $BoothBot -Destination $backup }
  for ($i=0; $i -lt $newSorted.Count; $i++) {
    Say ("BOOTH target patch $($old[$i].Id) -> $($newSorted[$i])")
    $src = $src.Replace([string]$old[$i].Id, [string]$newSorted[$i])
  }
  foreach ($id in $boothIds) { if (-not $src.Contains([string]$id)) { throw "BOOTH target patch verification failed: $id" } }
  [IO.File]::WriteAllText($BoothBot, $src, [Text.UTF8Encoding]::new($false))
} else { Say 'BOOTH current target IDs already present locally' }

[void](Invoke-External $Node @('--check','booth-bot.mjs') $BoothDir 60)
if (Test-Path -LiteralPath $Npm) {
  Say 'BOOTH preflight'
  [void](Invoke-External $Npm @('run','preflight') $BoothDir 300)
  for ($i=1; $i -le 10; $i++) {
    Say ("BOOTH publish attempt $i/10")
    [void](Invoke-External $Npm @('run','publish') $BoothDir 360)
    Start-Sleep -Seconds 3
  }
} else {
  for ($i=1; $i -le 10; $i++) {
    Say ("BOOTH node publish attempt $i/10")
    [void](Invoke-External $Node @('booth-bot.mjs','publish-next') $BoothDir 360)
    Start-Sleep -Seconds 3
  }
}

Set-TaskSafe $NoteTask $true
Set-TaskSafe $BoothTask $true
Say 'current-debt direct publication run finished; scheduled publishers re-enabled'
Say ("LOG=$Log")
