/**
 * SPM 图形渲染工具（微信小程序 canvas 2d）
 * 支持形状：circle / square / triangle / diamond / hexagon / star / plus
 * 填充模式：solid / hollow / striped / dotted
 * 数据格式：cell = { bg, shapes: [{ type, size, color, rotation, fill, count }] }
 */

function shapePath(ctx, type, r) {
  ctx.beginPath()
  switch (type) {
    case 'circle':
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      break
    case 'square':
      ctx.rect(-r, -r, r * 2, r * 2)
      break
    case 'triangle':
      ctx.moveTo(0, -r)
      ctx.lineTo(r * 0.866, r * 0.5)
      ctx.lineTo(-r * 0.866, r * 0.5)
      ctx.closePath()
      break
    case 'diamond':
      ctx.moveTo(0, -r)
      ctx.lineTo(r, 0)
      ctx.lineTo(0, r)
      ctx.lineTo(-r, 0)
      ctx.closePath()
      break
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const px = Math.cos(a) * r
        const py = Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    case 'star':
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r : r * 0.42
        const a = (Math.PI / 5) * i - Math.PI / 2
        const px = Math.cos(a) * rr
        const py = Math.sin(a) * rr
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    case 'plus':
      const t = r * 0.38
      ctx.moveTo(-t, -r)
      ctx.lineTo(t, -r)
      ctx.lineTo(t, -t)
      ctx.lineTo(r, -t)
      ctx.lineTo(r, t)
      ctx.lineTo(t, t)
      ctx.lineTo(t, r)
      ctx.lineTo(-t, r)
      ctx.lineTo(-t, t)
      ctx.lineTo(-r, t)
      ctx.lineTo(-r, -t)
      ctx.lineTo(-t, -t)
      ctx.closePath()
      break
    default:
      ctx.arc(0, 0, r, 0, Math.PI * 2)
  }
}

function drawShape(ctx, shape, cx, cy, cellSize) {
  const r = (shape.size / 100) * (cellSize / 2) * 0.9
  if (r <= 0) return
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(((shape.rotation || 0) * Math.PI) / 180)
  ctx.lineWidth = Math.max(2, cellSize * 0.02)
  ctx.lineJoin = 'round'

  const fill = shape.fill || 'solid'
  shapePath(ctx, shape.type, r)

  if (fill === 'hollow') {
    ctx.strokeStyle = shape.color || '#1f2937'
    ctx.stroke()
  } else {
    ctx.fillStyle = shape.color || '#1f2937'
    ctx.fill()
    if (fill === 'striped') {
      ctx.save()
      ctx.clip()
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = Math.max(2, cellSize * 0.03)
      for (let i = -cellSize; i < cellSize; i += cellSize * 0.18) {
        ctx.beginPath()
        ctx.moveTo(i, -cellSize)
        ctx.lineTo(i + cellSize, cellSize)
        ctx.stroke()
      }
      ctx.restore()
    } else if (fill === 'dotted') {
      ctx.save()
      ctx.clip()
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      const step = cellSize * 0.16
      for (let yy = -cellSize; yy < cellSize; yy += step) {
        for (let xx = -cellSize; xx < cellSize; xx += step) {
          ctx.beginPath()
          ctx.arc(xx, yy, step * 0.28, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.restore()
    }
  }
  ctx.restore()
}

/** 绘制单个单元格（含 bg 与 shapes），区域为 (x, y, size, size) */
function drawCell(ctx, cell, x, y, size) {
  if (!cell) return
  ctx.save()
  ctx.translate(x, y)
  if (cell.bg) {
    ctx.fillStyle = cell.bg
    ctx.fillRect(0, 0, size, size)
  }
  const shapes = cell.shapes || []
  if (shapes.length === 1) {
    drawShape(ctx, shapes[0], size / 2, size / 2, size)
  } else if (shapes.length > 1) {
    const cols = Math.ceil(Math.sqrt(shapes.length))
    const rows = Math.ceil(shapes.length / cols)
    const cw = size / cols
    const ch = size / rows
    shapes.forEach((s, i) => {
      const cxi = (i % cols) * cw + cw / 2
      const cyi = Math.floor(i / cols) * ch + ch / 2
      const small = { ...s, size: s.size * 0.6 }
      drawShape(ctx, small, cxi, cyi, Math.min(cw, ch))
    })
  }
  ctx.restore()
}

module.exports = { drawCell, drawShape, shapePath }
