$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Root='C:\SIDEHUSTLE_AUTO'
$LogDir=Join-Path $Root 'logs'; New-Item -ItemType Directory -Force -Path $LogDir|Out-Null
$Log=Join-Path $LogDir 'run_current_debt.log'
$Raw='https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/'
$Node='C:\Program Files\nodejs\node.exe'; $Npm='C:\Program Files\nodejs\npm.cmd'
$NoteTask='NOTE_RemoteQueue_30min'; $BoothTask='BOOTH_RemoteQueue_30min'
$LegacyNoteTasks=@('NOTE_RemoteQueue_30min','NOTE_FreePublish_0805','NOTE_FreePublish_1705','note自動投稿_朝10時','note自動投稿_夜19時')
function Say([string]$s){$x='['+(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')+'] '+$s;Write-Host $x;Add-Content $Log $x -Encoding UTF8}
function J([string]$p){Invoke-RestMethod -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='SIDEHUSTLE-DEBT/3.0'} -Uri ($Raw+$p+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())}
function Task([string]$n,[bool]$on){try{$t=Get-ScheduledTask -TaskName $n -ErrorAction Stop;try{Stop-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue}catch{};$s=$t.Settings;$s.DisallowStartIfOnBatteries=$false;$s.StopIfGoingOnBatteries=$false;$s.StartWhenAvailable=$true;Set-ScheduledTask -TaskName $n -Settings $s|Out-Null;if($on){Enable-ScheduledTask -TaskName $n|Out-Null}else{Disable-ScheduledTask -TaskName $n|Out-Null};Say "task $n enabled=$on"}catch{Say "task warning $n $($_.Exception.Message)"}}
function KillStale(){try{Get-CimInstance Win32_Process|%{$c=[string]$_.CommandLine;if($_.ProcessId-ne$PID-and$c-match'(?i)run_note_v8|run_booth_v8|pipeline-guardian|note-remote-publisher|note-free-bot|booth-bot'){try{taskkill /PID $_.ProcessId /T /F *> $null;Say "stopped stale pid=$($_.ProcessId)"}catch{}}}}catch{}}
function Run([string]$f,[string[]]$a,[string]$wd,[int]$sec){$o=Join-Path $env:TEMP ([guid]::NewGuid().ToString('N')+'.out');$e=$o+'.err';try{$p=Start-Process $f -ArgumentList $a -WorkingDirectory $wd -NoNewWindow -PassThru -RedirectStandardOutput $o -RedirectStandardError $e;if(-not$p.WaitForExit($sec*1000)){taskkill /PID $p.Id /T /F *> $null;$rc=124}else{$rc=$p.ExitCode};$txt='';if(Test-Path $o){$txt+=[IO.File]::ReadAllText($o)};if(Test-Path $e){$txt+=[IO.File]::ReadAllText($e)};if($txt){Write-Host $txt.TrimEnd();Add-Content $Log $txt -Encoding UTF8};Say "exit=$rc $f $($a-join' ')";[pscustomobject]@{ExitCode=$rc;Text=$txt}}finally{Remove-Item $o,$e -Force -ErrorAction SilentlyContinue}}
Set-Content $Log ('=== CURRENT DEBT '+(Get-Date -Format o)+' ===') -Encoding UTF8
$tasksTouched=$false
$worldsimMode=$false
# Full note-account rebuild to AI World Observatory. The user explicitly approved wiping legacy note content.
# Safety: the wipe script refuses destructive deletion until all four replacement launch posts are reader-visible.
try{
 $worldReq=J 'sidehustle-autopublish/note/worldsim/rebuild_request.json'
 if($worldReq.status -eq 'requested'){
  $worldsimMode=$true
  $stateDir=Join-Path $Root 'state';New-Item -ItemType Directory -Force -Path $stateDir|Out-Null
  $worldStatePath=Join-Path $stateDir 'worldsim_rebuild_state.json'
  $doneId=''
  if(Test-Path $worldStatePath){try{$doneId=([IO.File]::ReadAllText($worldStatePath)|ConvertFrom-Json).requestId}catch{}}
  if($doneId -ne [string]$worldReq.requestId){
   $ndWorld=Join-Path $Root 'app\note'
   if(-not(Test-Path $ndWorld)){throw "NOTE app root missing: $ndWorld"}
   if(-not(Test-Path $Node)){throw 'node missing for worldsim rebuild'}
   $publisherName=Split-Path ([string]$worldReq.publisherPath) -Leaf
   $publisherLocal=Join-Path $ndWorld $publisherName
   Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='WORLDSIM-PUBLISHER/1.0'} -Uri ($Raw+[string]$worldReq.publisherPath+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -OutFile $publisherLocal
   KillStale;Task $NoteTask $false;$tasksTouched=$true

   # First publish the four replacement posts using the concise worldsim publisher.
   # It has no legacy 5,001-character requirement and reconciles exact titles before create.
   $attempts=[Math]::Max(6,[int]$worldReq.expectedLaunchPublications+2)
   for($i=1;$i-le$attempts;$i++){
    Say "worldsim launch publish attempt $i/$attempts"
    [void](Run $Node @($publisherName) $ndWorld 420)
    Start-Sleep 3
   }

   # Then run the gated profile update + backup + full wipe.
   $scriptName=Split-Path ([string]$worldReq.scriptPath) -Leaf
   $scriptLocal=Join-Path $ndWorld $scriptName
   Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='WORLDSIM-REBUILD/1.0'} -Uri ($Raw+[string]$worldReq.scriptPath+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -OutFile $scriptLocal
   Say "worldsim rebuild requested id=$($worldReq.requestId)"
   $worldRun=Run $Node @($scriptName) $ndWorld 3600
   if($worldRun.ExitCode-ne0){throw "worldsim rebuild retryable exit=$($worldRun.ExitCode)"}

   # Replace legacy free-note cadence with one lightweight worldsim queue consumer.
   $worldWrapper=Join-Path $ndWorld 'publish_worldsim_once.cmd'
   @"
@echo off
setlocal
cd /d "$ndWorld"
"$Node" "$publisherLocal" >> "logs\worldsim_scheduled.log" 2>&1
exit /b %ERRORLEVEL%
"@ | Set-Content -Encoding ASCII $worldWrapper
   foreach($legacy in $LegacyNoteTasks){try{Disable-ScheduledTask -TaskName $legacy -ErrorAction SilentlyContinue|Out-Null}catch{}}
   schtasks /Create /F /SC DAILY /ST 19:05 /TN 'NOTE_WorldSimPublish_1905' /TR "cmd.exe /c `"$worldWrapper`"" | Out-Null
   @{requestId=[string]$worldReq.requestId;completedAt=(Get-Date -Format o);launchCount=$worldReq.expectedLaunchPublications;publisherTask='NOTE_WorldSimPublish_1905'}|ConvertTo-Json|Set-Content $worldStatePath -Encoding UTF8
   Say "worldsim rebuild completed id=$($worldReq.requestId); scheduled NOTE_WorldSimPublish_1905"
  }else{Say "worldsim rebuild already completed id=$doneId"}
 }
}catch{Say ('WORLDSIM REBUILD RETRYABLE '+$_.Exception.Message)}
# Portfolio cleanup requests are safe, explicit, idempotent note maintenance.
# They run before publication debt and never publish new note content.
try{
 $cleanupReq=J 'sidehustle-autopublish/note/windows/note_semantic_cleanup_request.json'
 if($cleanupReq.status -eq 'requested'){
  $stateDir=Join-Path $Root 'state';New-Item -ItemType Directory -Force -Path $stateDir|Out-Null
  $cleanupStatePath=Join-Path $stateDir 'note_semantic_cleanup_state.json'
  $doneId=''
  if(Test-Path $cleanupStatePath){try{$doneId=([IO.File]::ReadAllText($cleanupStatePath)|ConvertFrom-Json).requestId}catch{}}
  if($doneId -ne [string]$cleanupReq.requestId){
   $ndCleanup=Join-Path $Root 'app\note'
   if(-not(Test-Path $ndCleanup)){throw "NOTE cleanup app root missing: $ndCleanup"}
   if(-not(Test-Path $Node)){throw 'node missing for NOTE cleanup'}
   $scriptName=Split-Path ([string]$cleanupReq.scriptPath) -Leaf
   $planName=Split-Path ([string]$cleanupReq.planPath) -Leaf
   $scriptLocal=Join-Path $ndCleanup $scriptName
   $planLocal=Join-Path $ndCleanup $planName
   Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='SIDEHUSTLE-CLEANUP/1.0'} -Uri ($Raw+[string]$cleanupReq.scriptPath+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -OutFile $scriptLocal
   Invoke-WebRequest -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='SIDEHUSTLE-CLEANUP/1.0'} -Uri ($Raw+[string]$cleanupReq.planPath+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -OutFile $planLocal
   Say "NOTE semantic cleanup requested id=$($cleanupReq.requestId) expectedDelete=$($cleanupReq.expectedDeleteCount)"
   $clean=Run $Node @($scriptName) $ndCleanup 1200
   if($clean.ExitCode-ne0){throw "NOTE semantic cleanup failed exit=$($clean.ExitCode)"}
   @{requestId=[string]$cleanupReq.requestId;completedAt=(Get-Date -Format o);expectedDeleteCount=$cleanupReq.expectedDeleteCount}|ConvertTo-Json|Set-Content $cleanupStatePath -Encoding UTF8
   Say "NOTE semantic cleanup completed id=$($cleanupReq.requestId)"
  }else{Say "NOTE semantic cleanup already completed id=$doneId"}
 }
}catch{Say ('NOTE CLEANUP RETRYABLE '+$_.Exception.Message)}
try{
 $req=J 'sidehustle-autopublish/windows_publication_request.json';$paid=@($req.paidNote.ids);$free=@($req.freeNote.ids);$booth=@($req.BOOTH.ids);if($worldsimMode){$paid=@();$free=@()};Say "request date=$($req.date) paid=$($paid.Count) free=$($free.Count) booth=$($booth.Count) nonce=$($req.requestNonce) worldsim=$worldsimMode"
 if(($paid.Count+$free.Count+$booth.Count)-eq 0){Say 'nothing outstanding';exit 0}
 $pq=J 'sidehustle-autopublish/note/queue/index.json';$fq=J 'sidehustle-autopublish/note/free_queue/index.json';$bq=J 'booth-autopublish/queue/index.json'
 foreach($z in @(@($paid,$pq,'paid'),@($free,$fq,'free'),@($booth,$bq,'booth'))){foreach($id in @($z[0])){$x=@($z[1].entries|?{$_.id-eq$id-or$_.queueId-eq$id})|select -First 1;if(-not$x){throw "$($z[2]) queue missing $id"};if(-not$x.publicUrlVerified-and-not$x.enabled){throw "$($z[2]) disabled $id"}}}
 KillStale;Task $NoteTask $false;Task $BoothTask $false;$tasksTouched=$true
 if(-not(Test-Path $Node)){throw 'node missing'}
 $nd=Join-Path $Root 'app\note';if(($paid.Count+$free.Count)-gt0-and-not(Test-Path $nd)){throw "canonical NOTE app root missing: $nd"}
 if($paid.Count-gt0){if(-not(Test-Path (Join-Path $nd 'note-remote-publisher.mjs'))){throw 'canonical NOTE paid publisher missing'};for($i=1;$i-le([Math]::Max(8,$paid.Count*3));$i++){Say "paid attempt $i";[void](Run $Node @('note-remote-publisher.mjs','publish-next') $nd 240);Start-Sleep 3}}
 if($free.Count-gt0){$fb=Join-Path $nd 'note-free-bot.mjs';if(-not(Test-Path $fb)){throw 'canonical NOTE free publisher missing'};$env:NOTE_FREE_BATCH=[string]$free.Count;try{for($i=1;$i-le4;$i++){Say "free attempt $i/4";[void](Run $Node @('note-free-bot.mjs','publish-batch') $nd 360);Start-Sleep 3}}finally{Remove-Item Env:NOTE_FREE_BATCH -ErrorAction SilentlyContinue}}
 if($booth.Count-gt0){$bd=Join-Path $Root 'app\booth';if(-not(Test-Path (Join-Path $bd 'booth-bot.mjs'))){throw "canonical BOOTH publisher missing: $bd\booth-bot.mjs"};$bot=Join-Path $bd 'booth-bot.mjs';$src=[IO.File]::ReadAllText($bot)
  if(@($booth|?{-not$src.Contains([string]$_)}).Count){$m=[regex]::Matches($src,'\b\d{3}_[a-z0-9_]+_os_\d{8}\b')|%{$_.Value}|select -Unique;$old=@($m|%{if($_-match'^(\d{3})_'){[pscustomobject]@{Id=$_;N=[int]$Matches[1]}}}|sort N -Descending|?{$booth-notcontains$_.Id}|select -First $booth.Count|sort N);$new=@($booth|sort{if($_-match'^(\d{3})_'){[int]$Matches[1]}else{0}});if($old.Count-ne$new.Count){throw 'BOOTH safe target alignment failed'};for($i=0;$i-lt$new.Count;$i++){$src=$src.Replace([string]$old[$i].Id,[string]$new[$i])};foreach($id in $new){if(-not$src.Contains([string]$id)){throw "BOOTH patch missing $id"}};[IO.File]::WriteAllText($bot,$src,[Text.UTF8Encoding]::new($false));Say 'BOOTH targets aligned to canonical request'}
  $syntax=Run $Node @('--check','booth-bot.mjs') $bd 60;if($syntax.ExitCode-ne0){throw 'BOOTH syntax check failed'}
  if(Test-Path $Npm){$pre=Run $Npm @('run','preflight') $bd 300;if($pre.ExitCode-ne0){Say 'BOOTH preflight failed; publish attempts continue for reconciliation-safe recovery'};for($i=1;$i-le([Math]::Max(8,$booth.Count*2));$i++){Say "booth attempt $i";[void](Run $Npm @('run','publish') $bd 360);Start-Sleep 3}}else{for($i=1;$i-le([Math]::Max(8,$booth.Count*2));$i++){[void](Run $Node @('booth-bot.mjs','publish-next') $bd 360);Start-Sleep 3}}
 }
 Say 'direct debt cycle completed'
}catch{Say ('FATAL '+$_.Exception.Message);exit 1}
finally{if($tasksTouched){if($worldsimMode){foreach($legacy in $LegacyNoteTasks){try{Disable-ScheduledTask -TaskName $legacy -ErrorAction SilentlyContinue|Out-Null}catch{}};Say 'legacy NOTE publishers remain disabled for AI World Observatory'}else{Task $NoteTask $true};Task $BoothTask $true;Say 'scheduled task state finalized'}}
