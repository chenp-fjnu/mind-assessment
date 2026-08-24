const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const { hexToRgba } = require('../../utils/color')
const methodsData = require('../../utils/methods-data')
const gameReg = require('../../utils/game-registry')
const trainStore = require('../../utils/train-store')
const { useTheme } = require('../../utils/theme-store')

// 热门推荐配置：跨板块精选，按当前热度排序
const HOT_CONFIG = [
  // 测评类
  { kind: 'assess', id: 'mbti' },       // 社交破冰全民热点
  { kind: 'assess', id: 'holland' },    // 高考志愿/职业规划权威首选
  { kind: 'assess', id: 'big5' },       // 学术界黄金标准
  // 方法类
  { kind: 'method', id: 'smart' },      // 目标管理国民工具
  { kind: 'method', id: 'pomodoro' },   // 番茄工作法 国民级时间管理
  // 训练类
  { kind: 'train', id: 'schulte' },     // 注意力训练 国民级/飞行员背书
  { kind: 'train', id: 'n-back' },      // 唯一有RCT证据提升流体智力
]

// 渐变映射：匹配各页面的 Hero 渐变
const GRADIENT_MAP = {
  assess: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  method: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
  train: 'linear-gradient(135deg, #1e293b 0%, #f59e0b 100%)',
}

function buildHotPicks() {
  const modules = getMetaList()
  const methods = methodsData.METHODS
  const games = gameReg.getMetaList()
  return HOT_CONFIG.map((cfg) => {
    const src = cfg.kind === 'assess' ? modules : cfg.kind === 'method' ? methods : games
    const item = src.find((x) => x.id === cfg.id)
    if (!item) return null
    const kindLabel = { assess: '测评', method: '方法', train: '训练' }[cfg.kind]
    const tint = hexToRgba(item.color, 0.12)
    return {
      kind: cfg.kind,
      kindLabel,
      id: item.id,
      name: item.name,
      icon: item.icon,
      color: item.color,
      tint,
      desc: item.desc,
      gradient: GRADIENT_MAP[cfg.kind],
    }
  }).filter(Boolean)
}

function lastTimes() {
  const map = { assess: {}, method: {}, train: {} }
  const hist = wx.getStorageSync('ma_history') || []
  hist.forEach((h) => { map.assess[h.id] = Math.max(map.assess[h.id] || 0, h.time) })
  const practices = wx.getStorageSync('ma_practices') || {}
  Object.keys(practices).forEach((mid) => {
    ;(practices[mid] || []).forEach((e) => { map.method[mid] = Math.max(map.method[mid] || 0, e.time) })
  })
  trainStore.allRecords().forEach((r) => { map.train[r.gameId] = Math.max(map.train[r.gameId] || 0, r.time) })
  return map
}

function orderByRecent(list, lastMap) {
  return list
    .map((item) => ({ item, t: lastMap[item.id] || 0 }))
    .sort((a, b) => {
      const ax = a.t ? 1 : 0
      const bx = b.t ? 1 : 0
      if (ax !== bx) return bx - ax
      if (ax) return b.t - a.t
      return 0
    })
    .map((x) => x.item)
}

function buildModules(lastMap) {
  const all = getMetaList().map((m) => ({
    id: m.id, type: m.type, typeLabel: TYPE_LABELS[m.type] || m.type, icon: m.icon, name: m.name, shortName: m.shortName,
    desc: m.desc, duration: m.duration, questionCount: m.questionCount,
    color: m.color, tint: hexToRgba(m.color, 0.12),
  }))
  return { all, featuredAssess: orderByRecent(all, lastMap.assess).slice(0, 5) }
}

function buildMethods(lastMap) {
  const all = methodsData.METHODS.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) }))
  return { all, featuredMethods: orderByRecent(all, lastMap.method).slice(0, 5) }
}

function buildGames(lastMap) {
  const all = gameReg.getMetaList().map((g) => ({
    id: g.id, name: g.name, icon: g.icon, color: g.color, tint: hexToRgba(g.color, 0.12), dimLabel: g.dimLabel,
  }))
  return { all, featuredGames: orderByRecent(all, lastMap.train).slice(0, 5) }
}

Page({
  data: {
    moduleCount: 0,
    methodCount: 0,
    practiceCount: 0,
    gameCount: 0,
    dimCount: 0,
    featuredAssess: [],
    featuredMethods: [],
    featuredGames: [],
    hotPicks: [],
  },
  onLoad() {
    useTheme(this)
    this.loadFeatured()
  },
  onShow() {
    this.loadFeatured()
  },
  loadFeatured() {
    const lastMap = lastTimes()
    const mod = buildModules(lastMap)
    const met = buildMethods(lastMap)
    const gam = buildGames(lastMap)
    const hotPicks = buildHotPicks()
    const hotAssessCount = hotPicks.filter((h) => h.kind === 'assess').length
    this.setData({
      moduleCount: mod.all.length,
      methodCount: met.all.length,
      practiceCount: met.all.filter((m) => m.interactive).length,
      gameCount: gam.all.length,
      dimCount: Object.keys(gameReg.DIM_LABELS).length,
      featuredAssess: mod.featuredAssess,
      featuredMethods: met.featuredMethods,
      featuredGames: gam.featuredGames,
      hotPicks,
      hotAssessCount,
    })
  },
  goAssess() { wx.switchTab({ url: '/pages/assess/assess' }) },
  goMethods() { wx.switchTab({ url: '/pages/methods/methods' }) },
  goTrain() { wx.switchTab({ url: '/pages/train/train' }) },
  goDetail(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  goMethodDetail(e) { wx.navigateTo({ url: `/pages/methods/detail?id=${e.currentTarget.dataset.id}` }) },
  goGame(e) { wx.navigateTo({ url: `/pages/train/game?gameId=${e.currentTarget.dataset.id}` }) },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
  goHot(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return
    if (item.kind === 'assess') {
      wx.navigateTo({ url: `/pages/detail/detail?id=${item.id}` })
    } else if (item.kind === 'method') {
      wx.navigateTo({ url: `/pages/methods/detail?id=${item.id}` })
    } else if (item.kind === 'train') {
      wx.navigateTo({ url: `/pages/train/game?gameId=${item.id}` })
    }
  },
  onShareAppMessage() {
    return {
      title: '心智探索局 - 测评 · 方法 · 训练，陪你认识并锻炼心智',
      path: '/pages/index/index',
    }
  },
  onShareTimeline() {
    return {
      title: '心智探索局 - 测评 · 方法 · 训练，陪你认识并锻炼心智',
    }
  },
})