# gen-audio.ps1 — 用 Windows SAPI TTS 生成语音线索素材 → wav → (wav2mp3.js) → assets/audio/*.mp3
# 用法：powershell -ExecutionPolicy Bypass -File tools\gen-audio.ps1
# 素材清单（18 条）：
#   d0..d9   数字 0-9（digit-n2 数字流 / dual-square 的 0）
#   la..lx   字母 A D F J K L S X（aud-cpt 字母流，目标字母为 K）
$ErrorActionPreference = 'Stop'
$wavDir = Join-Path $PSScriptRoot 'tmp-audio'
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'assets\audio'
New-Item -ItemType Directory -Force -Path $wavDir, $outDir | Out-Null

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
# 英文发音用 en-US 声音（Zira），找不到时回退到第一个 en- 声音
try {
  $synth.SelectVoice('Microsoft Zira Desktop')
} catch {
  $en = $synth.GetInstalledVoices() |
    Where-Object { $_.Enabled -and $_.VoiceInfo.Culture -like 'en-*' } |
    Select-Object -First 1
  if (-not $en) { throw 'no en-* voice installed' }
  $synth.SelectVoice($en.VoiceInfo.Name)
}
$synth.Rate = 1   # 略快，避免单字音过长

$items = @(
  @{ key = 'd0'; text = '0' },
  @{ key = 'd1'; text = '1' },
  @{ key = 'd2'; text = '2' },
  @{ key = 'd3'; text = '3' },
  @{ key = 'd4'; text = '4' },
  @{ key = 'd5'; text = '5' },
  @{ key = 'd6'; text = '6' },
  @{ key = 'd7'; text = '7' },
  @{ key = 'd8'; text = '8' },
  @{ key = 'd9'; text = '9' },
  @{ key = 'la'; text = 'A' },
  @{ key = 'ld'; text = 'D' },
  @{ key = 'lf'; text = 'F' },
  @{ key = 'lj'; text = 'J' },
  @{ key = 'lk'; text = 'K' },
  @{ key = 'll'; text = 'L' },
  @{ key = 'ls'; text = 'S' },
  @{ key = 'lx'; text = 'X' }
)

foreach ($it in $items) {
  $wav = Join-Path $wavDir ($it.key + '.wav')
  $synth.SetOutputToWaveFile($wav)
  $synth.Speak($it.text)
  $synth.SetOutputToNull()
  Write-Host ('tts ' + $it.key + '.wav <- "' + $it.text + '"')
}
$synth.Dispose()

node (Join-Path $PSScriptRoot 'wav2mp3.js')
if ($LASTEXITCODE -ne 0) { throw 'wav2mp3 failed' }
Write-Host ('done: ' + $items.Count + ' clips -> ' + $outDir)
