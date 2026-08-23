/**
 * 画布渲染工具：把结果页里的「趋势图 / 结果卡片」绘制逻辑收敛到这里，
 * 与页面解耦，便于复用与单测。画布无法使用 CSS 变量，因此颜色由
 * utils/theme 的 isDark 统一推导（避免与 app.wxss 的调色板重复定义）。
 */

const { isDark } = require('./theme')

// 兼容新旧版本获取 DPR
function getDPR() {
  try {
    if (wx.getWindowInfo) {
      const winInfo = wx.getWindowInfo()
      if (winInfo.pixelRatio) return winInfo.pixelRatio
    }
  } catch {}
  try {
    return wx.getSystemInfoSync().pixelRatio
  } catch {}
  return 2
}

// 画布取色：暗色模式下用浅色，亮色模式下用深色
function canvasPalette() {
  const dark = isDark()
  return {
    bg: dark ? '#0f172a' : '#1e293b',
    text: '#ffffff',
    textSoft: 'rgba(255,255,255,0.8)',
    textFaint: 'rgba(255,255,255,0.5)',
    grid: dark ? '#334155' : '#e2e8f0',
    label: dark ? '#cbd5e1' : '#475569',
    date: dark ? '#94a3b8' : '#64748b',
  }
}

// 趋势折线图（ctx 已按 dpr 缩放，W/H 为 CSS 像素）
function renderTrend(ctx, W, H, opts) {
  const { values, color, dates } = opts
  const pal = canvasPalette()
  ctx.clearRect(0, 0, W, H)
  const pad = 26
  const cw = W - pad * 2
  const ch = H - pad * 2
  const vals = values || []
  let min = Math.min.apply(null, vals.length ? vals : [0])
  let max = Math.max.apply(null, vals.length ? vals : [0])
  if (min === max) {
    min -= 1
    max += 1
  }
  const range = max - min
  const n = vals.length
  const xAt = (i) => pad + (n === 1 ? cw / 2 : (cw * i) / (n - 1))
  const yAt = (v) => pad + ch - ((v - min) / range) * ch
  ctx.strokeStyle = pal.grid
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(pad, pad + ch)
  ctx.lineTo(pad + cw, pad + ch)
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  vals.forEach((v, i) => {
    const x = xAt(i)
    const y = yAt(v)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.font = '20px sans-serif'
  vals.forEach((v, i) => {
    const x = xAt(i)
    const y = yAt(v)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = pal.label
    ctx.fillText(String(v), x, y - 12)
  })
  if (dates && dates.length === vals.length && vals.length <= 8) {
    ctx.fillStyle = pal.date
    ctx.font = '15px sans-serif'
    vals.forEach((v, i) => {
      ctx.fillText(dates[i], xAt(i), H - 6)
    })
  }
}

// 结果分享卡片（canvas 未缩放，函数内部按 dpr 处理）
function renderCard(canvas, ctx, W, H, opts, done) {
  const { meta, primaryValue, primaryLabel, levelText, levelColor, levelColorText, dims } = opts
  const pal = canvasPalette()
  const dpr = getDPR()
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)
  ctx.fillStyle = pal.bg
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.fillStyle = pal.text
  ctx.font = '28px sans-serif'
  ctx.fillText('心智探索局', W / 2, 70)
  ctx.fillStyle = meta.color
  ctx.font = '34px sans-serif'
  ctx.fillText(meta.name, W / 2, 130)
  ctx.fillStyle = pal.text
  ctx.font = '72px sans-serif'
  ctx.fillText(primaryValue, W / 2, 250)
  ctx.fillStyle = pal.textSoft
  ctx.font = '26px sans-serif'
  ctx.fillText(primaryLabel, W / 2, 300)
  ctx.fillStyle = levelColor
  ctx.fillRect(W / 2 - 90, 330, 180, 46)
  ctx.fillStyle = levelColorText
  ctx.font = '26px sans-serif'
  ctx.fillText(levelText, W / 2, 362)
  const d = dims || []
  if (d.length) {
    const startY = 430
    const rowH = 40
    const maxRows = Math.min(d.length, 8)
    const barX = 170
    const barW = 300
    ctx.textAlign = 'left'
    for (let i = 0; i < maxRows; i++) {
      const d0 = d[i]
      const y = startY + i * rowH
      const label = (d0.name || d0.key || '').slice(0, 6)
      // 双极维度（MBTI 等）：左/右百分比分裂条
      if (d0.leftPercent != null && d0.rightPercent != null) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.font = '20px sans-serif'
        ctx.fillText(label, 40, y)
        ctx.fillStyle = 'rgba(255,255,255,0.18)'
        ctx.fillRect(barX, y - 14, barW, 14)
        ctx.fillStyle = meta.color
        ctx.fillRect(barX, y - 14, (barW * Math.min(100, d0.leftPercent)) / 100, 14)
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.fillRect(barX + (barW * Math.min(100, d0.leftPercent)) / 100, y - 14, (barW * Math.min(100, d0.rightPercent)) / 100, 14)
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.textAlign = 'right'
        ctx.fillText((d0.dominant || '') + ' ' + d0.leftPercent + '/' + d0.rightPercent, barX + barW + 10, y)
        ctx.textAlign = 'left'
        continue
      }
      if (d0.percent == null) continue
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = '20px sans-serif'
      ctx.fillText(label, 40, y)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fillRect(barX, y - 14, barW, 14)
      ctx.fillStyle = meta.color
      ctx.fillRect(barX, y - 14, (barW * Math.min(100, d0.percent || 0)) / 100, 14)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.textAlign = 'right'
      ctx.fillText((d0.percent || 0) + '%', barX + barW + 40, y)
      ctx.textAlign = 'left'
    }
    ctx.textAlign = 'center'
  }
  const dt = new Date()
  const date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate()
  ctx.fillStyle = pal.textFaint
  ctx.font = '22px sans-serif'
  ctx.fillText(date, W / 2, H - 40)
  wx.canvasToTempFilePath({ canvas, success: (r) => done(r.tempFilePath), done: () => done(null) })
}

// 通用内容卡片（测评/方法/结果均可复用）：标题 + 副标题 + 多行 + 页脚
function renderContentCard(canvas, ctx, W, H, opts, done) {
  const { color, icon, title, subtitle, lines, footer } = opts
  const pal = canvasPalette()
  const dpr = getDPR()
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)
  ctx.fillStyle = pal.bg
  ctx.fillRect(0, 0, W, H)
  // 顶部色条
  ctx.fillStyle = color || '#7c3aed'
  ctx.fillRect(0, 0, W, 12)
  ctx.textAlign = 'center'
  ctx.fillStyle = pal.text
  ctx.font = '30px sans-serif'
  ctx.fillText('心智探索局', W / 2, 70)
  // 图标
  if (icon) {
    ctx.font = '64px sans-serif'
    ctx.fillText(icon, W / 2, 160)
  }
  ctx.fillStyle = pal.text
  ctx.font = '40px sans-serif'
  ctx.fillText(title || '', W / 2, 230)
  if (subtitle) {
    ctx.fillStyle = pal.textSoft
    ctx.font = '24px sans-serif'
    ctx.fillText(subtitle, W / 2, 272)
  }
  // 多行
  const ls = lines || []
  let y = 330
  ctx.textAlign = 'left'
  ls.slice(0, 6).forEach((ln) => {
    ctx.fillStyle = pal.textSoft
    ctx.font = '22px sans-serif'
    ctx.fillText(ln.label || '', 50, y)
    ctx.fillStyle = pal.text
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(ln.value != null ? String(ln.value) : '', W - 50, y)
    ctx.textAlign = 'left'
    y += 44
  })
  if (footer) {
    ctx.fillStyle = pal.textFaint
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(footer, W / 2, H - 36)
  }
  wx.canvasToTempFilePath({ canvas, success: (r) => done(r.tempFilePath), done: () => done(null) })
}

module.exports = { canvasPalette, renderTrend, renderCard, renderContentCard }
