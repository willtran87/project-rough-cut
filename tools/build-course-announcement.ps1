$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$repo = Split-Path $PSScriptRoot -Parent
$sourceDir = Join-Path $repo 'assets/audio/course-announcement'
$runtimeDir = Join-Path $repo 'web/assets/audio'
New-Item -ItemType Directory -Force -Path $sourceDir,$runtimeDir | Out-Null
$sourcePath = Join-Path $sourceDir 'course-secured-source.wav'
$runtimePath = Join-Path $runtimeDir 'course-secured.ogg'
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $speaker.SelectVoice('Microsoft David Desktop')
  $speaker.Rate = -1
  $speaker.Volume = 100
  $speaker.SetOutputToWaveFile($sourcePath)
  $speaker.Speak('The course is now secured.')
} finally { $speaker.Dispose() }
& ffmpeg -hide_banner -loglevel error -y -i $sourcePath -af 'highpass=f=280,lowpass=f=3400,loudnorm=I=-20:TP=-3:LRA=4' -c:a libopus -b:a 48k $runtimePath
if ($LASTEXITCODE -ne 0) { throw 'Announcement encoding failed' }
Get-Item -LiteralPath $runtimePath | Select-Object FullName,Length
