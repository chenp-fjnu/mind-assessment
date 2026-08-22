const methodsData = require('../../utils/methods-data')
const { genCard, saveToAlbum } = require('../../utils/share')

const STORE_KEY = 'ma_practices'

Page({
  data: {
    method: null,
    isInteractive: false,
    formFields: [],
    content: [],
    practices: [],
  },
  onLoad(query) {
    const id = query.id
    const method = methodsData.getMethod(id)
    if (!method) {
      this.setData({ method: null })
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
    const list = stored[id] || []
    const practices = list.map((entry) => this.decorate(entry, schema))
    wx.setNavigationBarTitle({ title: method.name })
    this._id = id
    this._schema = schema
    this._form = form
    this.setData({
      method,
      isInteractive: !!method.interactive,
      formFields,
      content: method.content || [],
      practices,
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
    list.unshift({ id: Date.now() + '_' + Math.random().toString(36).slice(2, 8), time: Date.now(), data: Object.assign({}, form) })
    if (list.length > 50) list.length = 50 // 单方法最多保留 50 条
    stored[id] = list
    wx.setStorageSync(STORE_KEY, stored)
    this.setData({ practices: list.map((entry) => this.decorate(entry, schema)) })
    wx.showToast({ title: '已保存', icon: 'success' })
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
      title: '推荐一个心理学方法：' + m.name,
      path: '/pages/methods/detail?id=' + this._id,
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
