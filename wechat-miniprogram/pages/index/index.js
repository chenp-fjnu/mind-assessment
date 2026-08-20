const { getMetaList, TYPE_LABELS, modulesByType } = require('../../utils/registry')

function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

// 将 #RRGGBB 转为带透明度的 rgba，兼容所有基础库（避免 8 位 hex 兼容性问题）
function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return 'rgba(100,116,139,0.12)'
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildModuleList() {
  return getMetaList().map((m) => ({
    id: m.id,
    type: m.type,
    icon: m.icon,
    name: m.name,
    shortName: m.shortName,
    desc: m.desc,
    duration: m.duration,
    questionCount: m.questionCount,
    paid: m.paid,
    price: m.price,
    color: m.color,
    tint: hexToRgba(m.color, 0.12),
    keywords: (m.name + ' ' + m.desc + ' ' + (m.tag || []).join(' ') + ' ' + (TYPE_LABELS[m.type] || '')).toLowerCase(),
  }))
}

function buildGroups(list) {
  const map = {}
  list.forEach((m) => {
    if (!map[m.type]) map[m.type] = []
    map[m.type].push(m)
  })
  return Object.keys(map).map((type) => ({
    type,
    label: TYPE_LABELS[type] || type,
    list: map[type],
  }))
}

Page({
  data: {
    groups: [],
    types: [],
    allModules: [],
    keyword: '',
    activeType: '',
    history: [],
  },
  onLoad() {
    const allModules = buildModuleList()
    const types = Object.keys(TYPE_LABELS)
      .filter((t) => allModules.some((m) => m.type === t))
      .map((t) => ({ type: t, label: TYPE_LABELS[t] }))
    this.setData({ allModules, types, groups: buildGroups(allModules) })
    this.loadHistory()
  },
  onShow() {
    this.loadHistory()
  },
  applyFilter() {
    const { allModules, keyword, activeType } = this.data
    const kw = (keyword || '').trim().toLowerCase()
    const list = allModules.filter((m) => {
      if (activeType && m.type !== activeType) return false
      if (kw && m.keywords.indexOf(kw) === -1) return false
      return true
    })
    this.setData({ groups: buildGroups(list) })
  },
  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.applyFilter())
  },
  clearSearch() {
    this.setData({ keyword: '' }, () => this.applyFilter())
  },
  onType(e) {
    this.setData({ activeType: e.currentTarget.dataset.type }, () => this.applyFilter())
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
    wx.switchTab({ url: '/pages/history/history' })
  },
  goAbout() {
    wx.switchTab({ url: '/pages/about/about' })
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
