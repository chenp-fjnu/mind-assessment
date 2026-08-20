const { getMetaList, TYPE_LABELS, modulesByType } = require('../../utils/registry')

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
  },
  onLoad() {
    const allModules = buildModuleList()
    const types = Object.keys(TYPE_LABELS)
      .filter((t) => allModules.some((m) => m.type === t))
      .map((t) => ({ type: t, label: TYPE_LABELS[t] }))
    this.setData({ allModules, types, groups: buildGroups(allModules) })
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
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },
  goAllHistory() {
    wx.switchTab({ url: '/pages/history/history' })
  },
  goAbout() {
    wx.switchTab({ url: '/pages/about/about' })
  },
})
