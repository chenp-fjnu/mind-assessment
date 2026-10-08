// wav2mp3.js — 将 tools/tmp-audio/*.wav（16bit PCM）转码为 assets/audio/*.mp3
// 语音素材由 tools/gen-audio.ps1（Windows SAPI TTS）生成；lamejs 为纯 JS 编码器，仅构建期使用。
// 运行：node tools/wav2mp3.js
const fs = require('fs')
const path = require('path')
// lamejs 1.2.1 的 src 构建按浏览器脚本顺序假设了几个模块级全局（MPEGMode/Lame），
// Node 下需手动补到 global 才能正常初始化编码器。
global.MPEGMode = require('lamejs/src/js/MPEGMode.js')
global.Lame = require('lamejs/src/js/Lame.js')
global.BitStream = require('lamejs/src/js/BitStream.js')
const lamejs = require('lamejs')

const ROOT = path.join(__dirname, '..')
const WAV_DIR = path.join(__dirname, 'tmp-audio')
const OUT_DIR = path.join(ROOT, 'assets', 'audio')
const Kbps = 48

function readWav(file) {
  const buf = fs.readFileSync(file)
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('not a RIFF/WAVE file: ' + file)
  }
  let offset = 12
  let fmt = null
  let data = null
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4)
    const size = buf.readUInt32LE(offset + 4)
    if (id === 'fmt ') {
      fmt = {
        channels: buf.readUInt16LE(offset + 10),
        sampleRate: buf.readUInt32LE(offset + 12),
        bits: buf.readUInt16LE(offset + 22),
      }
    } else if (id === 'data') {
      data = buf.slice(offset + 8, offset + 8 + size)
    }
    offset += 8 + size + (size % 2)
  }
  if (!fmt || !data) throw new Error('missing fmt/data chunk: ' + file)
  if (fmt.bits !== 16) throw new Error('only 16-bit PCM supported: ' + file)
  if (fmt.channels !== 1) throw new Error('only mono supported: ' + file)
  let samples = new Int16Array(data.buffer, data.byteOffset, Math.floor(data.length / 2))
  samples = trimSilence(samples, fmt.sampleRate)
  return { sampleRate: fmt.sampleRate, samples }
}

// 裁掉首尾静音（保留少量余量），缩短线索时长、改善游戏节奏
function trimSilence(samples, sampleRate) {
  const threshold = 500
  const keepStart = Math.floor(sampleRate * 0.03)
  const keepEnd = Math.floor(sampleRate * 0.12)
  let start = 0
  while (start < samples.length && Math.abs(samples[start]) <= threshold) start++
  let end = samples.length - 1
  while (end > 0 && Math.abs(samples[end]) <= threshold) end--
  if (end <= start) return samples
  const from = Math.max(0, start - keepStart)
  const to = Math.min(samples.length - 1, end + keepEnd)
  return samples.slice(from, to + 1)
}

function encode(name, wav) {
  const enc = new lamejs.Mp3Encoder(1, wav.sampleRate, Kbps)
  const chunks = []
  const block = 1152
  for (let i = 0; i < wav.samples.length; i += block) {
    const part = wav.samples.subarray(i, i + block)
    const out = enc.encodeBuffer(part)
    if (out.length) chunks.push(Buffer.from(out))
  }
  const end = enc.flush()
  if (end.length) chunks.push(Buffer.from(end))
  const mp3 = Buffer.concat(chunks)
  fs.writeFileSync(path.join(OUT_DIR, name + '.mp3'), mp3)
  return mp3.length
}

function main() {
  if (!fs.existsSync(WAV_DIR)) {
    console.log('no wav dir:', WAV_DIR)
    return
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const files = fs.readdirSync(WAV_DIR).filter((f) => f.endsWith('.wav'))
  let total = 0
  files.forEach((f) => {
    const name = path.basename(f, '.wav')
    const size = encode(name, readWav(path.join(WAV_DIR, f)))
    total += size
    console.log(name + '.mp3  ' + size + ' bytes')
  })
  console.log('total: ' + files.length + ' files, ' + total + ' bytes')
}

main()
