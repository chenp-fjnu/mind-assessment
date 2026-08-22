const { getModule } = require('../../utils/registry')
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

Page({
  data: {
    all: [],
    list: [],
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
    this.setData({ all, filters, list })
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
  clearAll() {
    if (!this.data.list.length) return
    wx.showModal({
      title: '清空全部记录',
      content: '确定清空所有测评记录吗？此操作不可恢复。',
      success: (r) => {
        if (r.confirm) {
          wx.removeStorageSync('ma_history')
          this.setData({ all: [], list: [], filters: [], active: '' })
        }
      },
    })
  },
  exportAll() {
    const all = wx.getStorageSync('ma_history') || []
    if (!all.length) {
      wx.showToast({ title: '暂无记录', icon: 'none' })
      return
    }
    withPrivacy(() => {
      wx.setClipboardData({
        data: JSON.stringify(all, null, 2),
        success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'none' }),
      })
    })
  },
})
