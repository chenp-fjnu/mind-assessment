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
    // 基础库 2.30.0+ 使用 wx.getDeviceInfo
    if (wx.getDeviceInfo) {
      const deviceInfo = wx.getDeviceInfo()
      if (deviceInfo.pixelRatio) return deviceInfo.pixelRatio
    }
  } catch (e) { void 0 }
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

// 测量用 ctx 代理：所有绘制方法均为空操作，仅保留 measureText 真实测量。
// 用于在「不分配大画布、不实际绘制」的前提下，复用 renderFullPageCard 的同一套
// 布局逻辑精确算出内容所需高度，避免魔法常量估算导致的截断/留白。
function makeMeasureCtx(realCtx) {
  const noop = () => {}
  return new Proxy(realCtx, {
    get(target, prop) {
      if (prop === 'measureText') return (t) => target.measureText(t)
      const orig = target[prop]
      if (typeof orig === 'function') return noop
      return orig
    },
    set(target, prop, val) {
      target[prop] = val
      return true
    },
  })
}

// 全页面内容渲染（结果页完整保存）：标题 + 所有区块
// measure=true 时只计算并返回内容高度（不缩放画布、不导出图片）
function renderFullPageCard(canvas, ctx, W, H, opts, done, measure) {
  const {
    meta,
    primaryValue,
    primaryLabel,
    levelText,
    levelColor,
    levelColorText,
    descText,
    testedTime,
    retestGap,
    timeText,
    groups,
    showGroups,
    showBipolar,
    showDims,
    showSubtests,
    dims,
    subtests,
    interpretations,
    showTrend,
    trendValues,
    trendDelta,
    trendDates,
    rangeDelta,
    firstValue,
    lastValue,
    firstSummary,
    lastSummary,
    catList,
    recommend,
    noteText,
    retakeHint,
  } = opts

  const pal = canvasPalette()
  const dpr = getDPR()
  if (!measure) {
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
  }

  ctx.fillStyle = pal.bg
  ctx.fillRect(0, 0, W, H)

  let y = 40
  const centerX = W / 2
  const leftX = 40
  const rightX = W - 40
  const contentW = W - 80

  // 顶部色条
  ctx.fillStyle = meta.color || '#7c3aed'
  ctx.fillRect(0, 0, W, 12)

  // 标题区
  ctx.textAlign = 'center'
  ctx.fillStyle = pal.text
  ctx.font = '28px sans-serif'
  ctx.fillText('心智探索局', centerX, y + 30)
  y += 50

  ctx.fillStyle = meta.color || '#7c3aed'
  ctx.font = '32px sans-serif'
  ctx.fillText(meta.name || '', centerX, y)
  y += 48

  ctx.fillStyle = pal.text
  ctx.font = '64px sans-serif'
  ctx.fillText(String(primaryValue), centerX, y)
  y += 80

  ctx.fillStyle = pal.textSoft
  ctx.font = '24px sans-serif'
  ctx.fillText(primaryLabel || '', centerX, y)
  y += 40

  // 等级徽章
  if (levelText) {
    ctx.fillStyle = levelColor
    const badgeW = 200
    const badgeH = 48
    ctx.fillRect(centerX - badgeW / 2, y, badgeW, badgeH)
    ctx.fillStyle = levelColorText
    ctx.font = '24px sans-serif'
    ctx.fillText(levelText, centerX, y + 32)
    y += 64
  }

  // 描述文本
  if (descText) {
    ctx.fillStyle = pal.text
    ctx.font = '24px sans-serif'
    const lines = wrapText(ctx, descText, contentW)
    lines.forEach((line) => {
      ctx.fillText(line, centerX, y)
      y += 36
    })
    y += 20
  }

  // 测评信息
  const metaLines = []
  if (testedTime) metaLines.push('测评于 ' + testedTime)
  if (retakeHint) metaLines.push(retakeHint)
  if (retestGap) metaLines.push('距上次重测 ' + retestGap)
  if (timeText) metaLines.push('用时 ' + timeText)
  if (metaLines.length) {
    ctx.fillStyle = pal.textFaint
    ctx.font = '20px sans-serif'
    metaLines.forEach((line) => {
      ctx.fillText(line, centerX, y)
      y += 28
    })
    y += 16
  }

  // 分隔线
  const drawDivider = () => {
    ctx.strokeStyle = pal.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(leftX, y)
    ctx.lineTo(rightX, y)
    ctx.stroke()
    y += 24
  }

  // 维度得分
  if (showGroups && groups && groups.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('维度得分', leftX, y)
    y += 40
    ctx.textAlign = 'center'
    groups.slice(0, 12).forEach((g) => {
      const label = g.label || ''
      const val = g.display || (g.percent != null ? g.percent + '%' : '')
      ctx.fillStyle = pal.textSoft
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label, leftX, y)
      ctx.fillStyle = pal.text
      ctx.textAlign = 'right'
      ctx.fillText(val, rightX, y)
      y += 30
      const barX = leftX
      const barW = contentW
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(barX, y, barW, 14)
      ctx.fillStyle = meta.color
      const pct = Math.min(100, g.percent || 0)
      ctx.fillRect(barX, y, (barW * pct) / 100, 14)
      y += 36
    })
    drawDivider()
  }

  // 双极维度
  if (showBipolar && dims && dims.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('类型维度', leftX, y)
    y += 40
    ctx.textAlign = 'center'
    dims.slice(0, 8).forEach((d) => {
      ctx.fillStyle = pal.textSoft
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText((d.leftName || '') + ' / ' + (d.rightName || ''), leftX, y)
      y += 32
      const barX = leftX
      const barW = contentW
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(barX, y, barW, 20)
      const leftPct = Math.min(100, d.leftPercent || 0)
      const rightPct = Math.min(100, d.rightPercent || 0)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillRect(barX, y, (barW * leftPct) / 100, 20)
      ctx.fillStyle = meta.color
      ctx.fillRect(barX + (barW * leftPct) / 100, y, (barW * rightPct) / 100, 20)
      ctx.fillStyle = pal.text
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(d.leftPercent + '%', barX + 10, y + 14)
      ctx.textAlign = 'right'
      ctx.fillText(d.rightPercent + '%', rightX - 10, y + 14)
      y += 36
      if (d.dominantDesc) {
        ctx.fillStyle = pal.textFaint
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(d.dominantDesc, centerX, y)
        y += 30
      }
      y += 10
    })
    drawDivider()
  }

  // 维度剖析
  if (showDims && dims && dims.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('维度剖析', leftX, y)
    y += 40
    ctx.textAlign = 'center'
    dims.slice(0, 12).forEach((d) => {
      const label = d.name || ''
      const pct = d.percent || 0
      ctx.fillStyle = pal.textSoft
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label, leftX, y)
      ctx.fillStyle = pal.text
      ctx.textAlign = 'right'
      ctx.fillText(pct + '%', rightX, y)
      y += 30
      const barX = leftX
      const barW = contentW
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(barX, y, barW, 14)
      ctx.fillStyle = meta.color
      ctx.fillRect(barX, y, (barW * Math.min(100, pct)) / 100, 14)
      y += 36
      if (d.text) {
        ctx.fillStyle = pal.textFaint
        ctx.font = '20px sans-serif'
        const lines = wrapText(ctx, d.text, contentW)
        lines.forEach((line) => {
          ctx.fillText(line, centerX, y)
          y += 28
        })
      }
      y += 10
    })
    drawDivider()
  }

  // 分测验表现
  if (showSubtests && subtests && subtests.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('分测验表现', leftX, y)
    y += 40
    ctx.textAlign = 'center'
    subtests.slice(0, 15).forEach((s) => {
      ctx.fillStyle = pal.textSoft
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(s.name || '', leftX, y)
      ctx.fillStyle = pal.text
      ctx.textAlign = 'right'
      ctx.fillText((s.correct || 0) + '/' + (s.total || 0), rightX, y)
      y += 30
      const barX = leftX
      const barW = contentW
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillRect(barX, y, barW, 14)
      ctx.fillStyle = meta.color
      const pct = Math.min(100, s.scalePercent || 0)
      ctx.fillRect(barX, y, (barW * pct) / 100, 14)
      y += 36
    })
    drawDivider()
  }

  // 结果解读
  if (interpretations && interpretations.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('结果解读', leftX, y)
    y += 40
    ctx.textAlign = 'center'
    interpretations.slice(0, 6).forEach((it) => {
      if (it.title) {
        ctx.fillStyle = pal.text
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(it.title, leftX, y)
        y += 36
      }
      if (it.text) {
        ctx.fillStyle = pal.textSoft
        ctx.font = '22px sans-serif'
        const lines = wrapText(ctx, it.text, contentW)
        lines.forEach((line) => {
          ctx.textAlign = 'left'
          ctx.fillText(line, leftX, y)
          y += 30
        })
      }
      y += 16
    })
    drawDivider()
  }

  // 历史趋势（简化绘制）
  if (showTrend && trendValues && trendValues.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('历史趋势（近 ' + trendValues.length + ' 次）', leftX, y)
    y += 40
    // 绘制简化趋势图
    const chartH = 140
    const chartY = y
    const pad = 30
    const cw = contentW - pad * 2
    const ch = chartH - pad * 2
    const vals = trendValues
    let min = Math.min.apply(null, vals)
    let max = Math.max.apply(null, vals)
    if (min === max) { min -= 1; max += 1 }
    const range = max - min
    const n = vals.length
    const xAt = (i) => leftX + pad + (n === 1 ? cw / 2 : (cw * i) / (n - 1))
    const yAt = (v) => chartY + pad + ch - ((v - min) / range) * ch

    ctx.strokeStyle = pal.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(leftX + pad, chartY + pad + ch)
    ctx.lineTo(leftX + pad + cw, chartY + pad + ch)
    ctx.stroke()

    ctx.strokeStyle = meta.color
    ctx.lineWidth = 3
    ctx.beginPath()
    vals.forEach((v, i) => {
      const x = xAt(i)
      const yy = yAt(v)
      if (i === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    })
    ctx.stroke()

    ctx.fillStyle = meta.color
    vals.forEach((v, i) => {
      const x = xAt(i)
      const yy = yAt(v)
      ctx.beginPath()
      ctx.arc(x, yy, 5, 0, Math.PI * 2)
      ctx.fill()
    })

    if (trendDates && trendDates.length === vals.length && vals.length <= 8) {
      ctx.fillStyle = pal.date
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      vals.forEach((v, i) => {
        ctx.fillText(trendDates[i], xAt(i), chartY + chartH - 4)
      })
    }

    y = chartY + chartH + 16

    if (trendDelta != null) {
      ctx.fillStyle = trendDelta > 0 ? '#22c55e' : trendDelta < 0 ? '#ef4444' : pal.textFaint
      ctx.font = '22px sans-serif'
      ctx.textAlign = 'center'
      const deltaText = '较上次 ' + (trendDelta > 0 ? '↑' : trendDelta < 0 ? '↓' : '→') + ' ' + (trendDelta > 0 ? '+' : '') + trendDelta
      ctx.fillText(deltaText, centerX, y)
      y += 28
    }
    if (firstValue != null && lastValue != null) {
      ctx.fillStyle = pal.textFaint
      ctx.font = '20px sans-serif'
      ctx.fillText('首次 ' + firstValue + ' → 最近 ' + lastValue + '（' + (rangeDelta > 0 ? '+' : '') + rangeDelta + '）', centerX, y)
      y += 28
    }
    drawDivider()
  } else if (catList && catList.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('历史记录（共 ' + catList.length + ' 次）', leftX, y)
    y += 40
    if (firstSummary && lastSummary && firstSummary !== lastSummary) {
      ctx.fillStyle = pal.textFaint
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('首次 ' + firstSummary + ' → 最近 ' + lastSummary, centerX, y)
      y += 36
    }
    ctx.textAlign = 'center'
    catList.slice(0, 10).forEach((c) => {
      ctx.fillStyle = pal.text
      ctx.font = '22px sans-serif'
      ctx.fillText(c.summary || '', centerX, y)
      y += 30
      ctx.fillStyle = pal.textFaint
      ctx.font = '18px sans-serif'
      ctx.fillText(c.timeText || '', centerX, y)
      y += 36
    })
    drawDivider()
  }

  // 相关方法论
  if (recommend && recommend.length) {
    ctx.fillStyle = pal.text
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('🧰 相关方法论', leftX, y)
    y += 40
    ctx.textAlign = 'center'
    recommend.slice(0, 5).forEach((m) => {
      ctx.fillStyle = pal.text
      ctx.font = '24px sans-serif'
      ctx.fillText((m.icon || '') + ' ' + (m.name || ''), centerX, y)
      y += 34
      if (m.summary) {
        ctx.fillStyle = pal.textSoft
        ctx.font = '20px sans-serif'
        const lines = wrapText(ctx, m.summary, contentW)
        lines.forEach((line) => {
          ctx.fillText(line, centerX, y)
          y += 28
        })
      }
      y += 16
    })
    drawDivider()
  }

  // 特别说明
  if (noteText) {
    ctx.fillStyle = pal.textFaint
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    const lines = wrapText(ctx, noteText, contentW)
    lines.forEach((line) => {
      ctx.fillText(line, centerX, y)
      y += 28
    })
    y += 20
  }

  // 免责声明
  ctx.fillStyle = pal.textFaint
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  const disclaimer = '本结果基于自陈量表，仅供自我探索与学习参考，非标准化临床诊断工具，不构成医学或专业建议。'
  const discLines = wrapText(ctx, disclaimer, contentW)
  discLines.forEach((line) => {
    ctx.fillText(line, centerX, y)
    y += 26
  })
  y += 20

  // 品牌尾部
  ctx.fillStyle = pal.textFaint
  ctx.font = '20px sans-serif'
  ctx.fillText('心智探索局 · 测评 · 方法 · 训练', centerX, y)
  y += 40

  // 日期
  const dt = new Date()
  const date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate()
  ctx.fillStyle = pal.textFaint
  ctx.font = '20px sans-serif'
  ctx.fillText(date, centerX, y)

  if (measure) return y
  wx.canvasToTempFilePath({ canvas, success: (r) => done(r.tempFilePath), done: () => done(null) })
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split('')
  const lines = []
  let currentLine = ''
  words.forEach((ch) => {
    const testLine = currentLine + ch
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = ch
    } else {
      currentLine = testLine
    }
  })
  if (currentLine) lines.push(currentLine)
  return lines
}

module.exports = { canvasPalette, renderTrend, renderCard, renderContentCard, renderFullPageCard, makeMeasureCtx }
