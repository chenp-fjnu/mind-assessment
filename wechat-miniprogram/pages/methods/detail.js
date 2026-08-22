const methodsData = require('../../utils/methods-data')

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
})
