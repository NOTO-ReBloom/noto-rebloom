$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$Target = 'C:\note-business\note_auto_publisher_windows\note_auto_publisher'
$RawBase = 'https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/'
$BundleUrl = $RawBase + 'sidehustle-autopublish/note/free_publisher/note-free-bot.mjs.gz.b64'
$ExpectedRuntimeSha256 = '9e85ecc1940c688bce9bf624e596cd3b3812f14d4ee377a5733f23aa652953d9'
$Runtime = Join-Path $Target 'note-free-bot.mjs'
$Wrapper = Join-Path $Target 'publish_free_once.cmd'
$TempB64 = Join-Path $env:TEMP 'note-free-bot.mjs.gz.b64'
$TempGz = Join-Path $env:TEMP 'note-free-bot.mjs.gz'

Write-Host '================================================'
Write-Host ' NOTE FREE PUBLISHER - ONE RUN INSTALL + CATCHUP'
Write-Host '================================================'

if (!(Test-Path $Target)) { throw "Active NOTE publisher folder not found: $Target" }
if (!(Test-Path (Join-Path $Target 'config.json'))) { throw 'Active NOTE config.json not found. Paid publisher installation must remain intact.' }

$Node = (Get-Command node.exe -ErrorAction SilentlyContinue).Source
if (!$Node -and (Test-Path "$env:ProgramFiles\nodejs\node.exe")) { $Node = "$env:ProgramFiles\nodejs\node.exe" }
if (!$Node) { throw 'node.exe not found' }

Push-Location $Target
try {
  if (!(Test-Path (Join-Path $Target 'node_modules'))) { throw 'Existing NOTE node_modules folder not found. Refusing to modify the paid publisher installation.' }

  Write-Host '[1/7] Downloading signed-by-hash cloud runtime bundle...'
  Invoke-WebRequest -UseBasicParsing -Uri $BundleUrl -OutFile $TempB64
  $b64 = [IO.File]::ReadAllText($TempB64).Trim()
  [IO.File]::WriteAllBytes($TempGz, [Convert]::FromBase64String($b64))

  Write-Host '[2/7] Decompressing runtime...'
  $src = [IO.File]::OpenRead($TempGz)
  try {
    $gz = New-Object IO.Compression.GzipStream($src,[IO.Compression.CompressionMode]::Decompress)
    try {
      $dst = [IO.File]::Create($Runtime)
      try { $gz.CopyTo($dst) } finally { $dst.Dispose() }
    } finally { $gz.Dispose() }
  } finally { $src.Dispose() }

  Write-Host '[3/7] Verifying SHA-256 and JavaScript syntax...'
  $actual = (Get-FileHash -Algorithm SHA256 $Runtime).Hash.ToLowerInvariant()
  if ($actual -ne $ExpectedRuntimeSha256) { Remove-Item $Runtime -Force -ErrorAction SilentlyContinue; throw "Runtime SHA mismatch: $actual" }
  & $Node --check $Runtime
  if ($LASTEXITCODE -ne 0) { throw 'note-free-bot.mjs syntax check failed' }

  Write-Host '[4/7] Verifying queue/network/profile compatibility...'
  & $Node $Runtime diagnose
  if ($LASTEXITCODE -ne 0) { throw 'Free NOTE publisher diagnose failed' }

  Write-Host '[5/7] Writing isolated runner...'
  @"
@echo off
setlocal
cd /d "$Target"
set "NOTE_FREE_BATCH=1"
"$Node" "$Runtime" publish-batch >> "logs\free_task.log" 2>&1
exit /b %ERRORLEVEL%
"@ | Set-Content -Encoding ASCII $Wrapper

  Write-Host '[6/7] Creating two staggered daily free publication tasks...'
  schtasks /Create /F /SC DAILY /ST 08:05 /TN 'NOTE_FreePublish_0805' /TR "cmd.exe /c `"$Wrapper`"" | Out-Null
  schtasks /Create /F /SC DAILY /ST 17:05 /TN 'NOTE_FreePublish_1705' /TR "cmd.exe /c `"$Wrapper`"" | Out-Null

  Write-Host '[7/7] Running immediate catch-up batch (up to six ready free articles)...'
  $env:NOTE_FREE_BATCH='6'
  & $Node $Runtime publish-batch
  $rc=$LASTEXITCODE
  Remove-Item Env:NOTE_FREE_BATCH -ErrorAction SilentlyContinue

  Write-Host ''
  if ($rc -eq 0) {
    Write-Host 'FREE_NOTE_INSTALL_AND_CATCHUP_OK'
    Write-Host 'Strict success is logged only after reader-visible URL + exact title + free state + dedicated cover are verified.'
  } else {
    Write-Host "FREE_NOTE_CATCHUP_EXIT=$rc"
    Write-Host 'The scheduled tasks remain installed so recoverable publication failures can retry automatically.'
  }
  exit $rc
}
finally {
  Pop-Location
  Remove-Item $TempB64,$TempGz -Force -ErrorAction SilentlyContinue
}
