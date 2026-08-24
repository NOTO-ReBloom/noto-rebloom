$ErrorActionPreference = 'Continue'

$report = New-Object System.Collections.Generic.List[string]
function Add-Report([string]$line) {
  $report.Add($line)
  Write-Host $line
}

Add-Report '=== PUBLISHER SAFE STOP AND DIAGNOSE ==='
Add-Report ("GeneratedAt: {0}" -f (Get-Date -Format o))
Add-Report ("Computer: {0}" -f $env:COMPUTERNAME)
Add-Report ("User: {0}" -f $env:USERNAME)

Add-Report ''
Add-Report '[1/4] Stopping the NOTE publication loop'
$noteTaskNames = @('NOTE_RemoteQueue_30min')
foreach ($taskName in $noteTaskNames) {
  try {
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
    try { Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue } catch {}
    Disable-ScheduledTask -TaskName $taskName -ErrorAction Stop | Out-Null
    Add-Report ("TASK_DISABLED: {0}" -f $taskName)
  } catch {
    Add-Report ("TASK_NOT_FOUND_OR_NOT_CHANGEABLE: {0} ({1})" -f $taskName, $_.Exception.Message)
  }
}

$stopPatterns = @(
  'note-remote-publisher.mjs',
  'note-bot.mjs',
  'pipeline-guardian.mjs note',
  'run_note_remote_fixed.cmd',
  'run_note_repaired_hidden.vbs',
  'run_note_v8_hidden.vbs',
  'note-browser-profile'
)
$stopped = 0
try {
  Get-CimInstance Win32_Process -ErrorAction Stop | ForEach-Object {
    $commandLine = [string]$_.CommandLine
    $matchesPublisher = $false
    foreach ($pattern in $stopPatterns) {
      if ($commandLine -like "*$pattern*") { $matchesPublisher = $true; break }
    }
    if ($matchesPublisher -and $_.ProcessId -ne $PID) {
      try {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
        Add-Report ("PROCESS_STOPPED: pid={0} name={1}" -f $_.ProcessId, $_.Name)
        $stopped++
      } catch {
        Add-Report ("PROCESS_STOP_FAILED: pid={0} name={1} ({2})" -f $_.ProcessId, $_.Name, $_.Exception.Message)
      }
    }
  }
} catch {
  Add-Report ("PROCESS_SCAN_FAILED: {0}" -f $_.Exception.Message)
}
Add-Report ("NOTE_LOOP_STOP_COMPLETE: stoppedProcesses={0}" -f $stopped)

Add-Report ''
Add-Report '[2/4] Checking scheduled tasks'
try {
  Get-ScheduledTask -ErrorAction Stop |
    Where-Object {
      $_.TaskName -match '(?i)note|booth' -or
      (($_.Actions | ForEach-Object { "{0} {1}" -f $_.Execute, $_.Arguments }) -join ' ') -match '(?i)note|booth'
    } |
    ForEach-Object {
      $actionText = ($_.Actions | ForEach-Object { "{0} {1}" -f $_.Execute, $_.Arguments }) -join ' | '
      Add-Report ("TASK: name={0} state={1} action={2}" -f $_.TaskName, $_.State, $actionText)
    }
} catch {
  Add-Report ("TASK_SCAN_FAILED: {0}" -f $_.Exception.Message)
}

Add-Report ''
Add-Report '[3/4] Locating the BOOTH publisher'
$searchRoots = @(
  (Join-Path $env:USERPROFILE 'Downloads'),
  (Join-Path $env:USERPROFILE 'Desktop'),
  (Join-Path $env:USERPROFILE 'Documents'),
  (Join-Path $env:USERPROFILE 'OneDrive\Downloads'),
  'C:\note-business'
) | Select-Object -Unique
$boothHits = New-Object System.Collections.Generic.List[string]
foreach ($root in $searchRoots) {
  if (-not (Test-Path -LiteralPath $root)) { continue }
  try {
    Get-ChildItem -LiteralPath $root -Filter 'booth-bot.mjs' -File -Recurse -ErrorAction SilentlyContinue |
      ForEach-Object {
        if (-not $boothHits.Contains($_.FullName)) { $boothHits.Add($_.FullName) }
      }
  } catch {}
}
if ($boothHits.Count -eq 0) {
  Add-Report 'BOOTH_PUBLISHER_NOT_FOUND'
} else {
  foreach ($hit in $boothHits) { Add-Report ("BOOTH_PUBLISHER_FOUND: {0}" -f $hit) }
}

Add-Report ''
Add-Report '[4/4] Collecting NOTE evidence'
$logPaths = @(
  'C:\note-business\publisher_guardian_v5\catchup-note.log',
  'C:\note-business\note_auto_publisher_windows\note_auto_publisher\remote_auto_publish.log',
  'C:\note-business\note_auto_publisher_windows\note_auto_publisher\remote_public_verify.log',
  'C:\note-business\note_auto_publisher_windows\note_auto_publisher\pipeline-health-note.json',
  'C:\note-business\note_auto_publisher_windows\note_auto_publisher\PUBLISH_PIPELINE_ATTENTION_REQUIRED.txt'
)
foreach ($path in $logPaths) {
  Add-Report ("--- {0} ---" -f $path)
  if (Test-Path -LiteralPath $path) {
    try {
      Get-Content -LiteralPath $path -Tail 60 -ErrorAction Stop | ForEach-Object { Add-Report ([string]$_) }
    } catch {
      Add-Report ("READ_FAILED: {0}" -f $_.Exception.Message)
    }
  } else {
    Add-Report 'MISSING'
  }
}

Add-Report ''
Add-Report 'NOTE_TASK_REMAINS_DISABLED_FOR_SAFETY'
Add-Report '=== END DIAGNOSTIC ==='

$desktop = [Environment]::GetFolderPath('Desktop')
if (-not $desktop) { $desktop = $env:USERPROFILE }
$reportPath = Join-Path $desktop 'PUBLISHER_DIAG.txt'
$reportText = $report -join [Environment]::NewLine
try {
  [System.IO.File]::WriteAllText($reportPath, $reportText, (New-Object System.Text.UTF8Encoding($false)))
  Add-Report ("REPORT_SAVED: {0}" -f $reportPath)
} catch {
  Add-Report ("REPORT_SAVE_FAILED: {0}" -f $_.Exception.Message)
}
try {
  Set-Clipboard -Value $reportText -ErrorAction Stop
  Add-Report 'REPORT_COPIED_TO_CLIPBOARD'
} catch {
  Add-Report 'CLIPBOARD_COPY_FAILED'
}
