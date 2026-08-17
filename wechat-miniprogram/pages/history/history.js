const { getModule } = require('../../utils/registry')

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
    list: [],
  },
  onShow() {
    this.load()
  },
  load() {
    const hist = wx.getStorageSync('ma_history') || []
    this.setData({
      list: hist.map((h) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        summary: h.summary || '',
        level: h.level || '',
        time: h.time,
        timeText: fmt(h.time),
        answers: h.answers,
      })),
    })
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
        const next = hist.filter((h) => h.time !== item.time)
        wx.setStorageSync('ma_history', next)
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
          this.setData({ list: [] })
        }
      },
    })
  },
})
