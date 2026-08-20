/**
 * 纯 Node 将 logo 设计稿光栅化为 PNG（无第三方依赖）。
 * 直接复刻 assets/logo.svg 的图元（圆角方块渐变 + 柔光 + 轨道环 + 火花 + 中心轴），
 * 采用设计空间 512 坐标，HR 超采样后降采样得到抗锯齿结果。
 *
 * 用法：node tools/genicon.js [size,...]
 * 默认生成 1024 / 512 / 144。
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// ---------- CRC32 ----------
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // raw scanlines with filter byte 0
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = zlib.deflateSync(raw)
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- 设计稿图元（设计空间 512） ----------
const STOPS = [
  { t: 0.0, c: [0x1e, 0x29, 0x3b] },
  { t: 0.55, c: [0x7c, 0x3a, 0xed] },
  { t: 1.0, c: [0xc0, 0x26, 0xd3] },
]
function gradient(dx, dy) {
  let t = (dx + dy) / 1024
  if (t < 0) t = 0
  if (t > 1) t = 1
  let a = STOPS[0]
  let b = STOPS[STOPS.length - 1]
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (t >= STOPS[i].t && t <= STOPS[i + 1].t) {
      a = STOPS[i]
      b = STOPS[i + 1]
      break
    }
  }
  const span = b.t - a.t || 1
  const f = (t - a.t) / span
  return [
    Math.round(a.c[0] + (b.c[0] - a.c[0]) * f),
    Math.round(a.c[1] + (b.c[1] - a.c[1]) * f),
    Math.round(a.c[2] + (b.c[2] - a.c[2]) * f),
  ]
}

function blend(dst, r, g, b, a) {
  // a in 0..1
  dst[0] = Math.round(r * a + dst[0] * (1 - a))
  dst[1] = Math.round(g * a + dst[1] * (1 - a))
  dst[2] = Math.round(b * a + dst[2] * (1 - a))
  dst[3] = Math.max(dst[3], Math.round(a * 255))
}

function dist(ax, ay, bx, by) {
  const dx = ax - bx
  const dy = ay - by
  return Math.sqrt(dx * dx + dy * dy)
}

function pointInPoly(x, y, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0]
    const yi = pts[i][1]
    const xj = pts[j][0]
    const yj = pts[j][1]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

const GLOW = [
  [256, 118], [292, 224], [398, 256], [292, 288], [256, 394], [220, 288], [114, 256], [220, 224],
]
const SPARK = [
  [256, 136], [288, 224], [376, 256], [288, 288], [256, 376], [224, 288], [136, 256], [224, 224],
]

function insideClip(x, y, w, h, r) {
  if (x < 0 || x >= w || y < 0 || y >= h) return false
  if (x < r && y < r) return dist(x, y, r, r) <= r
  if (x > w - r && y < r) return dist(x, y, w - r, r) <= r
  if (x < r && y > h - r) return dist(x, y, r, h - r) <= r
  if (x > w - r && y > h - r) return dist(x, y, w - r, h - r) <= r
  return true
}

function render(size, ss) {
  const HR = size * ss
  const k = HR / 512
  const buf = Buffer.alloc(HR * HR * 4) // RGBA, 0 = transparent
  const px = new Uint8Array(4)
  for (let py = 0; py < HR; py++) {
    const dy = (py + 0.5) / k
    for (let pxx = 0; pxx < HR; pxx++) {
      const dx = (pxx + 0.5) / k
      const off = (py * HR + pxx) * 4
      if (!insideClip(dx, dy, 512, 512, 120)) continue
      const g = gradient(dx, dy)
      px[0] = g[0]
      px[1] = g[1]
      px[2] = g[2]
      px[3] = 255
      // 柔光
      if (dist(dx, dy, 140, 110) <= 300) blend(px, 255, 255, 255, 0.1)
      // 轨道环 stroke
      const dOrbit = dist(dx, dy, 256, 256)
      if (Math.abs(dOrbit - 152) <= 3) blend(px, 255, 255, 255, 0.28)
      // 探索点
      if (dist(dx, dy, 387, 179) <= 11) blend(px, 255, 255, 255, 1)
      // 火花微光
      if (pointInPoly(dx, dy, GLOW)) blend(px, 255, 255, 255, 0.16)
      // 火花主体
      if (pointInPoly(dx, dy, SPARK)) blend(px, 255, 255, 255, 1)
      // 中心轴
      if (dist(dx, dy, 256, 256) <= 17) blend(px, 0x7c, 0x3a, 0xed, 1)
      buf[off] = px[0]
      buf[off + 1] = px[1]
      buf[off + 2] = px[2]
      buf[off + 3] = px[3]
    }
  }
  // 降采样（box average）得到抗锯齿
  const out = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const sxhr = x * ss + sx
          const syhr = y * ss + sy
          const o = (syhr * HR + sxhr) * 4
          r += buf[o]
          g += buf[o + 1]
          b += buf[o + 2]
          a += buf[o + 3]
        }
      }
      const n = ss * ss
      const oo = (y * size + x) * 4
      out[oo] = Math.round(r / n)
      out[oo + 1] = Math.round(g / n)
      out[oo + 2] = Math.round(b / n)
      out[oo + 3] = Math.round(a / n)
    }
  }
  return out
}

const sizes = process.argv.slice(2).map((s) => parseInt(s, 10)).filter((n) => n > 0)
const targets = sizes.length ? sizes : [1024, 512, 144]
const outDir = path.resolve(__dirname, '..', 'assets')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

for (const s of targets) {
  const ss = s >= 512 ? 3 : 4
  const rgba = render(s, ss)
  const png = encodePNG(s, s, rgba)
  const file = path.join(outDir, `logo-${s}.png`)
  fs.writeFileSync(file, png)
  console.log('wrote', file, png.length, 'bytes')
}
