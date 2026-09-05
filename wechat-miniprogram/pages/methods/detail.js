const methodsData = require('../../utils/methods-data')
const { genCard, saveToAlbum } = require('../../utils/share')
const { useTheme } = require('../../utils/theme-store')
const SK = require('../../utils/storage-keys')
const { renderTrend } = require('../../utils/canvas')
const { getDpr } = require('../../utils/device')

// 互动练习趋势：取首个数值（scale）字段的「首次 → 最近」对比（练习记录按时间倒序存储）
function buildPracticeTrend(method) {
  if (!method || !method.interactive) return null
  const schema = method.schema || []
  const scaleField = schema.find((f) => f.type === 'scale')
  if (!scaleField) return null
  const stored = wx.getStorageSync(SK.PRACTICES) || {}
  const entries = (stored[method.id] || []).slice().reverse() // 正序：最早在前
  const vals = entries
    .map((e) => e.data && e.data[scaleField.key])
    .filter((v) => v !== undefined && v !== null && v !== '' && !isNaN(Number(v)))
    .map(Number)
  if (vals.length < 2) return null
  const first = vals[0]
  const last = vals[vals.length - 1]
  const delta = last - first
  // 生成日期标签
  const dates = entries
    .filter((e) => e.data && e.data[scaleField.key] !== undefined && e.data[scaleField.key] !== null && e.data[scaleField.key] !== '' && !isNaN(Number(e.data[scaleField.key])))
    .map((e) => {
      const d = new Date(e.time)
      return (d.getMonth() + 1) + '-' + d.getDate()
    })
  return {
    fieldLabel: scaleField.label,
    first,
    last,
    delta: delta > 0 ? '+' + delta : '' + delta,
    direction: delta > 0 ? '↑' : delta < 0 ? '↓' : '→',
    count: vals.length,
    values: vals,
    dates,
  }
}

Page({
  data: {
    method: null,
    isInteractive: false,
    content: [],
    steps: [],
    practiceTrend: null,
  },
  onLoad(query) {
    useTheme(this)
    const id = query.id
    const method = methodsData.getMethod(id)
    if (!method) {
      this.setData({ method: null })
      return
    }
    wx.setNavigationBarTitle({ title: method.name })
    this._id = id
    const steps = (method.steps || []).map((s) => ({
      text: s,
      showNo: !/^[a-zA-Z]/.test(s),
    }))
    this.setData({
      method,
      isInteractive: !!method.interactive,
      content: method.content || [],
      steps,
      practiceTrend: buildPracticeTrend(method),
    }, () => {
      this.drawPracticeTrend()
    })
  },
  onShow() {
    if (this._id) {
      const m = methodsData.getMethod(this._id)
      this.setData({ practiceTrend: buildPracticeTrend(m) }, () => {
        this.drawPracticeTrend()
      })
    }
  },
  drawPracticeTrend() {
    const trend = this.data.practiceTrend
    if (!trend || !trend.values || trend.values.length < 2) return
    const dpr = getDpr()
    wx.createSelectorQuery()
      .in(this)
      .select('#practiceTrendCanvas')
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
        renderTrend(ctx, W, H, {
          values: trend.values,
          color: this.data.method?.color || '#0891b2',
          dates: trend.dates,
        })
      })
  },
  goPractice() {
    wx.navigateTo({ url: '/pages/methods/practice?id=' + this._id })
  },
  goBack() {
    wx.navigateBack({ delta: 1 })
  },
  onReady() {
    const m = this.data.method
    if (!m) return
    genCard(this, {
      color: m.color,
      icon: m.icon,
      title: m.name,
      subtitle: m.summary,
      lines: (m.content || []).slice(0, 3).map((c, i) => ({ label: (i + 1) + '. ' + (c.text || '').slice(0, 14), value: '' })),
      footer: '心智探索局 · 方法卡片',
    }, (p) => { this._shareImage = p })
  },
  onShareAppMessage() {
    const m = this.data.method
    if (!m) return {}
    return {
      title: '推荐一个方法：' + m.name,
      path: '/pages/methods/detail?id=' + this._id,
      imageUrl: this._shareImage || '',
    }
  },
  onShareTimeline() {
    const m = this.data.method
    if (!m) return {}
    return {
      title: '推荐一个方法：' + m.name,
      imageUrl: this._shareImage || '',
    }
  },
  saveCard() {
    const m = this.data.method
    if (!m) return
    wx.showLoading({ title: '生成中' })
    genCard(this, {
      color: m.color,
      icon: m.icon,
      title: m.name,
      subtitle: m.summary,
      lines: (m.content || []).slice(0, 3).map((c, i) => ({ label: (i + 1) + '. ' + (c.text || '').slice(0, 14), value: '' })),
      footer: '心智探索局 · 方法卡片',
    }, (p) => {
      wx.hideLoading()
      saveToAlbum(p)
    })
  },
})
