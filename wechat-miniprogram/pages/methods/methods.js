const methodsData = require('../../utils/methods-data')
const { hexToRgba } = require('../../utils/color')
const { useTheme } = require('../../utils/theme-store')
const SK = require('../../utils/storage-keys')
const { getListRecommendations } = require('../../utils/list-recommendations')

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
    newcomerMethods: [],
    recommendedMethods: [],
    showAll: false,
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
    this.refreshRecommendations()
    this.refreshRecords()
  },
  onShow() {
    this.refreshRecords()
    this.refreshRecommendations()
  },
  refreshRecords() {
    const practices = wx.getStorageSync(SK.PRACTICES) || {}
    let methodRecordCount = 0
    Object.keys(practices).forEach((k) => { methodRecordCount += (practices[k] || []).length })
    this.setData({ methodRecordCount })
  },
  refreshRecommendations() {
    const goalValue = wx.getStorageSync(SK.USER_GOAL)
    const goal = typeof goalValue === 'string' ? goalValue : ''
    const picks = getListRecommendations(
      'method',
      this.data.allMethods,
      goal,
      ['pomodoro', 'mindful', 'smart', 'abc'],
      ['flow', 'threegood', 'grow'],
      3
    )
    this.setData({ newcomerMethods: picks.newcomer, recommendedMethods: picks.recommended })
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
    this.setData({ activeCategory: e.currentTarget.dataset.category, showAll: false }, () => this.applyFilter())
  },
  showAllMethods() {
    this.setData({ showAll: true })
  },
  showRecommendations() {
    this.setData({ showAll: false, activeCategory: '', keyword: '' }, () => this.applyFilter())
  },
  goCourses() {
    const storedGoal = wx.getStorageSync(SK.USER_GOAL)
    const goal = typeof storedGoal === 'string' ? storedGoal : 'browse'
    wx.navigateTo({ url: '/pages/course/list?goal=' + goal })
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/methods/detail?id=${id}` })
  },
  goRecords() {
    wx.navigateTo({ url: '/pages/history/history?tab=method' })
  },
  onShareAppMessage() {
    return {
      title: '精选方法库 - 实用心智工具与思维模型',
      path: '/pages/methods/methods',
    }
  },
  onShareTimeline() {
    return {
      title: '精选方法库 - 实用心智工具与思维模型',
    }
  },
})
