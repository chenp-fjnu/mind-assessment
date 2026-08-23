const methodsData = require('../../utils/methods-data')
const { hexToRgba } = require('../../utils/color')
const { useTheme } = require('../../utils/theme-store')

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
    categoryCount: 0,
    methodRecordCount: 0,
  },
  onLoad() {
    useTheme(this)
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
      categoryCount: categories.length,
    })
    this.refreshRecords()
  },
  onShow() {
    this.refreshRecords()
  },
  refreshRecords() {
    const practices = wx.getStorageSync('ma_practices') || {}
    let methodRecordCount = 0
    Object.keys(practices).forEach((k) => { methodRecordCount += (practices[k] || []).length })
    this.setData({ methodRecordCount })
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
  goRecords() {
    wx.navigateTo({ url: '/pages/history/history?tab=method' })
  },
})
