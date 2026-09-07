$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$Root='C:\SIDEHUSTLE_AUTO'
$LogDir=Join-Path $Root 'logs'; New-Item -ItemType Directory -Force -Path $LogDir|Out-Null
$Log=Join-Path $LogDir 'run_current_debt.log'
$Raw='https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/'
$Node='C:\Program Files\nodejs\node.exe'; $Npm='C:\Program Files\nodejs\npm.cmd'
$NoteTask='NOTE_RemoteQueue_30min'; $BoothTask='BOOTH_RemoteQueue_30min'
function Say([string]$s){$x='['+(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')+'] '+$s;Write-Host $x;Add-Content $Log $x -Encoding UTF8}
function J([string]$p){Invoke-RestMethod -UseBasicParsing -Headers @{'Cache-Control'='no-cache';'User-Agent'='SIDEHUSTLE-DEBT/2.0'} -Uri ($Raw+$p+'?t='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())}
function Task([string]$n,[bool]$on){try{$t=Get-ScheduledTask -TaskName $n -ErrorAction Stop;try{Stop-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue}catch{};$s=$t.Settings;$s.DisallowStartIfOnBatteries=$false;$s.StopIfGoingOnBatteries=$false;$s.StartWhenAvailable=$true;Set-ScheduledTask -TaskName $n -Settings $s|Out-Null;if($on){Enable-ScheduledTask -TaskName $n|Out-Null}else{Disable-ScheduledTask -TaskName $n|Out-Null};Say "task $n enabled=$on"}catch{Say "task warning $n $($_.Exception.Message)"}}
function KillStale(){try{Get-CimInstance Win32_Process|%{$c=[string]$_.CommandLine;if($_.ProcessId-ne$PID-and$c-match'(?i)run_note_v8|run_booth_v8|pipeline-guardian|note-remote-publisher|note-free-bot|booth-bot'){try{taskkill /PID $_.ProcessId /T /F *> $null;Say "stopped stale pid=$($_.ProcessId)"}catch{}}}}catch{}}
function Run([string]$f,[string[]]$a,[string]$wd,[int]$sec){$o=Join-Path $env:TEMP ([guid]::NewGuid().ToString('N')+'.out');$e=$o+'.err';try{$p=Start-Process $f -ArgumentList $a -WorkingDirectory $wd -NoNewWindow -PassThru -RedirectStandardOutput $o -RedirectStandardError $e;if(-not$p.WaitForExit($sec*1000)){taskkill /PID $p.Id /T /F *> $null;$rc=124}else{$rc=$p.ExitCode};$txt='';if(Test-Path $o){$txt+=[IO.File]::ReadAllText($o)};if(Test-Path $e){$txt+=[IO.File]::ReadAllText($e)};if($txt){Write-Host $txt.TrimEnd();Add-Content $Log $txt -Encoding UTF8};Say "exit=$rc $f $($a-join' ')";[pscustomobject]@{ExitCode=$rc;Text=$txt}}finally{Remove-Item $o,$e -Force -ErrorAction SilentlyContinue}}
Set-Content $Log ('=== CURRENT DEBT '+(Get-Date -Format o)+' ===') -Encoding UTF8
$tasksTouched=$false
try{
 $req=J 'sidehustle-autopublish/windows_publication_request.json';$paid=@($req.paidNote.ids);$free=@($req.freeNote.ids);$booth=@($req.BOOTH.ids);Say "request date=$($req.date) paid=$($paid.Count) free=$($free.Count) booth=$($booth.Count)"
 if(($paid.Count+$free.Count+$booth.Count)-eq 0){Say 'nothing outstanding';exit 0}
 $pq=J 'sidehustle-autopublish/note/queue/index.json';$fq=J 'sidehustle-autopublish/note/free_queue/index.json';$bq=J 'booth-autopublish/queue/index.json'
 foreach($z in @(@($paid,$pq,'paid'),@($free,$fq,'free'),@($booth,$bq,'booth'))){foreach($id in @($z[0])){$x=@($z[1].entries|?{$_.id-eq$id-or$_.queueId-eq$id})|select -First 1;if(-not$x){throw "$($z[2]) queue missing $id"};if(-not$x.publicUrlVerified-and-not$x.enabled){throw "$($z[2]) disabled $id"}}}
 KillStale;Task $NoteTask $false;Task $BoothTask $false;$tasksTouched=$true
 if(-not(Test-Path $Node)){throw 'node missing'}
 $nd=Join-Path $Root 'app\note';if(-not(Test-Path (Join-Path $nd 'note-remote-publisher.mjs'))){$nd='C:\note-business\note_auto_publisher_windows\note_auto_publisher'};if(-not(Test-Path (Join-Path $nd 'note-remote-publisher.mjs'))){throw 'NOTE publisher missing'}
 for($i=1;$i-le12;$i++){Say "paid attempt $i/12";[void](Run $Node @('note-remote-publisher.mjs','publish-next') $nd 240);Start-Sleep 3}
 if($free.Count){$env:NOTE_FREE_BATCH=[string]$free.Count;try{for($i=1;$i-le4;$i++){Say "free attempt $i/4";[void](Run $Node @('note-free-bot.mjs','publish-batch') $nd 360);Start-Sleep 3}}finally{Remove-Item Env:NOTE_FREE_BATCH -ErrorAction SilentlyContinue}}
 $bd=Join-Path $Root 'app\booth';if(-not(Test-Path (Join-Path $bd 'booth-bot.mjs'))){$bd=Join-Path $env:USERPROFILE 'Downloads\BOOTH_AUTO_PUBLISHER_v3_ASCII'};if(-not(Test-Path (Join-Path $bd 'booth-bot.mjs'))){throw 'BOOTH publisher missing'};$bot=Join-Path $bd 'booth-bot.mjs';$src=[IO.File]::ReadAllText($bot)
 if(@($booth|?{-not$src.Contains([string]$_)}).Count){$m=[regex]::Matches($src,'\b\d{3}_[a-z0-9_]+_os_\d{8}\b')|%{$_.Value}|select -Unique;$old=@($m|%{if($_-match'^(\d{3})_'){[pscustomobject]@{Id=$_;N=[int]$Matches[1]}}}|sort N -Descending|?{$booth-notcontains$_.Id}|select -First $booth.Count|sort N);$new=@($booth|sort{if($_-match'^(\d{3})_'){[int]$Matches[1]}else{0}});if($old.Count-ne$new.Count){throw 'BOOTH safe target alignment failed'};for($i=0;$i-lt$new.Count;$i++){$src=$src.Replace([string]$old[$i].Id,[string]$new[$i])};foreach($id in $new){if(-not$src.Contains([string]$id)){throw "BOOTH patch missing $id"}};[IO.File]::WriteAllText($bot,$src,[Text.UTF8Encoding]::new($false));Say 'BOOTH targets aligned to canonical request'}
 [void](Run $Node @('--check','booth-bot.mjs') $bd 60)
 if(Test-Path $Npm){[void](Run $Npm @('run','preflight') $bd 300);for($i=1;$i-le10;$i++){Say "booth attempt $i/10";[void](Run $Npm @('run','publish') $bd 360);Start-Sleep 3}}else{for($i=1;$i-le10;$i++){[void](Run $Node @('booth-bot.mjs','publish-next') $bd 360);Start-Sleep 3}}
 Say 'direct debt cycle completed'
}catch{Say ('FATAL '+$_.Exception.Message);exit 1}
finally{if($tasksTouched){Task $NoteTask $true;Task $BoothTask $true;Say 'scheduled publishers restored'}}
