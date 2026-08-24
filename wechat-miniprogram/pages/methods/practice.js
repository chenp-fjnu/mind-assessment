const methodsData = require('../../utils/methods-data')
const { useTheme } = require('../../utils/theme-store')

const STORE_KEY = 'ma_practices'

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
    })
    if (list.length > 50) list.length = 50
    stored[id] = list
    wx.setStorageSync(STORE_KEY, stored)
    this.setData({ practices: list.map((entry) => this.decorate(entry, schema)) })
    wx.showToast({ title: '已保存', icon: 'success' })
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
