const { getModule } = require('../../utils/registry')
const { computeTrend } = require('../../utils/trend')
const { readableTextColor } = require('../../utils/color')
const { isDark } = require('../../utils/theme')
const { withPrivacy } = require('../../utils/privacy')

Page({
  data: {
    meta: {},
    invalid: false,
    primaryValue: '',
    primaryLabel: '',
    primaryColor: '#2563eb',
    levelText: '',
    levelColor: '',
    descText: '',
    groups: [],
    dims: [],
    subtests: [],
    interpretations: [],
    testedTime: '',
    retestGap: '',
    showGroups: false,
    showBipolar: false,
    showDims: false,
    showSubtests: false,
  },

  onLoad(query) {
    const app = getApp()
    let saved = app.globalData.lastResult
    let id = query.id || (saved && saved.id)
    if (!id) {
      this.setData({ invalid: true })
      return
    }
    const mod = getModule(id)
    if (!mod) {
      this.setData({ invalid: true })
      return
    }
    // 冷启动 / 直接进入兜底：从最近历史恢复答案
    if (!saved || !saved.answers) {
      const hist = (wx.getStorageSync('ma_history') || [])
        .filter((h) => h.id === id)
        .sort((a, b) => b.time - a.time)
      const qn = mod.getQuestions().length
      if (hist.length && hist[0].answers && hist[0].answers.length === qn) {
        saved = { id, answers: hist[0].answers }
      }
    }
    if (!saved || !saved.answers) {
      this.setData({ invalid: true })
      return
    }

    // 测评时间 / 距上次重测间隔
    const p2 = (n) => (n < 10 ? '0' + n : '' + n)
    const myHist = (wx.getStorageSync('ma_history') || [])
      .filter((h) => h.id === id)
      .sort((a, b) => b.time - a.time)
    let testedTime = ''
    let retestGap = ''
    if (myHist.length) {
      const t = new Date(myHist[0].time)
      testedTime =
        t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate()) +
        ' ' + p2(t.getHours()) + ':' + p2(t.getMinutes())
      if (myHist.length >= 2) {
        const gap = Math.round((myHist[0].time - myHist[1].time) / 86400000)
        retestGap = gap <= 0 ? '今天' : gap + ' 天前'
      }
    }

    this.dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2
    const questions = mod.getQuestions()
    const layout = mod.resultLayout || {}
    const primaryField = layout.primaryField || 'score'

    let r
    try {
      r = mod.computeResult(saved.answers, questions)
    } catch (e) {
      console.warn('[result] computeResult failed:', e)
      r = {}
    }
    if (r == null || r[primaryField] === undefined) {
      r = r || {}
      r[primaryField] = '—'
      r.description = r.description || '结果解析失败，请重新测评'
    }

    let timeText = ''
    if (r.totalTime != null && !isNaN(r.totalTime)) {
      const sec = Math.round(r.totalTime / 1000)
      timeText = sec >= 60 ? Math.floor(sec / 60) + ' 分 ' + (sec % 60) + ' 秒' : sec + ' 秒'
    }
    const NOTE_MAP = {
      spm: '本题为原创图形推理练习，按正确率换算近似推理水平，非标准化智力常模，仅供能力练习参考。',
      wechsler: '本题为原创分测验图形题，按正确率换算近似量表分，非标准化常模，仅供能力练习参考。',
    }
    const noteText = NOTE_MAP[mod.id] || ''

    const primaryValue = r[primaryField]
    const levelColor = r.levelColor || mod.color
    const descText = r.description || (r.trait && String(r.trait) !== String(primaryValue) ? r.trait : '')
    const levelText = r.level && String(r.level) !== String(primaryValue) ? r.level : '已完成'

    const hasBuildGroupList = typeof mod.buildGroupList === 'function'
    const groups = hasBuildGroupList ? safeCall(() => mod.buildGroupList(r, layout)) : []
    const subtests = typeof mod.buildSubtestList === 'function' ? safeCall(() => mod.buildSubtestList(r)) : []

    let dims = []
    let showBipolar = false
    if (typeof mod.buildScaleDimensionList === 'function') {
      dims = safeCall(() => mod.buildScaleDimensionList(r)) || []
      showBipolar = !!(dims && dims[0] && dims[0].leftPercent !== undefined)
    } else if (typeof mod.buildDimensionList === 'function') {
      dims = safeCall(() => mod.buildDimensionList(r)) || []
      showBipolar = !!(dims && dims[0] && dims[0].leftPercent !== undefined)
    } else if (r.dimensions) {
      dims = Object.keys(r.dimensions).map((k) => {
        const d = r.dimensions[k]
        return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }
      })
    }

    const interpretations =
      typeof mod.buildInterpretations === 'function'
        ? safeCall(() => mod.buildInterpretations(r, groups, dims)) || []
        : []

    // 同一量表的历史趋势（计算逻辑抽离至 utils/trend.js，便于单测）
    const t = computeTrend(wx.getStorageSync('ma_history'), id)
    const showTrend = t.showTrend
    const trendValues = t.trendValues
    const trendDelta = t.trendDelta
    const catList = t.catList
    const trendDates = t.trendDates

    const pv = primaryValue == null ? '' : String(primaryValue)
    const primarySize = pv.length <= 4 ? 'big' : pv.length <= 10 ? 'mid' : 'small'

    this.setData({
      meta: {
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
        colorText: readableTextColor(mod.color),
      },
      primaryValue: pv,
      primarySize,
      primaryLabel: layout.primaryLabel || '测评结果',
      primaryColor: mod.color,
      levelText,
      levelColor,
      levelColorText: readableTextColor(levelColor),
      descText,
      groups: groups || [],
      dims: dims || [],
      subtests: subtests || [],
      interpretations: interpretations || [],
      showGroups: !!(groups && groups.length),
      showBipolar,
      showDims: !!(dims && dims.length) && !showBipolar && !hasBuildGroupList,
      showSubtests: !!(subtests && subtests.length),
      showTrend,
      trendValues,
      trendDelta,
      catList,
      trendDates,
      testedTime,
      retestGap,
      timeText,
      noteText,
    }, () => {
      if (this.data.showTrend) this.drawTrend()
      this.drawCardToTemp((path) => {
        if (path) this._shareImage = path
      })
    })
    wx.setNavigationBarTitle({ title: mod.name + ' · 结果' })
  },

  drawTrend() {
    if (!this.data.showTrend) return
    const dpr = this.dpr || 2
    const dark = isDark()
    const gridColor = dark ? '#334155' : '#e2e8f0'
    const labelColor = dark ? '#cbd5e1' : '#475569'
    const dateColor = dark ? '#94a3b8' : '#64748b'
    wx.createSelectorQuery()
      .in(this)
      .select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, W, H)
        const vals = this.data.trendValues
        const color = this.data.meta.color
        const pad = 26
        const cw = W - pad * 2
        const ch = H - pad * 2
        let min = Math.min.apply(null, vals)
        let max = Math.max.apply(null, vals)
        if (min === max) {
          min -= 1
          max += 1
        }
        const range = max - min
        const n = vals.length
        const xAt = (i) => pad + (n === 1 ? cw / 2 : (cw * i) / (n - 1))
        const yAt = (v) => pad + ch - ((v - min) / range) * ch
        ctx.strokeStyle = gridColor
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
          ctx.fillStyle = labelColor
          ctx.fillText(String(v), x, y - 12)
        })
        // x 轴日期标签（点数较少时绘制，避免拥挤）
        if (trendDates && trendDates.length === vals.length && vals.length <= 8) {
          ctx.fillStyle = dateColor
          ctx.font = '15px sans-serif'
          vals.forEach((v, i) => {
            ctx.fillText(trendDates[i], xAt(i), H - 6)
          })
        }
      })
  },

  onReady() {
    this.dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2
    if (this.data.meta && this.data.meta.name) {
      this.drawCardToTemp((path) => {
        if (path) this._shareImage = path
      })
    }
  },

  drawCardToTemp(done) {
    const dpr = this.dpr || 2
    wx.createSelectorQuery()
      .in(this)
      .select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          done(null)
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'
        ctx.font = '28px sans-serif'
        ctx.fillText('心智探索局', W / 2, 70)
        ctx.fillStyle = this.data.meta.color
        ctx.font = '34px sans-serif'
        ctx.fillText(this.data.meta.name, W / 2, 130)
        ctx.fillStyle = '#fff'
        ctx.font = '72px sans-serif'
        ctx.fillText(this.data.primaryValue, W / 2, 250)
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.font = '26px sans-serif'
        ctx.fillText(this.data.primaryLabel, W / 2, 300)
        ctx.fillStyle = this.data.levelColor
        ctx.fillRect(W / 2 - 90, 330, 180, 46)
        ctx.fillStyle = this.data.levelColorText
        ctx.font = '26px sans-serif'
        ctx.fillText(this.data.levelText, W / 2, 362)
        // 维度条形（最多 8 个，仅含 percent 的维度）
        const dims = this.data.dims || []
        if (dims.length) {
          const startY = 430
          const rowH = 40
          const maxRows = Math.min(dims.length, 8)
          ctx.textAlign = 'left'
          for (let i = 0; i < maxRows; i++) {
            const d0 = dims[i]
            if (d0.percent == null) continue
            const y = startY + i * rowH
            ctx.fillStyle = 'rgba(255,255,255,0.85)'
            ctx.font = '20px sans-serif'
            ctx.fillText((d0.name || '').slice(0, 6), 40, y)
            const barX = 170
            const barW = 300
            ctx.fillStyle = 'rgba(255,255,255,0.18)'
            ctx.fillRect(barX, y - 14, barW, 14)
            ctx.fillStyle = this.data.meta.color
            ctx.fillRect(barX, y - 14, (barW * Math.min(100, d0.percent || 0)) / 100, 14)
            ctx.fillStyle = 'rgba(255,255,255,0.7)'
            ctx.textAlign = 'right'
            ctx.fillText((d0.percent || 0) + '%', barX + barW + 40, y)
            ctx.textAlign = 'left'
          }
          ctx.textAlign = 'center'
        }
        const d = new Date()
        const date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '22px sans-serif'
        ctx.fillText(date, W / 2, H - 40)
        wx.canvasToTempFilePath({
          canvas,
          success: (r) => done(r.tempFilePath),
          fail: () => done(null),
        })
      })
  },

  saveCard() {
    withPrivacy(() => {
      wx.showLoading({ title: '生成中' })
      this.drawCardToTemp((path) => {
        wx.hideLoading()
        if (!path) {
          wx.showToast({ title: '生成失败', icon: 'none' })
          return
        }
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: () => wx.showToast({ title: '已保存到相册' }),
          fail: (err) => {
            if (err && /auth|deny/i.test(err.errMsg || '')) {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置中允许保存到相册',
                confirmText: '去设置',
                success: (r) => {
                  if (r.confirm) wx.openSetting()
                },
              })
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' })
            }
          },
        })
      })
    })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  retest() {
    wx.redirectTo({ url: `/pages/test/test?id=${this.data.meta.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + '测评结果 - 心智探索局',
      path: '/pages/index/index',
      imageUrl: this._shareImage || '',
    }
  },
})

function safeCall(fn) {
  try {
    return fn()
  } catch (e) {
    console.warn('[result] build failed:', e)
    return []
  }
}
