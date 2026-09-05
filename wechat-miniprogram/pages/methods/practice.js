const methodsData = require('../../utils/methods-data')
const { useTheme } = require('../../utils/theme-store')
const { getUserId } = require('../../utils/user')
const SK = require('../../utils/storage-keys')
const { renderTrend } = require('../../utils/canvas')
const { getDpr } = require('../../utils/device')

const STORE_KEY = SK.PRACTICES

// 计算练习趋势
function computePracticeTrend(method, schema) {
  if (!method || !method.interactive) return null
  const scaleField = (schema || []).find((f) => f.type === 'scale')
  if (!scaleField) return null
  const stored = wx.getStorageSync(STORE_KEY) || {}
  const entries = (stored[method.id] || []).slice().reverse() // 正序
  const vals = entries
    .map((e) => e.data && e.data[scaleField.key])
    .filter((v) => v !== undefined && v !== null && v !== '' && !isNaN(Number(v)))
    .map(Number)
  if (vals.length < 2) return null
  const first = vals[0]
  const last = vals[vals.length - 1]
  const delta = last - first
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
    mode: 'hub',
    method: null,
    isInteractive: false,
    formFields: [],
    practices: [],
    list: [],
    themeClass: 'theme-light',
  },
  onLoad(query) {
    useTheme(this)
    if (query && query.id) {
      this.loadForm(query.id)
    } else {
      this.loadHub()
    }
  },
  loadHub() {
    const list = methodsData.METHODS.filter((m) => m.interactive).map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      color: m.color,
      summary: m.summary,
    }))
    wx.setNavigationBarTitle({ title: '互动练习' })
    this.setData({ mode: 'hub', list })
  },
  loadForm(id) {
    const method = methodsData.getMethod(id)
    if (!method) {
      this.setData({ mode: 'form', method: null })
      return
    }
    const schema = method.schema || []
    const formFields = schema.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      min: f.min,
      max: f.max,
      value: f.type === 'scale' ? (f.min != null ? f.min : 1) : '',
    }))
    const form = {}
    schema.forEach((f) => {
      form[f.key] = f.type === 'scale' ? (f.min != null ? f.min : 1) : ''
    })
    const stored = wx.getStorageSync(STORE_KEY) || {}
    const practices = (stored[id] || []).map((entry) => this.decorate(entry, schema))
    const practiceTrend = computePracticeTrend(method, schema)
    wx.setNavigationBarTitle({ title: method.name })
    this._id = id
    this._schema = schema
    this._form = form
    this.setData({
      mode: 'form',
      method,
      isInteractive: !!method.interactive,
      formFields,
      practices,
      practiceTrend,
    }, () => {
      this.drawPracticeTrend()
    })
  },
  decorate(entry, schema) {
    const d = new Date(entry.time)
    const p2 = (n) => (n < 10 ? '0' + n : '' + n)
    const timeText =
      d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) +
      ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes())
    const fields = schema.map((f) => ({ key: f.key, label: f.label, value: entry.data[f.key] }))
    return { time: entry.time, timeText, fields }
  },
  onInput(e) {
    const key = e.currentTarget.dataset.key
    const idx = e.currentTarget.dataset.idx
    this._form[key] = e.detail.value
    this.setData({ ['formFields[' + idx + '].value']: e.detail.value })
  },
  onScale(e) {
    const key = e.currentTarget.dataset.key
    const idx = e.currentTarget.dataset.idx
    const v = e.detail.value
    this._form[key] = v
    this.setData({ ['formFields[' + idx + '].value']: v })
  },
  savePractice() {
    const id = this._id
    const schema = this._schema
    const form = this._form
    const stored = wx.getStorageSync(STORE_KEY) || {}
    const list = stored[id] || []
    list.unshift({
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      time: Date.now(),
      data: Object.assign({}, form),
      userId: getUserId(),
    })
    if (list.length > 50) list.length = 50
    stored[id] = list
    wx.setStorageSync(STORE_KEY, stored)
    const practices = list.map((entry) => this.decorate(entry, schema))
    const practiceTrend = computePracticeTrend(this.data.method, schema)
    this.setData({ practices, practiceTrend }, () => {
      this.drawPracticeTrend()
    })
    wx.showToast({ title: '已保存', icon: 'success' })
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
  goForm(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({ url: '/pages/methods/practice?id=' + id })
  },
  goBack() {
    wx.navigateBack({ delta: 1 })
  },
  onShareAppMessage() {
    if (this.data.mode === 'hub') {
      return {
        title: '互动练习 - 选一个方法，马上开始填写练习',
        path: '/pages/methods/practice',
      }
    }
    if (this.data.method) {
      return {
        title: '互动练习：「' + this.data.method.name + '」- 来一起练习吧',
        path: '/pages/methods/practice?id=' + this._id,
      }
    }
    return {}
  },
  onShareTimeline() {
    if (this.data.mode === 'hub') {
      return { title: '互动练习 - 选一个方法，马上开始填写练习' }
    }
    if (this.data.method) {
      return { title: '互动练习：「' + this.data.method.name + '」- 来一起练习吧' }
    }
    return {}
  },
})
