const methodsData = require('../../utils/methods-data')

function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return 'rgba(100,116,139,0.12)'
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildList() {
  return methodsData.METHODS.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) }))
}

function buildGroups(list) {
  const map = {}
  list.forEach((m) => {
    if (!map[m.category]) map[m.category] = []
    map[m.category].push(m)
  })
  return Object.keys(map).map((category) => ({ category, list: map[category] }))
}

Page({
  data: {
    groups: [],
    categories: [],
    allMethods: [],
    keyword: '',
    activeCategory: '',
    count: 0,
    interactiveCount: 0,
  },
  onLoad() {
    const allMethods = buildList()
    const seen = {}
    const categories = []
    allMethods.forEach((m) => {
      if (!seen[m.category]) {
        seen[m.category] = true
        categories.push({ category: m.category, label: m.category })
      }
    })
    this.setData({
      allMethods,
      categories,
      groups: buildGroups(allMethods),
      count: allMethods.length,
      interactiveCount: allMethods.filter((m) => m.interactive).length,
    })
  },
  applyFilter() {
    const { allMethods, keyword, activeCategory } = this.data
    const kw = (keyword || '').trim().toLowerCase()
    const list = allMethods.filter((m) => {
      if (activeCategory && m.category !== activeCategory) return false
      if (kw) {
        const hay = (m.name + ' ' + m.summary + ' ' + m.category).toLowerCase()
        if (hay.indexOf(kw) === -1) return false
      }
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
  onCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category }, () => this.applyFilter())
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/methods/detail?id=${id}` })
  },
})
