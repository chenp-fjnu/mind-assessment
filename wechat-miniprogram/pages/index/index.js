const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const { hexToRgba } = require('../../utils/color')
const methodsData = require('../../utils/methods-data')
const gameReg = require('../../utils/game-registry')

function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

const FEATURED_ASSESS = ['big5', 'phq9', 'pss', 'mbti', 'sds', 'gad7']
const FEATURED_METHODS = ['smart', 'grow', 'woop', 'abc', 'threegood', 'fogg']
const FEATURED_GAMES = ['schulte', 'n-back', 'stroop', 'hanoi', 'box-breathing']

function buildModules() {
  const all = getMetaList().map((m) => ({
    id: m.id, type: m.type, typeLabel: TYPE_LABELS[m.type] || m.type, icon: m.icon, name: m.name, shortName: m.shortName,
    desc: m.desc, duration: m.duration, questionCount: m.questionCount,
    paid: m.paid, price: m.price, color: m.color, tint: hexToRgba(m.color, 0.12),
  }))
  const byId = {}
  all.forEach((m) => (byId[m.id] = m))
  const pick = (ids, pool, n) => ids.filter((id) => byId[id]).map((id) => byId[id]).concat(pool.filter((m) => ids.indexOf(m.id) < 0)).slice(0, n)
  return { all, featuredAssess: pick(FEATURED_ASSESS, all, 4) }
}

function buildMethods() {
  const all = methodsData.METHODS.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) }))
  const byId = {}
  all.forEach((m) => (byId[m.id] = m))
  const featured = FEATURED_METHODS.filter((id) => byId[id]).map((id) => byId[id]).concat(all.filter((m) => FEATURED_METHODS.indexOf(m.id) < 0)).slice(0, 4)
  return { all, featuredMethods: featured }
}

function buildGames() {
  const all = gameReg.getMetaList()
  const byId = {}
  all.forEach((g) => (byId[g.id] = g))
  const featured = FEATURED_GAMES.filter((id) => byId[id]).map((id) => {
    const g = byId[id]
    return {
      id: g.id,
      name: g.name,
      icon: g.icon,
      color: g.color,
      tint: hexToRgba(g.color, 0.12),
      dimLabel: g.dimLabel,
    }
  }).slice(0, 4)
  return { all, featuredGames: featured }
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
    resume: null,
  },
  onLoad() {
    const mod = buildModules()
    const met = buildMethods()
    const gam = buildGames()
    this.setData({
      moduleCount: mod.all.length,
      methodCount: met.all.length,
      practiceCount: met.all.filter((m) => m.interactive).length,
      gameCount: gam.all.length,
      dimCount: Object.keys(gameReg.DIM_LABELS).length,
      featuredAssess: mod.featuredAssess,
      featuredMethods: met.featuredMethods,
      featuredGames: gam.featuredGames,
    })
  },
  onShow() {
    this.refreshResume()
  },
  refreshResume() {
    const hist = wx.getStorageSync('ma_history') || []
    if (!hist.length) {
      if (this.data.resume) this.setData({ resume: null })
      return
    }
    const last = hist.slice().sort((a, b) => b.time - a.time)[0]
    this.setData({
      resume: { id: last.id, name: last.name, icon: last.icon, timeText: fmtTime(last.time) },
    })
  },
  goAssess() { wx.switchTab({ url: '/pages/assess/assess' }) },
  goMethods() { wx.switchTab({ url: '/pages/methods/methods' }) },
  goTrain() { wx.switchTab({ url: '/pages/train/train' }) },
  goDetail(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  goMethodDetail(e) { wx.navigateTo({ url: `/pages/methods/detail?id=${e.currentTarget.dataset.id}` }) },
  goGame(e) { wx.navigateTo({ url: `/pages/train/game?gameId=${e.currentTarget.dataset.id}` }) },
  goResume() {
    if (!this.data.resume) return
    wx.navigateTo({ url: `/pages/result/result?id=${this.data.resume.id}` })
  },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
})
