const { MODULES, TYPE_LABELS, modulesByType } = require('../../utils/registry')

function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

Page({
  data: {
    groups: [],
    history: [],
  },
  onLoad() {
    const map = modulesByType()
    const groups = Object.keys(map).map((type) => ({
      type,
      label: TYPE_LABELS[type] || type,
      list: map[type].map((m) => ({
        id: m.id,
        icon: m.icon,
        name: m.name,
        shortName: m.shortName,
        desc: m.desc,
        duration: m.duration,
        questionCount: m.questionCount,
        paid: m.paid,
        price: m.price,
        color: m.color,
      })),
    }))
    this.setData({ groups })
    this.loadHistory()
  },
  onShow() {
    this.loadHistory()
  },
  loadHistory() {
    const hist = wx.getStorageSync('ma_history') || []
    this.setData({ history: hist.slice(0, 5).map((h) => ({ ...h, timeText: fmtTime(h.time) })) })
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },
  goHistory(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.history[idx]
    if (!item) return
    getApp().globalData.lastResult = { id: item.id, answers: item.answers }
    wx.navigateTo({ url: `/pages/result/result?id=${item.id}` })
  },
  goAllHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  },
  clearHistory() {
    wx.showModal({
      title: '清空记录',
      content: '确定清空所有历史测评记录吗？',
      success: (r) => {
        if (r.confirm) {
          wx.removeStorageSync('ma_history')
          this.setData({ history: [] })
        }
      },
    })
  },
})
