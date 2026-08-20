// 生成 tabBar 图标（纯 Node，无依赖）。运行：node tools/gen-tab-icons.js
// 输出到 wechat-miniprogram/assets/tabicons/{home,record,about}{,_on}.png
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const SIZE = 81

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
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}
function makePNG(px) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)
  ihdr.writeUInt32BE(SIZE, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 4 + 1)] = 0
    px.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, y * SIZE * 4 + SIZE * 4)
  }
  const idat = zlib.deflateSync(raw)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function newPx() {
  return Buffer.alloc(SIZE * SIZE * 4)
}
function setPx(px, x, y, c) {
  x = Math.round(x)
  y = Math.round(y)
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  px[i] = c[0]
  px[i + 1] = c[1]
  px[i + 2] = c[2]
  px[i + 3] = c[3]
}
function fillRect(px, x0, y0, x1, y1, c) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setPx(px, x, y, c)
}
function line(px, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1)
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  while (true) {
    setPx(px, x0, y0, c)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) { err -= dy; x0 += sx }
    if (e2 < dx) { err += dx; y0 += sy }
  }
}
function circleOutline(px, cx, cy, r, c) {
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180
    setPx(px, cx + (Math.cos(rad) * r), cy + (Math.sin(rad) * r), c)
  }
}
function fillTriangle(px, p0, p1, p2, c) {
  const minY = Math.floor(Math.min(p0[1], p1[1], p2[1]))
  const maxY = Math.ceil(Math.max(p0[1], p1[1], p2[1]))
  for (let y = minY; y <= maxY; y++) {
    const xs = []
    const edges = [[p0, p1], [p1, p2], [p2, p0]]
    for (const [a, b] of edges) {
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        const t = (y - a[1]) / (b[1] - a[1])
        xs.push(a[0] + t * (b[0] - a[0]))
      }
    }
    if (xs.length >= 2) {
      const xa = Math.floor(Math.min(xs[0], xs[1]))
      const xb = Math.ceil(Math.max(xs[0], xs[1]))
      for (let x = xa; x <= xb; x++) setPx(px, x, y, c)
    }
  }
}

const NORMAL = [100, 116, 139, 255]
const ACTIVE = [124, 58, 237, 255]

function drawHome(c) {
  const px = newPx()
  fillTriangle(px, [40, 14], [10, 44], [70, 44], c)
  fillRect(px, 22, 44, 58, 68, c)
  return px
}
function drawRecord(c) {
  const px = newPx()
  circleOutline(px, 40, 40, 24, c)
  line(px, 40, 40, 40, 24, c)
  line(px, 40, 40, 56, 40, c)
  return px
}
function drawAbout(c) {
  const px = newPx()
  circleOutline(px, 40, 38, 22, c)
  // i 的点：明显的实心圆，避免单像素丢失
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180
    fillRect(px, Math.round(40 + Math.cos(rad) * 4), Math.round(25 + Math.sin(rad) * 4), Math.round(40 + Math.cos(rad) * 4), Math.round(25 + Math.sin(rad) * 4), c)
  }
  // i 的竖线（加粗）
  fillRect(px, 37, 33, 43, 54, c)
  return px
}

const outDir = path.join(process.cwd(), 'assets', 'tabicons')
fs.mkdirSync(outDir, { recursive: true })
const files = {
  'home.png': drawHome(NORMAL),
  'home_on.png': drawHome(ACTIVE),
  'record.png': drawRecord(NORMAL),
  'record_on.png': drawRecord(ACTIVE),
  'about.png': drawAbout(NORMAL),
  'about_on.png': drawAbout(ACTIVE),
}
for (const [name, px] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), makePNG(px))
  console.log('wrote', name)
}
console.log('done')
