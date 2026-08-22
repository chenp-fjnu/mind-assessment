const { getModule } = require('../../utils/registry')
const methodsData = require('../../utils/methods-data')
const { withPrivacy } = require('../../utils/privacy')

function fmt(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return (
    d.getFullYear() +
    '-' +
    p(d.getMonth() + 1) +
    '-' +
    p(d.getDate()) +
    ' ' +
    p(d.getHours()) +
    ':' +
    p(d.getMinutes())
  )
}

function buildMethodRecords() {
  const stored = wx.getStorageSync('ma_practices') || {}
  const out = []
  Object.keys(stored).forEach((mid) => {
    const m = methodsData.getMethod(mid)
    if (!m) return
    ;(stored[mid] || []).forEach((entry) => {
      const schema = m.schema || []
      const fields = schema.map((f) => ({ label: f.label, value: (entry.data || {})[f.key] || '' }))
      out.push({
        mid,
        rid: entry.id,
        name: m.name,
        icon: m.icon,
        time: entry.time,
        timeText: fmt(entry.time),
        fields,
      })
    })
  })
  out.sort((a, b) => b.time - a.time)
  return out
}

Page({
  data: {
    tab: 'assess',
    all: [],
    list: [],
    mList: [],
    filters: [],
    active: '',
  },
  onShow() {
    this.load()
  },
  load() {
    const hist = wx.getStorageSync('ma_history') || []
    const all = hist.map((h) => ({
      id: h.id,
      rid: h.rid,
      name: h.name,
      icon: h.icon,
      summary: h.summary || '',
      level: h.level || '',
      time: h.time,
      timeText: fmt(h.time),
      answers: h.answers,
    }))
    const map = {}
    all.forEach((h) => {
      if (!map[h.id]) map[h.id] = { id: h.id, name: h.name, icon: h.icon }
    })
    const filters = [{ id: '', name: '全部', icon: '🗂' }].concat(Object.keys(map).map((k) => map[k]))
    const active = this.data.active
    const list = active ? all.filter((h) => h.id === active) : all
    const mList = buildMethodRecords()
    this.setData({ all, filters, list, mList })
  },
  onTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab })
  },
  onFilter(e) {
    const id = e.currentTarget.dataset.id
    const list = id ? this.data.all.filter((h) => h.id === id) : this.data.all
    this.setData({ active: id, list })
  },
  open(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.list[idx]
    if (!item) return
    getApp().globalData.lastResult = { id: item.id, answers: item.answers }
    wx.navigateTo({ url: '/pages/result/result?id=' + item.id })
  },
  openMethod(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.mList[idx]
    if (!item) return
    wx.navigateTo({ url: '/pages/methods/detail?id=' + item.mid })
  },
  deleteOne(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.list[idx]
    if (!item) return
    wx.showModal({
      title: '删除记录',
      content: '确定删除「' + item.name + '」的该条记录吗？',
      success: (r) => {
        if (!r.confirm) return
        const hist = wx.getStorageSync('ma_history') || []
        const next = hist.filter((h) => {
          if (item.rid) return h.rid !== item.rid
          return h.time !== item.time // 兼容无 rid 的旧数据
        })
        wx.setStorageSync('ma_history', next)
        this.setData({ active: '' })
        this.load()
      },
    })
  },
  deleteMethodOne(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.mList[idx]
    if (!item) return
    wx.showModal({
      title: '删除记录',
      content: '确定删除「' + item.name + '」的这条练习吗？',
      success: (r) => {
        if (!r.confirm) return
        const stored = wx.getStorageSync('ma_practices') || {}
        const list = (stored[item.mid] || []).filter((x) => x.id !== item.rid)
        if (list.length) stored[item.mid] = list
        else delete stored[item.mid]
        wx.setStorageSync('ma_practices', stored)
        this.load()
      },
    })
  },
  clearAll() {
    const isMethod = this.data.tab === 'method'
    const list = isMethod ? this.data.mList : this.data.list
    if (!list.length) return
    wx.showModal({
      title: '清空全部记录',
      content: isMethod
        ? '确定清空所有方法练习记录吗？此操作不可恢复。'
        : '确定清空所有测评记录吗？此操作不可恢复。',
      success: (r) => {
        if (r.confirm) {
          if (isMethod) wx.removeStorageSync('ma_practices')
          else wx.removeStorageSync('ma_history')
          this.load()
        }
      },
    })
  },
  exportAll() {
    const isMethod = this.data.tab === 'method'
    const data = isMethod
      ? wx.getStorageSync('ma_practices') || {}
      : wx.getStorageSync('ma_history') || []
    const empty = isMethod ? !Object.keys(data).length : !data.length
    if (empty) {
      wx.showToast({ title: '暂无记录', icon: 'none' })
      return
    }
    withPrivacy(() => {
      wx.setClipboardData({
        data: JSON.stringify(data, null, 2),
        success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'none' }),
      })
    })
  },
})
