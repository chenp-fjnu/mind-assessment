const { gamesByDim, DIM_LABELS } = require('../../utils/game-registry')
const { hexToRgba } = require('../../utils/color')
const trainStore = require('../../utils/train-store')
const { useTheme } = require('../../utils/theme-store')
const SK = require('../../utils/storage-keys')
const { getListRecommendations } = require('../../utils/list-recommendations')

const DIM_ORDER = ['attention', 'memory', 'reaction', 'relax', 'exec', 'logic']

function fmtBest(value, unit) {
  if (value == null) return '暂无记录'
  return '最佳 ' + value + (unit || '')
}

Page({
  data: {
    groups: [],
    keyword: '',
    filteredGroups: [],
    typeChips: [],
    activeDim: '',
    gameCount: 0,
    dimCount: 0,
    recordCount: 0,
    newcomerGames: [],
    recommendedGames: [],
    recommendationTitle: '',
    showAll: false,
  },
  onLoad() {
    useTheme(this)
    const byDim = gamesByDim()
    const groups = DIM_ORDER.filter((d) => byDim[d]).map((d) => ({
      dim: d,
      dimLabel: DIM_LABELS[d] || d,
      games: byDim[d].map((g) => {
        const best = trainStore.bestOverall(g.id, g.levels, g.metric.better)
        return {
          id: g.id,
          name: g.name,
          icon: g.icon,
          color: g.color,
          desc: g.desc,
          tint: hexToRgba(g.color, 0.12),
          levelCount: (g.levels || []).length,
          bestText: fmtBest(best, g.metric.unit),
        }
      }),
    }))
    const typeChips = [{ key: '', label: '全部' }].concat(
      DIM_ORDER.filter((d) => byDim[d]).map((d) => ({ key: d, label: DIM_LABELS[d] || d }))
    )
    this.setData({
      groups,
      typeChips,
      filteredGroups: groups,
    })
    this.refreshRecommendations()
    this.refreshStats()
    this.applyFilter()
  },
  onShow() {
    // 返回列表时刷新最佳成绩
    const groups = this.data.groups.map((grp) => ({
      ...grp,
      games: grp.games.map((g) => {
        const meta = gamesByDim()
        const raw = meta[grp.dim].find((x) => x.id === g.id)
        const best = trainStore.bestOverall(g.id, raw.levels, raw.metric.better)
        return { ...g, bestText: fmtBest(best, raw.metric.unit) }
      }),
    }))
    this.setData({ groups })
    this.refreshRecommendations()
    this.refreshStats()
    this.applyFilter()
  },
  refreshStats() {
    const groups = this.data.groups
    const gameCount = groups.reduce((s, g) => s + g.games.length, 0)
    const dimCount = groups.length
    const recordCount = trainStore.allRecords().length
    this.setData({ gameCount, dimCount, recordCount })
  },
  refreshRecommendations() {
    const allGames = this.data.groups.reduce((list, group) => list.concat(group.games), [])
    const goalValue = wx.getStorageSync(SK.USER_GOAL)
    const goal = typeof goalValue === 'string' ? goalValue : ''
    const picks = getListRecommendations(
      'train',
      allGames,
      goal,
      ['schulte', 'memory-match', 'whack', 'visual-search'],
      ['n-back', 'reaction-time', 'cps'],
      3
    )
    this.setData({
      newcomerGames: picks.newcomer,
      recommendedGames: picks.recommended,
      recommendationTitle: picks.recommendationTitle,
    })
  },
  onSearch(e) {
    this.setData({ keyword: e.detail.value })
    this.applyFilter()
  },
  clearSearch() {
    this.setData({ keyword: '' })
    this.applyFilter()
  },
  onSelectDim(e) {
    this.setData({ activeDim: e.currentTarget.dataset.key, showAll: false })
    this.applyFilter()
  },
  showAllGames() {
    this.setData({ showAll: true })
  },
  showRecommendations() {
    this.setData({ showAll: false, activeDim: '', keyword: '' })
    this.applyFilter()
  },
  goCourses() {
    const storedGoal = wx.getStorageSync(SK.USER_GOAL)
    const goal = typeof storedGoal === 'string' ? storedGoal : 'browse'
    wx.navigateTo({ url: '/pages/course/list?goal=' + goal })
  },
  applyFilter() {
    const { groups, keyword, activeDim } = this.data
    const kw = (keyword || '').trim().toLowerCase()
    const filtered = groups
      .filter((grp) => !activeDim || grp.dim === activeDim)
      .map((grp) => ({
        ...grp,
        games: grp.games.filter((g) => {
          if (!kw) return true
          return (g.name + g.desc).toLowerCase().indexOf(kw) >= 0
        }),
      }))
      .filter((grp) => grp.games.length > 0)
    this.setData({ filteredGroups: filtered })
  },
  goGame(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/train/game?gameId=' + id })
  },
  goRecords() {
    wx.navigateTo({ url: '/pages/history/history?tab=train' })
  },
  onShareAppMessage() {
    return {
      title: '脑力训练｜试试注意力、记忆与反应小游戏',
      path: '/pages/train/train',
    }
  },
  onShareTimeline() {
    return {
      title: '脑力训练｜试试注意力、记忆与反应小游戏',
    }
  },
})
